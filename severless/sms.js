let express = require('express');
let router = express.Router();

var https = require('https');

var sms=require('./sms.config');

//console.log("sms:"+JSON.stringify(sms));

sendLMS=function(dataIn){
      return new Promise((resolve,reject)=>{    
            console.log("comes sendLMS : "+JSON.stringify(dataIn));

            var credential = 'Basic '+new Buffer(sms.APPID+':'+sms.APIKEY).toString('base64');

            var data = {
              "sender"     : sms.SENDER,
              "receivers"  : dataIn.receivers,
              "subject"    : dataIn.subject,
              "content"    : dataIn.content
            }
            var body = JSON.stringify(data);
            
            console.log(body);

            var options = {
              host: 'api.bluehouselab.com',
              port: 443,
              path: '/smscenter/v1.0/sendlms',
              headers: {
                'Authorization': credential,
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': Buffer.byteLength(body)
              },
              method: 'POST'
            };

            console.log(options);
            var req = https.request(options, function(res) {
              console.log(res.statusCode);
              var body = "";
              res.on('data', function(d) {
                body += d;
              });
              res.on('end', function(d) {
                if(res.statusCode==200){
                  console.log(JSON.parse(body));
                  resolve();
                }else{
                  console.log(body);
                  reject(body);
                }
              });
            });
            req.write(body);
            req.end();
            req.on('error', function(e) {
                console.error(e);
                reject(e);
            });
      });
};

dayString=function(day){
  switch(day){
    case 0: return "일";break;
    case 1: return "월";break;
    case 2: return "화";break;
    case 3: return "수";break;
    case 4: return "목";break;
    case 5: return "금";break;
    case 6: return "토";break;
  }
};

getOrderList=function(order){
            let content="";
            let i;
            for(i=0;i<order.menuList.length;i++){
              if(order.menuList[i].type=="complex"){ //complex menu
                    content+= order.menuList[i].category;    
              }else if(order.menuList[i].type=="complex-choice"){
                    content+= order.menuList[i].category+"("+order.menuList[i].menuString+") ";
              }else if(order.menuList[i].type=="general"){
                    content+= order.menuList[i].category+"-"+order.menuList[i].menuString+" ";
              }
              if(order.menuList[i].amount)
                  content+= order.menuList[i].amount;
              if(order.menuList[i].unit) 
                  content+=order.menuList[i].unit;
              content+="\n";
            }
            content+=order.price.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+"원\n"; // Why toLocaleString doesn't work?
            if(order.deliveryFee && order.deliveryFee>0){
                console.log("order.totalPrice:"+order.totalPrice);
                content+="택배비:"+order.deliveryFee.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+"원\n";
                content+="총 "+order.totalPrice.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+"원\n";
            }

            let month=parseInt(order.deliveryTime.substr(5,2));
            let date=parseInt(order.deliveryTime.substr(8,2));
            let deliveryDate=new Date(order.deliveryTime); //local time

            content+="떡 발송 날짜 - "+month+"/"+date+" "+ dayString(deliveryDate.getUTCDay()); 
            content+='\n주문감사합니다.\n';  
            return content;          
}

router.notifyOrder=function(order){
      return new Promise((resolve,reject)=>{  
           let content="";  
           if(order.paymentMethod=="cash"){
               if(order.payment=="paid-pre"){ //"현금선불-완납" (OK)
                    content+=getOrderList(order);
                    content+="*결제완료(현금)\n";
               }else if(order.payment=="unpaid-after"){ //"현금후불" (OK)
                    content="010-377088-82607\n 하나은행 최대웅\n";
                    content+=getOrderList(order);
                    content+="*결제미수(현금)\n";
               }else if(order.payment=="paid-after"){ //"현금후불-완납"
                    resolve();                    
               }else if(order.payment=="unpaid-transaction"){ //"현금이체" (OK)
                    content="010-377088-82607\n 하나은행 최대웅\n";
                    content+=getOrderList(order);
                    content+="*결제미수(계좌이체)\n";
               }else if(order.payment=="paid"){ //"현금이체-완납"
                    resolve();
               }else if(order.payment=="unknown"){ //"현금보류"
                    resolve();
               }else if(order.payment=="month"){ //"월말정산"
                    resolve();
               }
           }else if(order.paymentMethod=="card"){ //must be card
               if(order.payment=="paid-pre"){ //"카드선불" (OK)
                    content+=getOrderList(order);
                    content+="*결제완료(카드)\n";
               }else if(order.payment=="unpaid"){ //"카드기" (OK)
                    content="010-377088-82607\n 하나은행 최대웅\n";
                    content+=getOrderList(order);
                    content+="*결제미수(카드기)\n";
               }else if(order.payment=="paid"){ //"카드기-완납"
                    resolve();
               }
           }
    
            content+='*주문변경 및 취소는 2~3일 전에 매장 전화로만 가능합니다.\n (02-333-8880)(02-337-6376)\n *문자상담은 어렵습니다.\n *상담가능시간 오전6:00~오후6:00(일요일휴무)';
            console.log("content:"+content);
            
            let phoneNumber= order.buyerPhoneNumber.replace(/-/g, "");
            let sender={receivers:[phoneNumber],
                      subject:"경기떡집입니다.",
                      content: content
                    };
            console.log("sender:"+JSON.stringify(sender));
            sendLMS(sender).then(()=>{
                resolve();
            },err=>{
                console.log("SMS-문자발송오류");
                reject("SMS-문자발송오류");
            });
      });
}

module.exports = router;