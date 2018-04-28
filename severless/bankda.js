let express = require('express');
let router = express.Router();

var https = require('https');
var querystring = require('querystring');
var iconv = require('iconv-lite');
var AWS = require("aws-sdk");
var fs = require('fs');
let async = require('async');
const assert = require('assert');
var dynamoDB = require('./dynamo');
var device =require("./device");
var combination = require('./combination');
var config=require('./bankda.config');

var xml2js = require('xml2js');
var parser = new xml2js.Parser();

AWS.config.loadFromPath('./dynamo.config.json');
AWS.config.update({region:'ap-northeast-2'});
var config=require('./bankda.config');

var last_bkcode; 

notifyOrderAndReturn=function(){  // sequence변경이 필요하다면 변경하고 notifyAll호출이후 getMenus를 호출하여 변경된 menu를 return한다.
        return new Promise((resolve,reject)=>{
                device.notifyAll("order").then(()=>{
                    resolve();
                },err=>{
                    reject(err);
                });
        });
} 

router.bankda=function(response){
//read last_bkcode from dynamoDB
    let params = {
                    TableName : "AtomicCounters",
                    KeyConditionExpression: "#id = :id",
                    ExpressionAttributeNames:{
                        "#id": "id"
                    },
                    ExpressionAttributeValues: {
                        ":id":"last_bkcode"
                    }
                };
    dynamoDB.dynamoQueryItem(params).then(result=>{
        if(result.Items.length==1){
            last_bkcode=result.Items[0].lastValue;
            console.log("last_bkcode:"+last_bkcode);
        }
        check(response);
    },err=>{
        //check(response);
        response.json({result:"failure"});                        
    });
}

updatePayment=function(param,next){
    if(next==undefined){
        console.log("udpatePayment next is undefined");
    }
        let order=param.order;
        let payment=param.payment;
        let bkcode=param.bkcode;
        let bktime=param.time; 
        console.log("bktime:"+bktime);
        //console.log("updatePayment:"+JSON.stringify(order));
        var params = {
            TableName:"order",
            Key:{
                "id": order.id
            }, 
            ConditionExpression : "attribute_exists(#id)",
            ExpressionAttributeNames: {
                "#id":"id"
            },
            UpdateExpression: "set payment = :payment,bkcode=:bkcode,bktime=:bktime",
            ExpressionAttributeValues:{
                ":payment":payment,
                ":bkcode": bkcode,
                ":bktime": bktime
            },
            ReturnValues:"UPDATED_NEW"
        };
        console.log("!!!!!!!updatePayment-params:"+JSON.stringify(params));                
        dynamoDB.dynamoUpdateItem(params).then(result=>{
                console.log("updatePayment success");
                console.log("next type:"+typeof next);
                notifyOrderAndReturn().then(()=>{
                    next(null);
                },err=>{
                    next(err);
                })
        },err=>{
                console.log("updatePayment failure");            
                if(err.code=="ConditionalCheckFailedException")            
                    next("invalidOrderId");
                else
                    next(err);
        });
}

updateLastBKCode=function(){
        return new Promise((resolve,reject)=>{  
                    //wrie it into dynamoDB
                            var params = {
                                TableName:"AtomicCounters",
                                Key:{
                                    "id": "last_bkcode"
                                }, 
                                ConditionExpression : "attribute_exists(#lastValue)",
                                ExpressionAttributeNames: {
                                    "#lastValue":"lastValue"
                                },
                                UpdateExpression: "set lastValue = :lastValue",
                                ExpressionAttributeValues:{
                                    ":lastValue":last_bkcode
                                },
                                ReturnValues:"UPDATED_NEW"
                            };
                            console.log("update_last_bkcode-params:"+JSON.stringify(params));                
                            dynamoDB.dynamoUpdateItem(params).then(result=>{
                                    resolve(result);
                            },err=>{
                                    console.log("update last_bkcode err:"+JSON.stringify(err));
                                    reject(err);
                            });
        });
}

checkTransaction=function(bkcode){
        return new Promise((resolve,reject)=>{  
                    //wrie it into dynamoDB
                            var params = {
                                TableName:"transactions",
                                Key:{
                                    "bkcode": bkcode
                                }, 
                                ConditionExpression : "attribute_exists(#bkcode)",
                                ExpressionAttributeNames: {
                                    "#bkcode":"bkcode"
                                },
                                UpdateExpression: "set checked = :checked",
                                ExpressionAttributeValues:{
                                    ":checked":true
                                },
                                ReturnValues:"UPDATED_NEW"
                            };
                            console.log("checkTransaction-params:"+JSON.stringify(params));                
                            dynamoDB.dynamoUpdateItem(params).then(result=>{
                                    resolve(result);
                            },err=>{
                                    console.log("checkTransaction err:"+JSON.stringify(err));
                                    reject(err);
                            });
        });
}

let inputNumber=0;
let outputNumber=0;
addTransactionRecord=function(record,next){
    ++inputNumber;
    console.log("inputNumber:"+inputNumber);
    console.log("addTransactionRecord:"+JSON.stringify(record));
    if(parseInt(record.$.bkinput)>0){
        let bkdate=record.$.bkdate;
        let bktime=record.$.bktime;
        //2018-03-21T09:00:01.553Z "bkdate":20180320","bktime":"140400
        let time=bkdate.substr(0,4)+'-'+bkdate.substr(4,2)+'-'+bkdate.substr(6,2)+'T'+bktime.substr(0,2)+':'+bktime.substr(2,2)+":"+bktime.substr(4,2)+':000Z';
        let params={
            TableName:"transactions",
            Item:{
                "bkcode":record.$.bkcode,
                "accountnum":record.$.accountnum,
                "time":time,
                "bkjukyo":record.$.bkjukyo,
                "bkcontent":record.$.bkcontent,
                "bketc":record.$.bketc,
                "bkinput":record.$.bkinput,
                "bkjango":record.$.bkjango
            },
        };
        console.log("addTransactions-params???:"+JSON.stringify(params));
        dynamoDB.dynamoInsertItem(params).then((value)=>{
            console.log("!!!! check unpaid cash orders");
            // send push message into others for ordr list update
            // 현재부터 30일전 까지의 지불되지 않은 주문을 검색한다. 
            var currTime = new Date();
            var currLocalTime=new Date(currTime.getTime()+9*60*60*1000);
            console.log("currTime:"+currLocalTime.toISOString());
            var startLocalTime=new Date(currLocalTime.getTime()-30*24*60*60*1000); //30 days
            let start=startLocalTime.toISOString();
            let end=currLocalTime.toISOString() ;
            console.log("!!!buyerName:"+record.$.bkjukyo);
            let params = {
                TableName: "order",
                FilterExpression: "(#orderedTime between :start and :end) AND #buyerName=:buyerName AND #paymentMethod=:cash AND #payment=:payment",
                ExpressionAttributeNames: {
                    "#orderedTime": "orderedTime",
                    "#buyerName":"buyerName",
                    "#payment":"payment",
                    "#paymentMethod":"paymentMethod"
                },
                ExpressionAttributeValues: {
                    ":start": start,
                    ":end": end ,
                    ":buyerName": record.$.bkjukyo,
                    ":payment":"unpaid-transaction",
                    ":cash":"cash"
                }
            };
            console.log("params:"+JSON.stringify(params));
            dynamoDB.dynamoScanItem(params).then((result)=>{
                //1.7일 이내 동일금액,동일주문자의 주문이 하나만 존재할 경우 해당 주문에 대해 결제한것으로 지정한다.
                //2.만약 동일인은 있으나 금액이 틀릴경우 7일 이내 주문금액의 합산금액과 입금액이 일치하는지를 확인한다. 주문 합산금액과 입금액이 동일할경우 결제한것으로 지정한다. 
                //3.동일이름,동일주문금액의 주문이 두개 이상 존재할 경우 상점주가 확인하도록 한다. => !!! ignore this case!!!!
                //paid,unpaid,ambigious
                if(result.Items.length==0){
                            next(null);
                }else{
                    console.log("!!! The same buyer found!!!!"+record.$.bkjukyo);
                    let orders=[];
                    let j;
                    result.Items.sort(function(a,b){
                            if (a.id > b.id) return -1;
                            if (a.id < b.id) return 1;
                            return 0;
                    })
                    for(j=0;j<result.Items.length;j++){ 
                        console.log("price:"+result.Items[j].totalPrice+" deposit:"+record.$.bkinput);
                        if(result.Items[j].totalPrice==record.$.bkinput){//case 1
                            orders.push({order:result.Items[j],payment:"paid",bkcode:record.$.bkcode,time:time}); //bktime?
                            break;
                        }
                    }
                    console.log("orders: "+JSON.stringify(orders));
                    if(orders.length==0){ //check case 2: 모든 조합을 계산하여 동일한 금액이 나오는 첫경우에 대해 paid로 처리한다.
                        // make all combination sum of orders
                        let combinations=combination.combinations(result.Items,record.$.bkinput,function(orders){
                            let sum=0;
                            orders.forEach(order=>{
                                sum+=parseInt(order.totalPrice);
                            });
                            return sum;
                        });
                        console.log("combinations:"+JSON.stringify(combinations));
                        if(combinations.length>0){
                            combinations[0].comb.forEach(order=>{
                                orders.push({order:order,payment:"paid",bkcode:record.$.bkcode,time:time});
                            })
                        }
                    }
                    console.log("update orders:"+JSON.stringify(orders));
                    if(orders.length>0){
                            async.map(orders,updatePayment,function(err,eachResult){
                                if(err){
                                    //humm.. Can it happen?
                                    next(err);
                                }else{
                                    checkTransaction(record.$.bkcode).then(()=>{
                                        //updateLastBKCode().then(()=>{
                                            next(null);
                                        //},err=>{
                                        //    next(err);
                                        //});
                                    });
                                }
                            });
                    }else{
                        //updateLastBKCode().then(()=>{
                            next(null);
                        //},err=>{
                        //    next(err);
                        //});
                    }
                } 
            },(err)=>{
                console.log("scanOrders humm"+JSON.stringify(err));
                next(err);
            });
        },err=>{
            console.log("addTransactions humm"+JSON.stringify(err));
            next(err);
        });
    }else{
        next(null);
    }  
}

check=function(response){
    let postData;
    if(!last_bkcode){
        var d = new Date(); 
        let month=d.getMonth()+1;
        let xml_date=d.getFullYear()+
                     (month<10?"0"+month:month)+
                     d.getDate();
        console.log("xml_date:"+xml_date);
        postData = querystring.stringify({
                     xml_userid: config.xml_userid, 
                     xml_pwd: config.xml_pwd, 
                     xml_acctno: config.xml_acctno, 
                     xml_date: xml_date// e.g.'20180320'
                 });
    }else{
        postData = querystring.stringify({
                     xml_userid: 'chleodnd1212',
                     xml_pwd: 'qweasd123!',
                     xml_acctno: '01037708882607',
                     xml_bkcode: last_bkcode 
                 });
    }    
    console.log("postData:"+postData);
    // request option
    var options = {
        host: 'www.bankda.com',
        port: 443,
        method: 'POST',
        path: '/dtsvc/xmldown.php',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };
 
    // request object
    var req = https.request(options, function (res) {
        var result = '';
        var output;
        res.on('data', function (chunk) {
            result += iconv.decode(chunk,"euc-kr");
        });
        res.on('end', function () {
            //result = fs.readFileSync('bankda.txt', 'utf8'); //just for testing
            console.log(result);            
            parser.parseString(result, function (err, obj) {
                console.log("obj:"+JSON.stringify(obj.bankda.account[0].accinfo));
                if(obj.bankda.account[0].accinfo){
                    console.log(JSON.stringify(obj.bankda.account[0].accinfo));
                    last_bkcode=parseInt(obj.bankda.account[0].accinfo[obj.bankda.account[0].accinfo.length-1].$.bkcode);
                    async.map(obj.bankda.account[0].accinfo,addTransactionRecord,function(err,eachResult){
                        if(err){
                            console.log("check error:"+JSON.stringify(err));
                            response.json({result:"failure"});
                        }else{
                            updateLastBKCode().then(()=>{
                                console.log("All done");
                                response.json({result:"success"});                                                
                            },err=>{
                                console.log("All done- lastBKCode write error");
                                response.json({result:"failure"});                        
                            });
                        }
                    });
                }else{ //no transaction update
                        console.log("no transaction. All done");
                        response.json({result:"success"});
                }
            }); // parse
        });//res.end
        res.on('error', function (err) {
            console.log(err);
            response.json({result:"failure"});  
        })
    });
    
    // req error
    req.on('error', function (err) {
    console.log(err);
    response.json({result:"failure"});  
    });
    
    //send request witht the postData form
    req.write(postData);
    req.end();
}

module.exports = router;

//check();
//setInterval(check, 15*60000); //every 15 minutes
/*
result = fs.readFileSync('bankda.txt', 'utf8'); //just for testing
console.log(result);            
parser.parseString(result, function (err, obj) {
    console.log("obj:"+JSON.stringify(obj.bankda.account[0].accinfo));
    if(obj.bankda.account[0].accinfo){
        console.log("accinfo(len:"+obj.bankda.account[0].accinfo.length+"):"+JSON.stringify(obj.bankda.account[0].accinfo));
        last_bkcode=parseInt(obj.bankda.account[0].accinfo[obj.bankda.account[0].accinfo.length-1].$.bkcode);
        async.map(obj.bankda.account[0].accinfo,addTransactionRecord,function(err,eachResult){
            updateLastBKCode().then(()=>{
                console.log("All done");
            },err=>{
                console.log("All done- lastBKCode write error");
            });
            //All done
            console.log("All done");
            //response.json({result:"success"});
        });
    }else{ //no transaction update
            console.log("no transaction. All done");
            //response.json({result:"success"});
    }
}); // parse
*/

//router.bankda();