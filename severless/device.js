let express = require('express');
let router = express.Router();
let gcm = require('node-gcm');
let async = require('async');

var AWS = require("aws-sdk");

AWS.config.loadFromPath('./dynamo.config.json');
AWS.config.update({region:'ap-northeast-2'});

var config=require("fcm.config");

let API_KEY=config.API_KEY;

router.putRegistrationId=function (param){
        return new Promise((resolve,reject)=>{
                let params={
                    TableName:"devices",
                    Item:{
                        "registrationId":param.registrationId
                    },
                    ConditionExpression : "attribute_not_exists(#registrationId)",
                    ExpressionAttributeNames: {
                        "#registrationId":"registrationId"
                    }
                };
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

sendGCM=function(tableName,pushId,next){
    let sender = new gcm.Sender(API_KEY);
    console.log("MSG content:"+JSON.stringify(MSG));
    let message;

      message = {
			"to" : pushId,
			priority: 'high',
            collapseKey: 'takit',
            timeToLive: 3,
            "content_available": true,
            data: {
                table: tableName,
                registrationId:pushId[0]
            },
            notification: {
                title: "주문테이블 변경",
                body: tableName
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
                console.log(res.statusCode);
                var body = "";
                res.on('data', function(d) {
                body += d;
                });
                res.on('end', function(d) {
                    if(res.statusCode==200){
                        console.log(JSON.parse(body));
                        next(null,"success"); 
                    }else{
                        console.log(null,"gcm:400");
                    }
                });
        });

		req.write(body);
        req.end();
        req.on('error', function(e){
            console.error(e);
            next(null,"gcm:400");  // Please check if error is unregistered id. 
        });
}

router.notifyAll=function(tableName){
    return new Promise((resolve,reject)=>{    
        getRegistrationIds().then(ids=>{
            let params=[];
            ids.forEach((id)=>{
                params.push({tableName:tableName,pushId:id});
            })
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

