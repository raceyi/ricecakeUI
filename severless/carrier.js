let express = require('express');
let router = express.Router();

var AWS = require("aws-sdk");
var dynamoDB = require("./dynamo");

router.addCarrier=function (param){
    return new Promise((resolve,reject)=>{
                let params={
                    TableName:"carrier",
                    Item:{
                        "name":param.name
                    },
                    ConditionExpression : "attribute_not_exists(#name)",
                    ExpressionAttributeNames: {
                        "#name":"name"
                    }
                };
                console.log("addCarrier-params:"+JSON.stringify(params));
                dynamoDB.dynamoInsertItem(params).then((value)=>{
                    // send push message into others for ordr list update
                    // 모든 db update에 대해 push 메시지가 전달되어야 한다.
                    let params = {
                        TableName: "carrier"
                    };
                    dynamoDB.dynamoScanItem(params).then((result)=>{
                        resolve(result.Items);
                    },err=>{
                        reject(err);
                    });
                },err=>{
                    if(err.code=="ConditionalCheckFailedException"){
                        reject("AlreadyExist");
                    }else
                        reject(err);
                });
    });
}


router.deleteCarrier=function(param){
    return new Promise((resolve,reject)=>{        
        var params = {
            TableName:"carrier",
            Key:{
                "name":param.name
            },
            ConditionExpression : "attribute_exists(#name)",
            ExpressionAttributeNames: {
                "#name":"name"
            }
        };
        console.log("deleteCarrier-params:"+JSON.stringify(params));                
        dynamoDB.dynamoDeleteItem(params).then((result)=>{
                let params = {
                    TableName: "carrier"
                };
                dynamoDB.dynamoScanItem(params).then((result)=>{
                    resolve(result.Items);
                },err=>{
                        reject(err);
                });
        },(err)=>{
            if(err.code=="ConditionalCheckFailedException"){
                reject("AlreadyDeleted");
            }else
                reject(err);
        });
    });
}

router.getCarriers=function (param){
    return new Promise((resolve,reject)=>{
                    let params = {
                        TableName: "carrier"
                    };
                    dynamoDB.dynamoScanItem(params).then((result)=>{
                        resolve(result.Items);
                    },err=>{
                        reject(err);
                    });
                },err=>{
                        reject(err);
                });
}

router.getCarrier=function(name){
    return new Promise((resolve,reject)=>{
            var params = {
                TableName : "carrier",
                KeyConditionExpression: "#name = :name",
                ExpressionAttributeNames:{
                    "#name": "name"
                },
                ExpressionAttributeValues: {
                    ":name":name
                }
            };
            dynamoDB.dynamoQueryItem(params).then((result)=>{
                    console.log("dynamoQueryItem result: "+JSON.stringify(result));
                    if(result.Items.length==0)
                        reject("invalidCarrier");
                    else
                        resolve(result.Items);
            },err=>{
                    reject(err);
            });
        },err=>{
                reject(err);
        });
}

module.exports = router;



