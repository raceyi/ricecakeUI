let express = require('express');
let router = express.Router();
var AWS = require("aws-sdk");

AWS.config.loadFromPath('./dynamo.config.json');
AWS.config.update({region:'ap-northeast-2'});

var docClient = new AWS.DynamoDB.DocumentClient();

//sync,await를 사용하자. 순서를 구현하는데 있어서...
//https://tutorialzine.com/2017/07/javascript-async-await-explained

// send push message
// pushId, 자기 registrationId면 무시하도록 한다.

router.dynamoInsertItem=function(params){ 
    return new Promise((resolve,reject)=>{
        docClient.put(params, function(err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("dynamoInsertItem:", JSON.stringify(data, null, 2));
                    resolve(data);
            }
        });   
    }); 
}

router.dynamoScanItem=function (params){
    return new Promise((resolve,reject)=>{
        docClient.scan(params, function(err, data) {
            if (err) {
                console.error("Unable to get item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                resolve(data);
            }
        });   
    }); 
}

router.dynamoScanOrders=function(params) {
    return new Promise((resolve,reject)=>{    
        var results = [];
        var callback = function(err, data) {
            console.log("data.LastEvaluatedKey:"+data.LastEvaluatedKey);
            if (err) {
                console.log('Dynamo fail ' + err);
                reject(err);
            } else if (typeof data.LastEvaluatedKey != "undefined") {
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                console.log("call docClient.scan again");
                data.Items.forEach(function(item) {
                    results.push(item);
                });
                docClient.scan(params, callback);
            } else {
                console.log("results.length:"+results.length);
                console.log("data.Items.length:"+data.Items.length);
                data.Items.forEach(function(item) {
                    results.push(item);
                });                
                resolve(results);
            }
        }
        docClient.scan(params, callback);
    });
}



router.dynamoUpdateItem=function(params){
    return new Promise((resolve,reject)=>{
        docClient.update(params, function(err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("dynamoUpdateItem:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        });   
    }); 
}

router.dynamoDeleteItem=function (params){
    return new Promise((resolve,reject)=>{
        docClient.delete(params, function(err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("dynamoDeleteItem:", JSON.stringify(data, null, 2));
                    resolve(data);
            }
        });   
    }); 
}

router.dynamoQueryItem=function (params){
    return new Promise((resolve,reject)=>{
        docClient.query(params, function(err, data) {
            if (err) {
                console.error("Unable to query item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("item:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        });   
    }); 
}

module.exports = router;