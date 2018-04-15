let express = require('express');
let router = express.Router();
var dynamoDB = require("./dynamo");
let device = require('./device');

var AWS = require("aws-sdk");

function notifyAndReturnCarrier(param){  // sequence변경이 필요하다면 변경하고 notifyAll호출이후 getMenus를 호출하여 변경된 menu를 return한다.
        return new Promise((resolve,reject)=>{
                console.log("carrier.js-param.registrationId:"+param.registrationId);
                device.notifyAll("carrier",param.registrationId).then(()=>{
                    resolve();
                },err=>{
                    reject(err);
                });
        });
} 

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
                        notifyAndReturnCarrier(param).then(()=>{
                            resolve();
                        },err=>{
                            reject(err);
                        })  
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
                notifyAndReturnCarrier(param).then(()=>{
                    resolve();
                },err=>{
                    reject(err);
                })  
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

//device.notifyAll("carrier","1234");

//router.deleteCarrier({date:"2018-04-15" ,name:"둘리"})

