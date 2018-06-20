let express = require('express');
let router = express.Router();

let async = require('async');
var AWS = require("aws-sdk");
var dynamoDB = require("./dynamo");
var atomicCounter = require('./atomic-counter');
var carrier = require('./carrier');
var sms = require('./sms');
let device = require('./device');

AWS.config.loadFromPath('./dynamo.config.json');
AWS.config.update({region:'ap-northeast-2'});

notifyAndReturn=function(param){  // sequence변경이 필요하다면 변경하고 notifyAll호출이후 getMenus를 호출하여 변경된 menu를 return한다.
        return new Promise((resolve,reject)=>{
                console.log("param.registrationId:"+param.registrationId);
                device.notifyAll("order",param.registrationId).then(()=>{
                    resolve();
                },err=>{
                    reject(err);
                });
        });
} 

router.addOrder=function (param){
    return new Promise((resolve,reject)=>{
        //console.log("param:"+JSON.stringify(param));
        let order=param.order;
        //console.log("addOrder-order:"+JSON.stringify(order));
        var currTime = new Date();
        console.log("currTime:"+currTime.toISOString());
        let localCurrTime= new Date(currTime.getTime()+9*60*60*1000);
        atomicCounter.increment( "order" ).then(id=>{
                let recipientAddressDetail=order.recipientAddressDetail;
                if(!recipientAddressDetail || recipientAddressDetail.length==0)
                    recipientAddressDetail="  "; //initialize it with blank string...
                let memo=order.memo
                if(!memo || memo.length==0){
                    memo="  ";//initialize it with blank string
                }
                    
                let params={
                    TableName:"order",
                    Item:{
                        "id":id,
                        "orderedTime": localCurrTime.toISOString(),
                        "deliveryTime":order.deliveryTime,
                        "deliveryTimeEnd":order.deliveryTimeEnd,
                        "recipientAddress":order.recipientAddress.trim(),
                        "recipientAddressDetail":recipientAddressDetail,
                        "buyerName":order.buyerName.trim(),
                        "recipientName":order.recipientName.trim(),
                        "recipientPhoneNumber":order.recipientPhoneNumber.trim(),
                        "buyerPhoneNumber":order.buyerPhoneNumber.trim(),
                        "menuList":order.menuList,
                        "memo":order.memo,
                        "price":order.price,
                        "paymentMethod":order.paymentMethod,//카드,현금
                        "payment":order.payment, //지불 여부
                        "deliveryMethod":order.deliveryMethod, //배달 방법(냉동,배송,픽업,기타),
                        "deliveryFee":order.deliveryFee,//
                        "totalPrice":order.totalPrice,
                        "hide":false,
                        "carrier":null
                    },
                    ConditionExpression : "attribute_not_exists(#id)",
                    ExpressionAttributeNames: {
                        "#id":"id"
                    }
                };
                console.log("addOrder-params:"+JSON.stringify(params));
                dynamoDB.dynamoInsertItem(params).then((value)=>{
                    // send push message into others for ordr list update
                    // 모든 db update에 대해 push 메시지가 전달되어야 한다. 
                    sms.notifyOrder(order).then(()=>{
                        notifyAndReturn(param).then(()=>{
                            resolve(id);
                        },err=>{
                            reject(err);
                        })  
                    },err=>{
                        console.log("notifyOrder err:"+JSON.stringify(err));
                        reject(err);
                    });
                },err=>{
                    reject(err);
                });
        });
    });
}



function queryDynamoDB(counter,success,fail){

    if(counter>=0)

    success(counter);

    else

    fail(counter);

}

router.getOrderWithDeliveryDate=function (param){
    return new Promise((resolve,reject)=>{    
        let deliveryDate=param.deliveryDate;
        let start=deliveryDate+"T00:00:00.000Z";
        let end=deliveryDate+"T23:59:59.999Z";
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
        console.log("call dynamoDB.dynamoScanOrders");
        dynamoDB.dynamoScanOrders(params).then((result)=>{
            console.log("order length:"+result.length);
            resolve(result);
        },err=>{
            reject(err);
        })
        /*
        //LastEvaluatedKey
        console.log("getOrderWithDeliveryDate-params:"+JSON.stringify(params));        
        dynamoDB.dynamoScanItem(params).then((result)=>{
            if (typeof result.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = result.LastEvaluatedKey;
                dynamoDB.dynamoScanItem(params).then((result2)=>{
                    let merge= result.Items.concat(result2.Items); 
                    resolve(merge);
                });                
            }else
                resolve(result.Items);
        },(err)=>{
            reject(err);
        });
        */
    });
}

router.getOrdersWithHide=function(param){
    return new Promise((resolve,reject)=>{    
        let params = {
            TableName: "order",
            FilterExpression: "#hide=:hide",
            ExpressionAttributeNames: {
                "#hide":"hide"
            },
            ExpressionAttributeValues: {
                ":hide":true
            }
        };
        console.log("getOrderWithDeliveryDate-params:"+JSON.stringify(params));  
        /*      
        dynamoDB.dynamoScanItem(params).then((result)=>{
            resolve(result.Items);
        },(err)=>{
            reject(err);
        });
        */
        dynamoDB.dynamoScanOrders(params).then((result)=>{
            console.log("order length:"+result.length);
            resolve(result);
        },err=>{
            reject(err);
        })

    });
}

deleteOrder=function(order,next){
    var params = {
        TableName:"order",
        Key:{
            "id": order.id
        }
    };
    console.log("deleteOrders-params:"+JSON.stringify(params));                
    dynamoDB.dynamoDeleteItem(params).then((result)=>{
            next(null,result);
    },(err)=>{
            next(err);
    });
}

router.deleteOrders=function(param){
    return new Promise((resolve,reject)=>{  
        router.getOrdersWithHide().then((orders)=>{
                        async.map(orders,deleteOrder,function(err,eachResult){
                            if(err){
                                //humm.. Can it happen?
                                reject(err);
                            }else{
                                notifyAndReturn(param).then(()=>{
                                    resolve();
                                },err=>{
                                    reject(err);
                                })  
                            }
                        });
        });
    });
}

getOrderInfo=function(orderId){
    return new Promise((resolve,reject)=>{
        let params = {
                TableName : "order",
                KeyConditionExpression: "#id = :id",
                ExpressionAttributeNames:{
                    "#id": "id"
                },
                ExpressionAttributeValues: {
                    ":id":orderId
                }
            };
        dynamoDB.dynamoQueryItem(params).then(result=>{
            if(result.Items.length==1){
                let order=result.Items[0];
                resolve(order)
            }
            reject("dynamoDB error");
        },err=>{
            reject(err);
        });

    });  

}

function isEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}

function isEqualMenuList(menuA,menuB){
    if(menuA.length!=menuB.length)
        return false;

    for(let i=0;i<menuA.length;i++){
        if(!isEquivalent(menuA[i], menuB[i]))
            return false;
    }
    return true;
}

onlyPaymentChange=function(a,b){
   if(a.deliveryTime==b.deliveryTime &&
     // a.recipientAddress==b.recipientAddress &&
     // a.recipientAddressDetail==b.recipientAddressDetail &&
     // a.buyerName==b.buyerName &&
      a.recipientName==b.recipientName &&
      a.buyerPhoneNumber==b.buyerPhoneNumber &&
      isEqualMenuList(a.menuList,b.menuList) &&
    //  a.memo==b.memo &&
      a.price==b.price &&
   //   a.deliveryMethod==b.deliveryMethod &&
      a.deliveryFee==b.deliveryFee &&
      a.totalPrice==b.totalPrice){
        console.log("onlyPaymentChange returns true");
        return true;
      }
   console.log("onlyPaymentChange returns false");      
   return false;
}

router.updateOrder=function (param){
    return new Promise((resolve,reject)=>{
        getOrderInfo(param.order.id).then((orderInfo)=>{
                let order=param.order;
                let updateExpression;
                let expressionAttributeValues;
                let memo=order.memo
                if(!memo || memo.length==0){
                    memo="  ";//initialize it with blank string
                }
                var params = {
                    TableName:"order",
                    Key:{
                        "id": order.id
                    },
                    ConditionExpression : "attribute_exists(#id)",
                    ExpressionAttributeNames: {
                        "#id":"id"
                    },
                    UpdateExpression:"set deliveryTime = :deliveryTime, deliveryTimeEnd =:deliveryTimeEnd, recipientAddress=:recipientAddress,\
                                    recipientAddressDetail=:recipientAddressDetail,buyerName=:buyerName,\
                                    recipientName=:recipientName,recipientPhoneNumber=:recipientPhoneNumber,\
                                    buyerPhoneNumber=:buyerPhoneNumber,menuList=:menuList,\
                                    memo=:memo,price=:price,paymentMethod=:paymentMethod,payment=:payment,\
                                    deliveryMethod=:deliveryMethod,deliveryFee=:deliveryFee,totalPrice=:totalPrice",
                    ExpressionAttributeValues:{
                        ":deliveryTime":order.deliveryTime,
                        ":deliveryTimeEnd":order.deliveryTimeEnd,
                        ":recipientAddress":order.recipientAddress,
                        ":recipientAddressDetail":order.recipientAddressDetail,
                        ":buyerName":order.buyerName,
                        ":recipientName":order.recipientName,
                        ":recipientPhoneNumber":order.recipientPhoneNumber,
                        ":buyerPhoneNumber":order.buyerPhoneNumber,
                        ":menuList":order.menuList,
                        ":memo":memo,
                        ":price":order.price,
                        ":paymentMethod":order.paymentMethod,//카드,현금
                        ":payment":order.payment, //지불 여부,
                        ":deliveryMethod":order.deliveryMethod,
                        ":deliveryFee":order.deliveryFee,
                        ":totalPrice":order.totalPrice
                    },
                    ReturnValues:"UPDATED_NEW"
                };
                dynamoDB.dynamoUpdateItem(params).then(result=>{
                        //모든 변경에 대해 문자를 전달한다. 
                            if(order.sms){
                                sms.notifyOrder(order).then(()=>{
                                    notifyAndReturn(param).then(()=>{
                                        resolve(result);
                                    },err=>{
                                        reject(err);
                                    })  
                                },err=>{
                                    console.log("notifyOrder err:"+JSON.stringify(err));                    
                                    reject(err); //hum...
                                });           
                            }else{
                                    notifyAndReturn(param).then(()=>{
                                        resolve(result);
                                    },err=>{
                                        reject(err);
                                    })                                  
                            }
                },err=>{
                        if(err.code=="ConditionalCheckFailedException")            
                            reject("invalidOrderId");
                        else
                            reject(err);
                });
        },err=>{
            reject(err);
        })        
    });
}

router.hideOrder=function (param){
        return new Promise((resolve,reject)=>{  
        console.log("hideOrder-order:"+JSON.stringify(param));
        var params = {
            TableName:"order",
            Key:{
                "id": param.id
            }, 
            ConditionExpression : "attribute_exists(#id)",
            ExpressionAttributeNames: {
                "#id":"id"
            },
            UpdateExpression: "set hide = :hide",
            ExpressionAttributeValues:{
                ":hide":true
            },
            ReturnValues:"UPDATED_NEW"
        };
        console.log("hideOrder-params:"+JSON.stringify(params));                
        dynamoDB.dynamoUpdateItem(params).then(result=>{
                    notifyAndReturn(param).then(()=>{
                        resolve(result);
                    },err=>{
                        reject(err);
                    })                  
        },err=>{
                if(err.code=="ConditionalCheckFailedException")            
                    reject("invalidOrderId");
                else
                    reject(err);
        });
    });
}

router.showOrder=function (param){
        return new Promise((resolve,reject)=>{        
        var params = {
            TableName:"order",
            Key:{
                "id": param.id
            }, 
            ConditionExpression : "attribute_exists(#id)",
            ExpressionAttributeNames: {
                "#id":"id"
            },
            UpdateExpression: "set hide = :hide",
            ExpressionAttributeValues:{
                ":hide":false
            },
            ReturnValues:"UPDATED_NEW"
        };
        console.log("showOrder-params:"+JSON.stringify(params));                
        dynamoDB.dynamoUpdateItem(params).then(result=>{
                    notifyAndReturn(param).then(()=>{
                        resolve(result);
                    },err=>{
                        reject(err);
                    })  
        },err=>{
                if(err.code=="ConditionalCheckFailedException")            
                    reject("invalidOrderId");
                else
                    reject(err);
        });
    });
}

router.assignCarrier=function (param){
    return new Promise((resolve,reject)=>{  
        // 배달부 목록에 있다면 지정하고 없을 경우 에러로 "invalidCarrier"를 return한다.          
        if(!param.carrier || !param.orderid ){
            reject("invalidParam");
        }else{
                //carrier.getCarrier(param.carrier).then(value=>{
                        var params = {
                            TableName:"order",
                            Key:{
                                "id": param.orderid
                            },
                            ConditionExpression : "attribute_exists(#id)",
                            ExpressionAttributeNames: {
                                "#id":"id"
                            },
                            UpdateExpression: "set  carrier= :carrier",
                            ExpressionAttributeValues:{
                                ":carrier":param.carrier
                            },
                            ReturnValues:"UPDATED_NEW"
                        };
                        console.log("assignCarrier-params:"+JSON.stringify(params));                
                        dynamoDB.dynamoUpdateItem(params).then(result=>{
                                resolve(result);
                                notifyAndReturn(param).then(()=>{
                                    resolve(result);
                                },err=>{
                                    reject(err);
                                })  
                        },err=>{
                                if(err.code=="ConditionalCheckFailedException")
                                    reject("invalidId");
                                else    
                                    reject(err);
                        });
                //},err=>{
                //    reject(err);
                //});
        }
    });
}

module.exports = router;




