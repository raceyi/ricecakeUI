let express = require('express');
let router = express.Router();
var dynamoDB = require("./dynamo");
let device = require('./device');
let async = require('async');

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

updateCarrier=function(param,next){
    console.log("updateCarrier:"+JSON.stringify(param));
    var params = {
        TableName:"order",
        Key:{
            "id": param.id
        },
        ConditionExpression : "attribute_exists(#id)",
        ExpressionAttributeNames: {
            "#id":"id"
        },
        UpdateExpression: "set  carrier= :carrier",
        ExpressionAttributeValues:{
            ":carrier":"미지정"
        },
        ReturnValues:"UPDATED_NEW"
    };
    console.log("updateCarrier-params:"+JSON.stringify(params));                
    dynamoDB.dynamoUpdateItem(params).then(result=>{
            next(null);
    },err=>{
            if(err.code=="ConditionalCheckFailedException")
                next("invalidId");
            else    
                next(err);
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
                //해당 날짜의 carrier의 지정을 수정해야만 한다. 
                let deliveryDate=param.date;
                let start=deliveryDate+"T00:00:00.000Z";
                let end=deliveryDate+"T23:59:59.999Z";
                console.log("start:"+start+" end:"+end);
                let params = {
                    TableName: "order",
                    FilterExpression: "(#deliveryTime between :start and :end) AND (#carrier=:carrier)",
                    ExpressionAttributeNames: {
                        "#deliveryTime": "deliveryTime",
                        "#carrier":"carrier"
                    },
                    ExpressionAttributeValues: {
                        ":start": start,
                        ":end": end ,
                        ":carrier":param.name
                    }
                };
                console.log("getOrderWithDeliveryDate-params:"+JSON.stringify(params));        
                dynamoDB.dynamoScanItem(params).then((result)=>{
                        //update carriers   
                        console.log("result.Items:"+JSON.stringify(result.Items));                     
                        async.map(result.Items,updateCarrier,function(err,eachResult){
                            if(err){
                                reject(err);
                            }else{
                                notifyAndReturnCarrier(param).then(()=>{
                                    resolve();
                                },err=>{
                                    reject(err);
                                })  
                            }
                        });                        
                },(err)=>{
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

