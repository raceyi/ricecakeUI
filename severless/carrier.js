let express = require('express');
let router = express.Router();

var AWS = require("aws-sdk");
var dynamoDB = require("./dynamo");

router.addCarrier=function (param){
    return new Promise((resolve,reject)=>{
                let params={
                    TableName:"carrier",
                    Item:{
                        "date":param.date,
                        "name":param.name
                    }
                };
                console.log("addCarrier-params:"+JSON.stringify(params));
                dynamoDB.dynamoInsertItem(params).then((value)=>{
                    // send push message into others for ordr list update
                    // 모든 db update에 대해 push 메시지가 전달되어야 한다.
                    resolve(value);
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
                "date":param.date,
                "name":param.name
            }
        };
        console.log("deleteCarrier-params:"+JSON.stringify(params));                
        dynamoDB.dynamoDeleteItem(params).then((result)=>{
            resolve(result);
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
                        TableName: "carrier",
                        FilterExpression: "(#date =:date)",
                        ExpressionAttributeNames: {
                            "#date": "date"
                        },
                        ExpressionAttributeValues: {
                            ":date": param.date
                        }
                    };

                    dynamoDB.dynamoScanItem(params).then((result)=>{
                        let carriers=[];
                        result.Items.forEach(item=>{
                            carriers.push({name:item.name});
                        })
                        resolve(carriers);
                    },err=>{
                        reject(err);
                    });
                },err=>{
                        reject(err);
                });
}

module.exports = router;



