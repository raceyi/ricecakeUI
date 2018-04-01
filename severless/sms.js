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

/*
let order={
     menuList:[{category:'맵떡',name:'이티',amount:1,unit:'kg'},{category:'찰떡',name:'단호박',amount:30,unit:"개"}],
     price: 57000,
     deliveryFee:6000,
     totalPrice: 63000,
     deliveryTime:"2018-03-21T09:00:01.553Z"
}
*/

router.notifyOrder=function(order){
      return new Promise((resolve,reject)=>{    

            let content="010-377088-82607\n 하나은행 최대웅\n";

            let i;
            for(i=0;i<order.menuList.length;i++){
                content+= order.menuList[i].category+"-"+order.menuList[i].menuString+" "+order.menuList[i].amount+order.menuList[i].unit+"\n";
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
            content+=' *입금부탁드립니다.\n \
            *주문변경 및 취소는 2~3일 전에 매장 전화로만 가능합니다.\n \
            (02-333-8880)(02-337-6376)\n \
            *문자상담은 어렵습니다.\n \
            *상담가능시간 오전6:00~오후6:00(일요일휴무)';

            console.log("content:"+content);
            
            let phoneNumber= order.recipientPhoneNumber.replace(/-/g, "");
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