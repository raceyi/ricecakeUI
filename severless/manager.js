let express = require('express');
let router = express.Router();

var AWS = require("aws-sdk");
var dynamoDB = require("./dynamo");

router.checkPIN=function (param){
    return new Promise((resolve,reject)=>{
        let params = {
                TableName : "AtomicCounters",
                KeyConditionExpression: "#id = :id",
                ExpressionAttributeNames:{
                    "#id": "id"
                },
                ExpressionAttributeValues: {
                    ":id":"pinNumber"
                }
            };
        dynamoDB.dynamoQueryItem(params).then(result=>{
            if(result.Items.length==1){
                let pinNumber=result.Items[0].lastValue;
                console.log("pinNumber:"+pinNumber);
                resolve(pinNumber)
            }
            reject("dynamoDB error");
        },err=>{
            reject(err);
        });

    });  
}

router.checkInstallPIN=function (param){
    return new Promise((resolve,reject)=>{
        let params = {
                TableName : "AtomicCounters",
                KeyConditionExpression: "#id = :id",
                ExpressionAttributeNames:{
                    "#id": "id"
                },
                ExpressionAttributeValues: {
                    ":id":"install"
                }
            };
        dynamoDB.dynamoQueryItem(params).then(result=>{
            if(result.Items.length==1){
                let pinNumber=result.Items[0].lastValue;
                console.log("pinNumber:"+pinNumber);
                resolve(pinNumber)
            }
            reject("dynamoDB error");
        },err=>{
            reject(err);
        });

    });  
}


router.modifyInstallPin=function(param){
    return new Promise((resolve,reject)=>{
        let params = {
                TableName : "AtomicCounters",
                KeyConditionExpression: "#id = :id",
                ExpressionAttributeNames:{
                    "#id": "id"
                },
                ExpressionAttributeValues: {
                    ":id":"install"
                }
            };

        dynamoDB.dynamoQueryItem(params).then(result=>{
            if(result.Items.length==1){
                let pinNumber=result.Items[0].lastValue;
                console.log("pinNumber:"+param.existingPin);
                if(param.existingPin!=pinNumber){
                    reject("invalidPIN");
                }else{
                     // updat pin with new value
                    var params = {
                        TableName:"AtomicCounters",
                        Key:{
                            "id": "install"
                        },
                        UpdateExpression:"set lastValue = :pinNumber",
                        ExpressionAttributeValues:{
                            ":pinNumber":param.newPin
                        },
                        ReturnValues:"UPDATED_NEW"
                    };
                    dynamoDB.dynamoUpdateItem(params).then(result=>{
                        resolve();
                    },err=>{
                        reject(err);
                    })
                }
            }
        },err=>{
            reject("dynamoDB error");
        },err=>{
            reject(err);
        });
    });  
}

router.modifyPIN=function (param){
    return new Promise((resolve,reject)=>{
        let params = {
                TableName : "AtomicCounters",
                KeyConditionExpression: "#id = :id",
                ExpressionAttributeNames:{
                    "#id": "id"
                },
                ExpressionAttributeValues: {
                    ":id":"pinNumber"
                }
            };

        dynamoDB.dynamoQueryItem(params).then(result=>{
            if(result.Items.length==1){
                let pinNumber=result.Items[0].lastValue;
                console.log("pinNumber:"+param.existingPin);
                if(param.existingPin!=pinNumber){
                    reject("invalidPIN");
                }else{
                     // updat pin with new value
                    var params = {
                        TableName:"AtomicCounters",
                        Key:{
                            "id": "pinNumber"
                        },
                        UpdateExpression:"set lastValue = :pinNumber",
                        ExpressionAttributeValues:{
                            ":pinNumber":param.newPin
                        },
                        ReturnValues:"UPDATED_NEW"
                    };
                    dynamoDB.dynamoUpdateItem(params).then(result=>{
                        resolve();
                    },err=>{
                        reject(err);
                    })
                }
            }
        },err=>{
            reject("dynamoDB error");
        },err=>{
            reject(err);
        });
    });  
}

router.getSalesWithBuyer=function(param){
        return new Promise((resolve,reject)=>{
                let start=param.startDate+"T00:00:00.000Z";
                let end=param.endDate+"T23:59:59.999Z";
                console.log("start:"+start+" end:"+end);
                let params = {
                    TableName: "order",
                    FilterExpression: "(#deliveryTime between :start and :end) AND (#hide=:hide) AND( #buyer=:buyer)",
                    ExpressionAttributeNames: {
                        "#deliveryTime": "deliveryTime",
                        "#hide":"hide",
                        "#buyer":"buyerName"
                    },
                    ExpressionAttributeValues: {
                        ":start": start,
                        ":end": end ,
                        ":hide":false,
                        ":buyer":param.buyer
                    }
                };
                console.log("getOrderWithDeliveryDate-params:"+JSON.stringify(params));        
                dynamoDB.dynamoScanOrders(params).then((result)=>{
                    let sum=summarize(result)
                    resolve(sum);
                },err=>{
                    reject(err);
                });
        });
}

summarize=function(orders){
    let cashPaid=0;
    let cashUnpaid=0;

    let cardPaid=0;
    let cardUnpaid=0;

    orders.forEach(order=>{
                        console.log("order:"+JSON.stringify(order));
                        let totalPrice;
                        if(typeof order.totalPrice ==="string")
                            totalPrice=parseInt(order.totalPrice);
                        else if(typeof order.totalPrice ==="number" && order.totalPrice!=NaN)
                            totalPrice=order.totalPrice;

                        if(order.paymentMethod=="cash" && totalPrice){
                             if(order.payment.startsWith("paid")){
                                    cashPaid+=totalPrice ;
                             }else/* if(order.payment.startsWith("unpaid"))*/{
                                    cashUnpaid+=totalPrice ;
                             }
                        }else if(order.paymentMethod=="card" && totalPrice){
                             if(order.payment.startsWith("paid")){
                                    cardPaid+=totalPrice ;
                             }else/* if(order.payment.startsWith("unpaid"))*/{
                                    cardUnpaid+=totalPrice ;
                             }
                        }
                    });
     console.log("cashPaid:"+cashPaid+" cashUnpaid:"+cashUnpaid+" cardPaid:"+cardPaid+" cardUnpaid:"+cardUnpaid);
     let output={ cashPaid:cashPaid,
                  cashUnpaid:cashUnpaid,
                  cardPaid:cardPaid,
                  cardUnpaid:cardUnpaid}; 
     return output;              
}

router.getSales=function(param){
            return new Promise((resolve,reject)=>{
                let start=param.startDate+"T00:00:00.000Z";
                let end=param.endDate+"T23:59:59.999Z";
                console.log("start:"+start+" end:"+end);
                let params = {
                    TableName: "order",
                    FilterExpression: "(#deliveryTime between :start and :end) AND (#hide=:hide)",
                    ExpressionAttributeNames: {
                        "#deliveryTime": "deliveryTime",
                        "#hide":"hide"
                    },
                    ExpressionAttributeValues: {
                        ":start": start,
                        ":end": end ,
                        ":hide":false
                    }
                };
                console.log("getSales-params:"+JSON.stringify(params));        
                dynamoDB.dynamoScanOrders(params).then((result)=>{
                    let sum=summarize(result)
                    resolve(sum);
                },(err)=>{
                    reject(err);
                });            
        });

}

module.exports = router;





