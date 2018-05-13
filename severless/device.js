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
			"to" : pushId,
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
                        console.log("error is "+response.results[0].err);
                        console.log("please remove registrationId from table");
                        removeRegistrationId(pushId).then((value)=>{
                            console.log("removeRegistrationId "+pushId);
                            next(null,"removeRegistrationId");
                        },err=>{
                            console.log("removeRegistrationId "+pushId+" error");
                            next(null,"removeRegistrationId error");
                        })
                    }
                    if(res.statusCode==200){
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
            next(null,"gcm:"+err);
            }else{
            console.log("success sender:"+JSON.stringify(result));
            next(null,result);
            }
        });
    }
}

router.notifyAll=function(name,registrationId){
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
