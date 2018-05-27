let express = require('express');
let router = express.Router();
var dynamoDB = require("./dynamo");
let device = require('./device');
let async = require('async');

var AWS = require("aws-sdk");

function notifyAndReturnProduce(param){  
        return new Promise((resolve,reject)=>{
                console.log("carrier.js-param.registrationId:"+param.registrationId);
                device.notifyAll("produce",param.registrationId).then(()=>{
                    resolve();
                },err=>{
                    reject(err);
                });
        });
} 

router.saveProduceTitle=function (param){
    return new Promise((resolve,reject)=>{
                let params={
                    TableName:"produceTitle",
                    Item:{
                        "date":param.date,
                        "list":param.list
                    }
                };
                console.log("saveProduceTitle-params:"+JSON.stringify(params));
                dynamoDB.dynamoInsertItem(params).then((value)=>{
                        notifyAndReturnProduce(param).then(()=>{
                            resolve();
                        },err=>{
                            reject(err);
                        })  
                },err=>{
                        reject(err);
                });
    });
}

router.getProduceTitle=function (param){
    return new Promise((resolve,reject)=>{
            let params = {
                TableName : "produceTitle",
                KeyConditionExpression: "#date = :date",
                ExpressionAttributeNames:{
                    "#date": "date"
                },
                ExpressionAttributeValues: {
                    ":date":param.date 
                }
            };
        console.log("params:"+JSON.stringify(params));
        dynamoDB.dynamoQueryItem(params).then(result=>{
            if(result.Items.length==1){
                let list=result.Items[0].list;
                console.log("list:"+list);
                resolve(JSON.parse(list))
            }else{
                let list=[]
                resolve(list);
            }
        },err=>{
            reject(err);
        });
    });
}

module.exports = router;