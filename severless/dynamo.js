let express = require('express');
let router = express.Router();

var AWS = require("aws-sdk");

AWS.config.loadFromPath('./dynamo.config.json');
AWS.config.update({region:'ap-northeast-2'});

var docClient = new AWS.DynamoDB.DocumentClient();

//sync,await를 사용하자. 순서를 구현하는데 있어서...
//https://tutorialzine.com/2017/07/javascript-async-await-explained

router.dynamoInsertItem=function(params){ 
    return new Promise((resolve,reject)=>{
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

router.dynamoScanItem=function (params){
    return new Promise((resolve,reject)=>{
        docClient.scan(params, function(err, data) {
            if (err) {
                console.error("Unable to get item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("item:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        });   
    }); 
}

router.dynamoUpdateItem=function(params){
    return new Promise((resolve,reject)=>{
        docClient.update(params, function(err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("item:", JSON.stringify(data, null, 2));
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
                console.log("item:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        });   
    }); 
}

router.dynamoQueryItem=function (params){
    return new Promise((resolve,reject)=>{
        docClient.query(params, function(err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("item:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        });   
    }); 
}

module.exports = router;