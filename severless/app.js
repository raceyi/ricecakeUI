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
var manager =require('./manager');
var produce = require('./produce');

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
            console.log("addOrder err:"+JSON.stringify(err));
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

app.post('/getOrdersWithHide',(req,res) =>{
        order.getOrdersWithHide(req.body).then(value=>{
            res.json({result:"success",orders:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        })
});

app.post('/deleteOrders',(req,res) =>{
        console.log("deleteOrders:",req.body);
        order.deleteOrders(req.body).then(value=>{
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
app.post('/addComplexMenu',(req,res) =>{
        console.log("addComplexMenu:",req.body);
        menu.addComplexMenu(req.body).then((value)=>{
            res.json({result:"success",menus:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/addMenu',(req,res) =>{
        console.log("addMenu:",req.body);
        menu.addMenu(req.body).then((value)=>{
            res.json({result:"success",menus:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/changeSequence',(req,res)=>{
        console.log("changeSequence with "+JSON.stringify(req.body.registrationId));
        menu.changeSequences(req.body).then((value)=>{
            res.json({result:"success",menus:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});            
        })
})

app.post('/removeMenu',(req,res) =>{
        console.log("removeMenu:",req.body);
        menu.deleteMenu(req.body).then((value)=>{
            res.json({result:"success",menus:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});


app.post('/removeCategory',(req,res) =>{
        console.log("removeCategory:",req.body);
        menu.removeCategory(req.body).then((value)=>{
            res.json({result:"success",menus:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/getMenus',(req,res) =>{
        console.log("getMenus:",req.body);
        menu.getMenus().then(value=>{
            console.log("value:"+value);
            res.json({result:"success",menus:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/addCategory',(req,res)=>{
        console.log("addCategory:",req.body);
        menu.addCategory(req.body).then((value)=>{
            res.json({result:"success",menus:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/deactivateMenu',(req,res)=>{
        console.log("deactivateMenu:",JSON.stringify(req.body));    
        menu.deactivateMenu(req.body).then((value)=>{
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
            carrier.addCarrier(req.body).then(()=>{
                res.json({result:"success"});
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
            carrier.deleteCarrier(req.body).then(()=>{
                res.json({result:"success"});
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
        console.log("registerDeviceRegistrationId:",req.body.registrationId);
        device.putRegistrationId(req.body.registrationId,req.body.android).then((value)=>{
            console.log("value:"+value);            
            res.json({result:"success"});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/checkPIN',(req,res) =>{
        console.log("checkPIN:",req.body);
        manager.checkPIN(req.body).then(pinNumber=>{
            console.log("value:"+pinNumber);
            if(req.body.pin!=pinNumber){
                res.json({result:"failure",error:"invalidPIN"});
            }else
                res.json({result:"success"});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/checkInstallPIN',(req,res) =>{
        console.log("checkInstallPIN:",req.body);
        manager.checkInstallPIN(req.body).then(pinNumber=>{
            console.log("value:"+pinNumber);
            if(req.body.pin!=pinNumber){
                res.json({result:"failure",error:"invalidPIN"});
            }else
                res.json({result:"success"});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post("/modifyPIN",(req,res)=>{
        console.log("modifyPIN:",req.body);
        manager.modifyPIN(req.body).then(()=>{
            res.json({result:"success"});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
    
});

app.post("/modifyInstallPin",(req,res)=>{
        console.log("modifyInstallPin:",req.body);
        manager.modifyInstallPin(req.body).then(()=>{
            res.json({result:"success"});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
    
});

app.post('/getSalesWithBuyer',(req,res) =>{
        console.log("getSalesWithBuyer:",req.body);
        manager.getSalesWithBuyer(req.body).then(value=>{
            console.log("value:"+value);
            res.json({result:"success",sales:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/getSales',(req,res) =>{
        console.log("getSales:",req.body);
        manager.getSales(req.body).then(value=>{
            console.log("value:"+value);
            res.json({result:"success",sales:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/getProduceTitle',(req,res) =>{
        console.log("getProduceTitle:",req.body);
        produce.getProduceTitle(req.body).then(value=>{
            console.log("value:"+value);
            res.json({result:"success",list:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

app.post('/saveProduceTitle',(req,res) =>{
        console.log("saveProduceTitle:",req.body);
        produce.saveProduceTitle(req.body).then(value=>{
            console.log("value:"+value);
            res.json({result:"success",list:value});
        },err=>{
            res.json({result:"failure",error:JSON.stringify(err)});
        });
});

module.exports = app

