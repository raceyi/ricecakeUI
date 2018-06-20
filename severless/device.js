let express = require('express');
let router = express.Router();
let gcm = require('node-gcm');
let async = require('async');
var https = require('https');

var AWS = require("aws-sdk");

AWS.config.loadFromPath('./dynamo.config.json');
AWS.config.update({region:'ap-northeast-2'});

var config=require("./fcm.config");

let API_KEY=config.API_KEY;

var docClient = new AWS.DynamoDB.DocumentClient();

router.putRegistrationId=function (registrationId,android){
        return new Promise((resolve,reject)=>{
                let params;
                if(android){
                    params={
                        TableName:"devices",
                        Item:{
                            "registrationId":registrationId,
                            "android":true
                        }
                    };
                }else{
                    params={
                        TableName:"devices",
                        Item:{
                            "registrationId":registrationId
                        }
                    };
                }
                console.log("putRegistrationId-params:"+JSON.stringify(params));

                docClient.put(params, function(err, data) {
                    if (err) {
                        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                        reject(err);
                    } else {
                        console.log("Added item:", JSON.stringify(data, null, 2));
                        resolve(data);
                    }
                });
        });   
}

removeRegistrationId=function(registrationId){
        return new Promise((resolve,reject)=>{

        var params = {
                TableName:"devices",
                Key:{
                       "registrationId":registrationId
                }
            };
            console.log("removeRegistrationId-params:"+JSON.stringify(params));  

            docClient.delete(params, function(err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
}

getRegistrationIds=function(){
    return new Promise((resolve,reject)=>{    
        let params = {
            TableName: "devices"
        };
        docClient.scan(params, function(err, data) {
            if (err) {
                console.error("Unable to get item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("item:", JSON.stringify(data, null, 2));
                resolve(data.Items);
            }
        });   
    });
}

sendGCM=function(params,next){
    console.log("sendGCM:"+JSON.stringify(params));

    let tableName=params.tableName;
    let pushId=params.pushId.registrationId;
    let android=params.pushId.android?true:false;
    let sender = new gcm.Sender(API_KEY);
    console.log("tableName content:"+tableName);
    let message;
    let data;

      if(params.registrationId){
          data={  
            table: tableName,
            registrationId:params.registrationId
        };
      }else{
        data={table:tableName};
      }

    if(!android){
      message = {
			"to" : pushId,  // 한번에 여러번 보내는것이 가능한가? 아마도 yes   to 대신에 topic을 명시하면된다?
			priority: 'high',
            collapseKey: 'takit',
            timeToLive: 3,
            "content_available": true,
            data: data,
            notification: {
                //title: "주문테이블 변경",
                //body: tableName
            }
        };

		var body = JSON.stringify(message);
		console.log(body);
        var options = {
                host: 'android.googleapis.com',
                port: 443,
                path: '/gcm/send',
                headers: {
                'Authorization': 'key='+API_KEY,
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': Buffer.byteLength(body)
                },
                method: 'POST'
        };
		
		console.log(options);
        var req = https.request(options, function(res){
                console.log("statusCode"+res.statusCode);
                var body = "";
                res.on('data', function(d) {
                    body += d;
                });
                res.on('end', function(d) {
                    console.log("body:"+body);
                    let response=JSON.parse(body);
                    if(response.results[0].error){
                        //body:{"multicast_id":7663920924350604473,"success":0,"failure":1,"canonical_ids":0,"results":[{"error":"NotRegistered"}]}
                        console.log("error is "+response.results[0].error);
                        console.log("please remove registrationId from table");
                        removeRegistrationId(pushId).then((value)=>{
                            console.log("removeRegistrationId "+pushId);
                            next(null,"removeRegistrationId");
                        },err=>{
                            console.log("removeRegistrationId "+pushId+" error");
                            next(null,"removeRegistrationId error");
                        })
                    }else if(res.statusCode==200){
                        console.log(JSON.parse(body));
                        next(null,"success"); 
                    }else{
                        console.log(null,"gcm:400");
                        next(null,"gcm:400");
                    }
                });
        });

		req.write(body);
        req.end();
        req.on('error', function(e){
            console.log("error");
            console.error(e);
            next(null,"unregister");  // Please check if error is unregistered id. 
        });
    }else{ //android
        console.log("send GCM into Android device");

        data["content-available"]=1;
        message = new gcm.Message({
            priority: 'high',
            collapseKey: 'takit',
            timeToLive: 3,
            data : data,
        });

            sender.send(message, {"registrationTokens":pushId}, 4, function (err, result) {
            if(err){
                console.log("err sender:"+JSON.stringify(err));
                //Please remove registrationId from DB.
                next(null,"unregister");
            }else{
                console.log("success sender:"+JSON.stringify(result));
                next(null,result);
            }
        });
    }
}

sendAndroidPush=function(params){ //string[]
    return new Promise((resolve,reject)=>{   
        let sender = new gcm.Sender(API_KEY);          
        console.log("send GCM into Android device "+JSON.stringify(params));
        let data;        
        //console.log("tableName:"+params.tableName);
        if(params.registrationId){
            data={  
                table: params.tableName,
                registrationId:params.registrationId
            };
        }else{
            data={table:params.tableName};
        }
        console.log("data:"+JSON.stringify(data));
        data["content-available"]=1;
        message = new gcm.Message({
            priority: 'high',
            collapseKey: 'takit',
            timeToLive: 3,
            data : data,
        });

        sender.send(message, {topic:"/topics/ricecake"}, 4, function (err, result) {
            if(err){
                console.log("err sender:"+JSON.stringify(err));
                reject("gcm:"+err);
            }else{
                console.log("success sender:"+JSON.stringify(result));
                resolve();
            }
        });
    });
}

sendiOSPush=function(params){
    return new Promise((resolve,reject)=>{         
        console.log("sendiOSPush:"+JSON.stringify(params));
        let tableName=params.tableName;
        let pushIds=params.pushIds;
        console.log("tableName content:"+tableName);
        let message;
        let data;

        if(params.registrationId){
            data={  
                table: tableName,
                registrationId:params.registrationId
            };
        }else{
            data={table:tableName};
        }

        message = {
                "to" : "/topics/ricecake",  
                priority: 'high',
                collapseKey: 'takit',
                timeToLive: 3,
                "content_available": true,
                data: data,
                notification: {
                    //title: "주문테이블 변경",
                    //body: tableName
                }
            };

            var body = JSON.stringify(message);
            console.log(body);
            var options = {
                    host: 'android.googleapis.com',
                    port: 443,
                    path: '/gcm/send',
                    headers: {
                    'Authorization': 'key='+API_KEY,
                    'Content-Type': 'application/json; charset=utf-8',
                    'Content-Length': Buffer.byteLength(body)
                    },
                    method: 'POST'
            };
            
            console.log(options);
            var req = https.request(options, function(res){
                    console.log("statusCode"+res.statusCode);
                    var body = "";
                    res.on('data', function(d) {
                        body += d;
                    });
                    res.on('end', function(d) {
                        console.log("body:"+body);
                        let response=JSON.parse(body);
                        if(res.statusCode==200){
                            console.log(JSON.parse(body));
                            resolve(); 
                        }else{
                            console.log(null,"gcm:400");
                            reject("gcm:400");
                        }
                    });
            });

            req.write(body);
            req.end();
            req.on('error', function(e){
                console.log("error");
                console.error(e);
                reject(e);   
            });
    });
}


router.notifyEach=function(name,registrationId){
    return new Promise((resolve,reject)=>{ 
        console.log("notifyAll comes!!!"+registrationId+"table:"+name);   
        getRegistrationIds().then(ids=>{
            let params=[];
            ids.forEach((id)=>{
                if(registrationId)
                    params.push({tableName:name,pushId:id,registrationId:registrationId});
                else
                    params.push({tableName:name,pushId:id});                    
            })
            console.log(JSON.stringify(params));
            async.map(params,sendGCM,function(err,eachResult){
                    if(err){
                        reject(err);
                    }else{
                        resolve();
                    }
                });
        },err=>{
            reject(err);
        })
    });
}

sendiPad=function(name,registrationId){
    return new Promise((resolve,reject)=>{ 
        console.log("sendiPad !!!"+registrationId+"table:"+name);   
        getRegistrationIds().then(ids=>{
            console.log("ids:"+JSON.stringify(ids));
            let pushId=[];
            ids.forEach(id=>{
                pushId.push(id.registrationId);
            });
            let data;
            if(registrationId){
                data={  
                    table: name,
                    registrationId:registrationId
                };
            }else{
                data={table:name};
            }
            console.log("!!!!pushdId:"+JSON.stringify(pushId));

            message = {
                    registration_ids:pushId, 
                    //registrationTokens : pushId,  // 한번에 여러번 보내는것이 가능한가? 아마도 yes   to 대신에 topic을 명시하면된다?
                    priority: 'high',
                    collapseKey: 'takit',
                    timeToLive: 3,
                    "content_available": true,
                    data: data,
                    notification: {
                        //title: "주문테이블 변경",
                        //body: tableName
                    }
                };

                var body = JSON.stringify(message);
                console.log(body);
                var options = {
                        host: 'android.googleapis.com',
                        port: 443,
                        path: '/gcm/send',
                        headers: {
                        'Authorization': 'key='+API_KEY,
                        'Content-Type': 'application/json; charset=utf-8',
                        'Content-Length': Buffer.byteLength(body)
                        },
                        method: 'POST'
                };
                
                console.log(options);
                var req = https.request(options, function(res){
                        console.log("statusCode"+res.statusCode);
                        var body = "";
                        res.on('data', function(d) {
                            body += d;
                        });
                        res.on('end', function(d) {
                            console.log("body:"+body);
                            let response=JSON.parse(body);
                            if(response.results[0].error){
                                console.log("error is "+response.results[0].error);
                            }else if(res.statusCode==200){
                                resolve(); 
                            }else{
                                console.log(null,"gcm:400");
                                reject("gcm:400");
                            }
                        });
                });

                req.write(body);
                req.end();
                req.on('error', function(e){
                    console.log("error");
                    console.error(e);
                    reject(e);  // Please check if error is unregistered id. 
                });
        });
    });
}

sendPhones=function(name,registrationId){
        let params={tableName:name,registrationId:registrationId};
         
        let android=sendAndroidPush(params);;
        let iOS=sendiOSPush(params);

        return Promise.all([android,iOS]);
};

router.notifyAll=function(name,registrationId){
     return new Promise((resolve,reject)=>{ 
   
        sendPhones(name,registrationId).then(()=>{
            /*
            sendiPad(name,registrationId).then(()=>{
                resolve();
            },err=>{
                reject();
            });
            */
            resolve();
        },err=>{
            /*
            sendiPad(name,registrationId).then(()=>{
                resolve();
            },err=>{
                reject();
            });
            */
            reject();        
        });
     });
};


//router.notifyEach("order");

//sendPhones("order");//???

//sendiPad("order");

//router.notifyAll("order");

module.exports = router;
/*
sendGCM("order","dJukzxDIaig:APA91bEEBcCUd8n0Gh8TaQdc61WnJt5Oza-1BxSfcwrAMIsaolX6ZCkhKn1JJJlD9dLXBWGa8rLkUVEOC69fEtzO5l_P7gxPxcw3kHoKOfoNcdlx9qYJG2F00rexSFQ-cxgmhGdIT9rw",function(err,result){
    if(err){
        console.log("sendGCM error "+JSON.stringify(err));
    }else
        console.log("success to send GCM "+JSON.stringify(err));    
});
*/

//router.putRegistrationId("dJukzxDIaig:APA91bEEBcCUd8n0Gh8TaQdc61WnJt5Oza-1BxSfcwrAMIsaolX6ZCkhKn1JJJlD9dLXBWGa8rLkUVEOC69fEtzO5l_P7gxPxcw3kHoKOfoNcdlx9qYJG2F00rexSFQ-cxgmhGdIT9rw");
