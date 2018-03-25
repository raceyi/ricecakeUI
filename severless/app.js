'use strict'

var bodyParser = require('body-parser')

const express = require('express')
const app = express()

var cors = require('cors');
var order= require('./order');
var menu = require('./menu');
var carrier = require('./carrier');
var bankda = require('./bankda');
var device = require('./device');
var atomicCounter = require('./atomic-counter');

//var bankda = JSON.parse(require('fs').readFileSync('./bankda.json', 'utf8'));

//app.use(cors());
app.use(bodyParser.json());
app.all('*',function(req,res,next){
/*    
      let names=Object.keys(req); 
      names.forEach(name=>{
          console.log("name:"+name);
      })
      //console.log("req.url:"+req.url+"req.body:"+JSON.stringify(req.body));

      if(req.hasOwnProperty("_events"))
            console.log("events:"+JSON.stringify(req._events));
      console.log("originalUrl:"+req.originalUrl);
      if(typeof req.route ==="object")
            console.log("route:"+JSON.stringify(req.route));
      console.log("domain:"+req.domain); //null
      console.log("method:"+req.method); //GET
      if(typeof req.params ==="object" )
        console.log("params:"+JSON.stringify(req.params));
      console.log("req.url:"+req.url);
*/
      if(req.url=="/"){ // anyother way to recognize timer events.
            console.log("call bankda");
            //res.json({result:"success"});
            bankda.bankda(res);
      }else      
            next();
});

app.post('/addOrder',(req,res) =>{
        console.log("addOrder:",JSON.stringify(req.body));
        order.addOrder(req.body).then(value=>{
            console.log("value:"+value);
            res.json({result:"success",id:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/getOrderWithDeliveryDate',(req,res) =>{
        console.log("getOrderWithDeliveryDate:"+JSON.stringify(req.body));
        order.getOrderWithDeliveryDate(req.body).then(value=>{
            res.json({result:"success",orders:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        })
});

app.post('/deleteOrder',(req,res) =>{
        console.log("deleteOrder:",req.body);
        order.deleteOrder(req.body).then(value=>{
            res.json({result:"success"});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/hideOrder',(req,res) =>{
        console.log("hideOrder:",req.body);
        order.hideOrder(req.body).then(value=>{
            res.json({result:"success"});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/showOrder',(req,res) =>{
        console.log("showOrder:",req.body);
        order.showOrder(req.body).then(value=>{
            res.json({result:"success"});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/updateOrder',(req,res) =>{
        console.log("updateOrder:",req.body);
        order.updateOrder(req.body).then(value=>{
            res.json({result:"success"});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/assignCarrier',(req,res) =>{
        console.log("assignCarrier:",req.body);
        order.assignCarrier(req.body).then(value=>{
            res.json({result:"success"});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});


app.post('/addMenu',(req,res) =>{
        console.log("addMenu:",req.body);
        menu.addMenu(req.body).then(value=>{
            console.log("value:"+value);
            res.json({result:"success",menus:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/deleteMenu',(req,res) =>{
        console.log("deleteMenu:",req.body);
        menu.deleteMenu(req.body).then(value=>{
            console.log("value:"+value);
            res.json({result:"success",menus:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/getMenus',(req,res) =>{
        console.log("getMenus:",req.body);
        menu.getMenus(req.body).then(value=>{
            console.log("value:"+value);
            res.json({result:"success",menus:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/addCarrier',(req,res) =>{
        console.log("addCarrier:",req.body);
        if(!req.body.name){
                res.json({result:"failure",error:"invalid Param"});
        }else{
            carrier.addCarrier(req.body).then(value=>{
                console.log("value:"+value);
                res.json({result:"success",carriers:value});
            },err=>{
                res.json({result:"failure",error:JSON.stringify(err)});
            });
        }
});

app.post('/deleteCarrier',(req,res) =>{
        console.log("deleteCarrier:",req.body);
        if(!req.body.name){
                res.json({result:"failure",error:"invalid Param"});
        }else{        
            carrier.deleteCarrier(req.body).then(value=>{
                console.log("value:"+value);
                res.json({result:"success",carriers:value});
            },err=>{
                res.json({result:"failure",error:JSON.stringify(err)});
            });
        }
});

app.post('/getCarriers',(req,res) =>{
        console.log("getCarrier:",req.body);
        carrier.getCarriers(req.body).then(value=>{
            console.log("value:"+value);
            res.json({result:"success",carriers:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/registerDeviceRegistrationId',(req,res) =>{
        console.log("registerDeviceRegistrationId:",req.body);
        carrier.putRegistrationId(req.body).then(value=>{
            console.log("value:"+value);
            res.json({result:"success"});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

module.exports = app
