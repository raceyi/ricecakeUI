let express = require('express');
let router = express.Router();

var https = require('https');
var querystring = require('querystring');
var iconv = require('iconv-lite');
var AWS = require("aws-sdk");
var fs = require('fs');
let async = require('async');

var dynamoDB = require('./dynamo');

var config=require('./bankda.config');

var xml2js = require('xml2js');
var parser = new xml2js.Parser();

AWS.config.loadFromPath('./dynamo.config.json');
AWS.config.update({region:'ap-northeast-2'});
var config=require('./bankda.config');

var last_bkcode; 

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
        check(response);
    });
}

updatePayment=function(param,next){
        let order=param.order;
        let payment=param.payment;
        let bkcode=param.bkcode;
        let bktime=param.time; 
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
            UpdateExpression: "set payment = :payment,bkcode=:bkcode,bktime:=bktime",
            ExpressionAttributeValues:{
                ":payment":payment,
                ":bkcode": bkcode,
                ":bktime": bktime
            },
            ReturnValues:"UPDATED_NEW"
        };
        console.log("updatePayment-params:"+JSON.stringify(params));                
        dynamoDB.dynamoUpdateItem(params).then(result=>{
                next(null);
        },err=>{
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
                                    ":lastValue":true
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

addTransactionRecord=function(record,next){
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
            ConditionExpression : "attribute_not_exists(#bkcode)",
            ExpressionAttributeNames: {
                "#bkcode":"bkcode"
            }
        };
        console.log("addTransactions-params:"+JSON.stringify(params));
        dynamoDB.dynamoInsertItem(params).then((value)=>{
            // send push message into others for ordr list update
            // 현재부터 48시간(2일)전 까지의 지불되지 않은 주문을 검색한다. 
            var currTime = new Date();
            var currLocalTime=new Date(currTime.getTime()+9*60*60*1000);
            console.log("currTime:"+currLocalTime.toISOString());
            var startLocalTime=new Date(currLocalTime.getTime()-48*60*60*1000);
            let start=startLocalTime.toISOString();
            let end=currLocalTime.toISOString() ;
            let params = {
                TableName: "order",
                FilterExpression: "(#orderedTime between :start and :end) AND #buyerName=:buyerName AND #payment=:payment",
                ExpressionAttributeNames: {
                    "#orderedTime": "orderedTime",
                    "#buyerName":"buyerName",
                    "#payment":"payment"
                },
                ExpressionAttributeValues: {
                    ":start": start,
                    ":end": end ,
                    ":buyerName": record.$.bkjukyo,
                    ":payment":"unpaid"
                }
            };
            dynamoDB.dynamoScanItem(params).then((result)=>{
                //1.48시간이내 동일금액,동일주문자의 주문이 하나만 존재할 경우 해당 주문에 대해 결제한것으로 지정한다.
                //2.만약 동일인은 있으나 금액이 틀릴경우 48시간 이내 주문금액의 합산금액과 입금액이 일치하는지를 확인한다. 주문 합산금액과 입금액이 동일할경우 결제한것으로 지정한다. 
                //3.동일이름,동일주문금액의 주문이 두개 이상 존재할 경우 상점주가 확인하도록 한다.
                //paid,unpaid,ambigious
                if(result.Items.length==1){   
                    if(result.Items[0].totalPrice==record.$.bkinput){ //case 1
                        updatePayment({order:result.Items[0],payment:"paid",bkcode:record.$.bkcode,time:time},function(err,next){
                            if(err){
                                //humm... Can it happen?
                                next(err);
                            }else{
                                //update "checked" with true
                                checkTransaction(record.$.bkcode).then(()=>{
                                    updateLastBKCode().then(()=>{
                                        next(null);
                                    },err=>{
                                        next(err);
                                    });
                                });
                            }
                        });
                    }else{
                            updateLastBKCode().then(()=>{
                                next(null);
                            },err=>{
                                next(err);
                            });
                    }    
                }else if(result.Items.length>1){
                    let i,sum;
                    for(i=0;i<result.Items.length;i++)
                        sum+=parseInt(result.Items[i].totalPrice);
                    if(sum==record.$.bkinput){  //case 2
                        let orders=[];
                        result.Items.forEach(item=>{
                            orders.push({order:item,payment:"paid",bkcode:record.$.bkcode,time:time});
                        })
                        async.map(orders,updatePayment,function(err,eachResult){
                            if(err){
                                //humm.. Can it happen?
                                next(err);
                            }else{
                                checkTransaction(record.$.bkcode).then(()=>{
                                    updateLastBKCode().then(()=>{
                                        next(null);
                                    },err=>{
                                        next(err);
                                    });
                                });
                            }
                        });
                    }else{ //case 3
                        let same=[];
                        result.Items.forEach(item=>{
                            if(item.totalPrice== record.$.bkinput){
                                same.push({order:item,payment:"ambigious",bkcode:record.$.bkcode,time:time});
                            }
                        });
                        async.map(same,updatePayment,function(err,eachResult){
                            if(err){
                                //humm... Can it happen?
                                next(err);
                            }else{
                                checkTransaction(record.$.bkcode).then(()=>{
                                    updateLastBKCode().then(()=>{
                                        next(null);
                                    },err=>{
                                        next(err);
                                    });
                                });
                            }
                        });
                    }
                }else{ // no order, just update bkcode
                        updateLastBKCode().then(()=>{
                            next(null);
                        },err=>{
                            next(err);
                        });
                } 
            },(err)=>{
                console.log("scanOrders "+JSON.stringify(err));
                next(err);
            });
        },err=>{
            console.log("addTransactions "+JSON.stringify(err));
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
                        //All done
                        console.log("All done");
                        response.json({result:"success"});
                    });
                }else{ //no transaction update
                        console.log("no transaction. All done");
                        response.json({result:"success"});
                }
            }); // parse
        });//res.end
        res.on('error', function (err) {
            console.log(err);
        })
    });
    
    // req error
    req.on('error', function (err) {
    console.log(err);
    });
    
    //send request witht the postData form
    req.write(postData);
    req.end();
}

module.exports = router;

//check();
//setInterval(check, 15*60000); //every 15 minutes


