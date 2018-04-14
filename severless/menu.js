let express = require('express');
let router = express.Router();
let async = require('async');

var AWS = require("aws-sdk");

let device = require('./device');
//var dynamoDB = require("./dynamo");
var dynamoDB = require('./dynamo.test');

updateEachMenu=function(menu,next){
    console.log("updateEachMenu-menu:"+JSON.stringify(menu));
    var params = {
            TableName:"menu",
            Key:{
                        "category":menu.category,
                        "menu":menu.menu
            },
            UpdateExpression:"set categorySeq = :categorySeq, menuSeq=:menuSeq",
            ExpressionAttributeValues:{
                ":categorySeq":menu.categorySeq,
                ":menuSeq":menu.menuSeq
            },
            ReturnValues:"UPDATED_NEW"
        };
        dynamoDB.dynamoUpdateItem(params).then(result=>{
                next(null);
        },err=>{
                console.log("!!!!"+JSON.stringify(params));
                next(err);
        })
}

deleteEachMenu=function(menu,next){
    var params = {
        TableName:"menu",
        Key:{
            "category": menu.category,
            "menu":menu.menu
        }
    };
    console.log("deleteEachMenu-params:"+JSON.stringify(params));                
    dynamoDB.dynamoDeleteItem(params).then((result)=>{
            next(null,result);
    },(err)=>{
            next(err);
    });
}

updateMenuSequences=function(menus){   //menu: category, menu, categorySeq,menuSeq
        console.log("updateMenuSequences-menus:"+JSON.stringify(menus));
        return new Promise((resolve,reject)=>{
                async.map(menus,updateEachMenu,function(err,eachResult){
                        if(err){
                            reject(err);
                        }else{
                            resolve();
                        }
                });
        });
}

router.changeSequences=function(param){
        console.log("sequences:"+JSON.stringify(param.sequences));
        return new Promise((resolve,reject)=>{            
                    notifyMenusAndReturn(param).then((data)=>{
                        resolve(data);
                        },err=>{
                        reject(err);
                        })
                },err=>{
                    reject();
                });
}

router.removeCategory=function(param){
        return new Promise((resolve,reject)=>{
      //get all menus with the same category and delete it.
      async.waterfall([function(callback){
         // category의 모든 menu를 가져온다.
         //param.category;
        let params = {
            TableName: "menu",
            FilterExpression: "#category=:category",
            ExpressionAttributeNames: {
                "#category": "category"
            },
            ExpressionAttributeValues: {
                ":category": param.category
            }
        };
        dynamoDB.dynamoScanItem(params).then((result)=>{
            // let sort menus group by category and sort by category & name                        
            callback(null,result.Items);
        },err=>{
            callback(err);
        });
      },function(menus,callback){
        // menu를 삭제한다.
        console.log("menus:"+JSON.stringify(menus));
        async.map(menus,deleteEachMenu,function(err,eachResult){
                        if(err){
                            callback(err);
                        }else{
                            callback(null);
                        }
        });
      }],function(err,result){
         if(err){
            console.log(err);
            next(err);
         }else{
            notifyMenusAndReturn(param).then((data)=>{
                resolve(data);
            },err=>{
                reject(err);
            })
         }
      });
    });
}

notifyMenusAndReturn=function(param){  // sequence변경이 필요하다면 변경하고 notifyAll호출이후 getMenus를 호출하여 변경된 menu를 return한다.
        return new Promise((resolve,reject)=>{
                        if(param.sequences && param.sequences.length>0){
                        updateMenuSequences(param.sequences).then(()=>{
                            device.notifyAll("menu").then(()=>{
                                // return all menu table
                                router.getMenus().then((data)=>{
                                    resolve(data);
                                },err=>{
                                    reject(err);
                                })
                            },err=>{
                                reject(err);
                            });
                        },err=>{
                            reject(err);
                        });
                    }else{
                            device.notifyAll("menu").then(()=>{
                                // return all menu table
                                router.getMenus().then((data)=>{
                                    resolve(data);
                                },err=>{
                                    reject(err);
                                })
                            },err=>{
                                reject(err);
                            });
                    }
        });
} 

router.addCategory=function(param){
    return new Promise((resolve,reject)=>{
      async.waterfall([function(callback){
         // category의 모든 menu를 가져온다.
         //param.category;
        let params = {
            TableName: "menu",
        };
        dynamoDB.dynamoScanItem(params).then((result)=>{
            // let sort menus group by category and sort by category & name 
            let i;
            for(i=0;i<result.Items.length;i++){
                let menu=result.Items[i];
                if(menu.category==param.category){
                    callback("이미존재하는 카테고리입니다.");
                    break;
                }
            }                       
            if(i==result.Items.length)
                callback(null,result.Items);
        },err=>{
            callback(err);
        });
      },function(menus,callback){
                let menu="empty";
                let item={
                        "category":param.category,
                        "menu":menu,
                        "type":param.type,
                        "categorySeq":param.categorySeq                    
                };
                //add type,categorySeq
                let params={
                    TableName:"menu",
                    Item:item,
                    ReturnValues:"NONE"
                };
                console.log("addCategory-params:"+JSON.stringify(params));
                dynamoDB.dynamoInsertItem(params).then((value)=>{
                    // send push message into others for ordr list update
                    // 모든 db update에 대해 push 메시지가 전달되어야 한다.
                            callback(null);
                 },err=>{
                    console.log("err code"+JSON.stringify(err)); //Please check error code here
                    callback(err);
                });
      }],function(err,result){
         if(err){
            console.log(err);
            reject(err);
         }else{
            notifyMenusAndReturn(param).then((data)=>{
                resolve(data);
            },err=>{
                reject(err);
            })
         }
      });
    });
}

router.addComplexMenu=function(param){
    console.log("addComplexMenu comes with "+JSON.stringify(param));
    return new Promise((resolve,reject)=>{
      async.waterfall([function(callback){
         // category의 모든 menu를 가져온다.
        let params = {
            TableName: "menu",
            FilterExpression: "#category=:category",
            ExpressionAttributeNames: {
                "#category": "category"
            },
            ExpressionAttributeValues: {
                ":category": param.category
            }
        };
        dynamoDB.dynamoScanItem(params).then((result)=>{
            //기존 메뉴가 있다면 기존 메뉴를 삭제한다.
            let i=0;
            for(i=0;i<result.Items.length;i++){
                let menu=result.Items[i];
                if(menu.menu==param.menu && (!param.choiceNumber || !menu.choiceNumber)){ // empty란 이름의 메뉴는 추가 불가능하다.
                    callback("이미존재하는 메뉴입니다.");
                    break;
                }
            }   
            if(i==result.Items.length){ 
                if(result.Items.length>1){
                    // 기존 complex 메뉴를 지운다.
                    let emptyIndex=result.Items.findIndex(function(val){return val.menu=="empty"}); 
                    let exsitingIndex=(emptyIndex==0?1:0);
                    // 0과 1중에 하나만 있어야 한다. 
                    var params = {
                        TableName:"menu",
                        Key:{
                                    "category":result.Items[exsitingIndex].category,
                                    "menu":result.Items[exsitingIndex].menu
                        },
                        ReturnValues:"NONE"
                    };
                    console.log("addComplexMenu-params:"+JSON.stringify(params));                
                    dynamoDB.dynamoDeleteItem(params).then((result)=>{
                        console.log("save menu");
                        callback(null,result.Items);                        
                    },(err)=>{
                        callback(err);
                    });
                }else{
                    console.log("save menu");
                    callback(null,result.Items);
                }
            }
        },err=>{
            callback(err);
        });
      },function(menus,callback){
                console.log("add menus");
                let item={
                        "category":param.category,
                        "menu":param.menu,
                        "categorySeq":param.categorySeq,
                        "menuSeq":param.menuSeq                    
                };
                if(param.choiceNumber){
                      item.choiceNumber=param.choiceNumber; 
                }
                let params={
                    TableName:"menu",
                    Item:item,
                    ReturnValues:"NONE"
                };
                console.log("addComplexMenu-params:"+JSON.stringify(params));
                dynamoDB.dynamoInsertItem(params).then((value)=>{
                    // send push message into others for ordr list update
                    // 모든 db update에 대해 push 메시지가 전달되어야 한다.
                    callback(null);
                },err=>{
                    console.log("err code"+JSON.stringify(err)); //Please check error code here
                    callback(err);
                });
      }],function(err,result){
         if(err){
            console.log(err);
            reject(err);
         }else{
            notifyMenusAndReturn(param).then((data)=>{
                resolve(data);
            },err=>{
                reject(err);
            })
         }
      });        
    });
}

router.addMenu=function (param){ // aws lamda에서는 아직 async-lock을 사용할수 없다. 일단 동시에 메뉴수정은 없을 것으로 가정한다.
    console.log("addMenu comes with "+JSON.stringify(param));
    return new Promise((resolve,reject)=>{
      async.waterfall([function(callback){
         // category의 모든 menu를 가져온다.
        let params = {
            TableName: "menu",
            FilterExpression: "#category=:category",
            ExpressionAttributeNames: {
                "#category": "category"
            },
            ExpressionAttributeValues: {
                ":category": param.category
            }
        };
        dynamoDB.dynamoScanItem(params).then((result)=>{
            // let sort menus group by category and sort by category & name 
            let i=0;
            for(i=0;i<result.Items.length;i++){
                let menu=result.Items[i];
                if(menu.menu==param.menu){
                    callback("이미존재하는 메뉴입니다.");
                    break;
                }
            }   
            if(i==result.Items.length){ 
                console.log("save menu");
                callback(null,result.Items);
            }
        },err=>{
            callback(err);
        });
      },function(menus,callback){
                console.log("add menus");
                let item={
                        "category":param.category,
                        "menu":param.menu,
                        "categorySeq":param.categorySeq,
                        "menuSeq":param.menuSeq                    
                };
                if(param.choiceNumber){
                      item.choiceNumber=param.choiceNumber; 
                }
                let params={
                    TableName:"menu",
                    Item:item,
                    ReturnValues:"NONE"
                };
                console.log("addMenu-params:"+JSON.stringify(params));
                dynamoDB.dynamoInsertItem(params).then((value)=>{
                    // send push message into others for ordr list update
                    // 모든 db update에 대해 push 메시지가 전달되어야 한다.
                    callback(null);
                },err=>{
                    console.log("err code"+JSON.stringify(err)); //Please check error code here
                    callback(err);
                });
      }],function(err,result){
         if(err){
            console.log(err);
            reject(err);
         }else{
            notifyMenusAndReturn(param).then((data)=>{
                resolve(data);
            },err=>{
                reject(err);
            })
         }
      });        
    });
}

router.deleteMenu=function(param){ // general menu에만 호출된다.
    console.log("deleteMenu comes");
    return new Promise((resolve,reject)=>{
            var params = {
                TableName:"menu",
                Key:{
                            "category":param.category,
                            "menu":param.menu
                },
                ReturnValues:"NONE"

            };
            console.log("deleteMenu-params:"+JSON.stringify(params));                
            dynamoDB.dynamoDeleteItem(params).then((result)=>{
                            notifyMenusAndReturn(param).then((data)=>{
                                resolve(data);
                            },err=>{
                                reject(err);
                            })
            },(err)=>{
                console.log("err code"+JSON.stringify(err)); //Please check error code here???
                if(err.code=="ConditionalCheckFailedException"){
                    reject("AlreadyDeleted");
                }else
                    reject(err);
            });
    });
}

router.getMenus=function (){
    return new Promise((resolve,reject)=>{
                    let params = {
                        TableName: "menu"
                    };
                    dynamoDB.dynamoScanItem(params).then((result)=>{
                        // let sort menus group by category and sort by category & name                        
                        resolve(result.Items);
                    },err=>{
                        reject(err);
                    });
                },err=>{
                        reject(err);
                });
}

module.exports = router;

/*
console.log("menus: "+JSON.stringify(router.getMenus()));


let menus=[
    {
      "category": "십리향2송이",
      "menu": "[{\"완두(기계)\":3},{\"모듬(기계)\":3},{\"밤콩(기계)\":3},{\"쑥밤콩(기계)\":3},{\"약식(기계)\":3},{\"호박(기계)\":3}]"
    },
    {
      "category": "백리향2송이",
      "menu": "[{\"쑥밤콩(미니랩)\":3},{\"호박(미니랩)\":3},{\"모듬(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3},{\"완두(미니랩)\":3},{\"딸기(미니랩)\":9},{\"고구마호박찰(미니랩)\":12}]"
    },
    {
      "category": "십리향3송이(흑임자)",
      "menu": "[{\"완두(기계)\":3},{\"호박(기계)\":3},{\"모듬(기계)\":3},{\"약식(기계)\":3},{\"밤콩(기계)\":3},{\"쑥밤콩(기계)\":3}]"
    },
    {
      "category": "백리향1송이",
      "menu": "[{\"호박(미니랩)\":3},{\"쑥밤콩(미니랩)\":3},{\"밤콩(미니랩)\":3},{\"고구마호박찰(미니랩)\":3},{\"완두(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3},{\"모듬(미니랩)\":3}]"
    },
    {
      "category": "백리향2송이(이티)",
      "menu": "[{\"고구마호박찰(미니랩)\":12},{\"호박(미니랩)\":3},{\"쑥밤콩(미니랩)\":3},{\"완두(미니랩)\":3},{\"모듬(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3}]"
    },
    {
      "category": "멥떡",
      "menu": "가래떡"
    },
    {
      "category": "멥떡",
      "menu": "꿀떡"
    },
    {
      "category": "멥떡",
      "menu": "녹두호박설기"
    },
    {
      "category": "멥떡",
      "menu": "단호박소담"
    },
    {
      "category": "멥떡",
      "menu": "대추편"
    },
    {
      "category": "멥떡",
      "menu": "딸기설기"
    },
    {
      "category": "멥떡",
      "menu": "멥편 (팥)"
    },
    {
      "category": "멥떡",
      "menu": "멥편(기피)"
    },
    {
      "category": "멥떡",
      "menu": "멥편(녹두)"
    },
    {
      "category": "멥떡",
      "menu": "멥편(콩)"
    },
    {
      "category": "멥떡",
      "menu": "무지개설기"
    },
    {
      "category": "멥떡",
      "menu": "미니설기(100)"
    },
    {
      "category": "멥떡",
      "menu": "미니설기(무지)"
    },
    {
      "category": "멥떡",
      "menu": "미니설기(첫돌)"
    },
    {
      "category": "멥떡",
      "menu": "미니설기(하트)"
    },
    {
      "category": "멥떡",
      "menu": "바람떡"
    },
    {
      "category": "멥떡",
      "menu": "밤콩설기"
    },
    {
      "category": "멥떡",
      "menu": "백설기"
    },
    {
      "category": "멥떡",
      "menu": "송편"
    },
    {
      "category": "멥떡",
      "menu": "쑥밤콩설기"
    },
    {
      "category": "멥떡",
      "menu": "잣설기"
    },
    {
      "category": "멥떡",
      "menu": "절편(2색)"
    },
    {
      "category": "멥떡",
      "menu": "절편(쑥)"
    },
    {
      "category": "멥떡",
      "menu": "절편(흰)"
    },
    {
      "category": "멥떡",
      "menu": "초코설기"
    },
    {
      "category": "멥떡",
      "menu": "현미설기"
    },
    {
      "category": "멥떡",
      "menu": "흑임자설기"
    },
    {
      "category": "십리향1송이",
      "menu": "[{\"완두(기계)\":3},{\"호박(기계)\":3},{\"모듬(기계)\":3}]"
    },
    {
      "category": "찰떡",
      "menu": "고구마호박찰"
    },
    {
      "category": "찰떡",
      "menu": "기피인절미"
    },
    {
      "category": "찰떡",
      "menu": "기피편"
    },
    {
      "category": "찰떡",
      "menu": "깨편"
    },
    {
      "category": "찰떡",
      "menu": "녹두편"
    },
    {
      "category": "찰떡",
      "menu": "모듬영양"
    },
    {
      "category": "찰떡",
      "menu": "시루떡"
    },
    {
      "category": "찰떡",
      "menu": "쑥인절미"
    },
    {
      "category": "찰떡",
      "menu": "약식"
    },
    {
      "category": "찰떡",
      "menu": "완두시루"
    },
    {
      "category": "찰떡",
      "menu": "이티"
    },
    {
      "category": "찰떡",
      "menu": "콩깨편"
    },
    {
      "category": "찰떡",
      "menu": "콩영양"
    },
    {
      "category": "찰떡",
      "menu": "콩인절미"
    },
    {
      "category": "찰떡",
      "menu": "콩편"
    },
    {
      "category": "찰떡",
      "menu": "함시루"
    },
    {
      "category": "찰떡",
      "menu": "현미모듬"
    },
    {
      "category": "찰떡",
      "menu": "현미쑥인절미"
    },
    {
      "category": "찰떡",
      "menu": "현미인절미"
    },
    {
      "category": "찰떡",
      "menu": "흑임자인절미"
    },
    {
      "category": "찰떡",
      "menu": "흰인절미"
    },
    {
      "category": "기타",
      "menu": "견과류강정"
    },
    {
      "category": "기타",
      "menu": "멥밥"
    },
    {
      "category": "기타",
      "menu": "미숫가루(고품격)"
    },
    {
      "category": "기타",
      "menu": "미숫가루(오곡)"
    },
    {
      "category": "기타",
      "menu": "미숫가루(흑임자)"
    },
    {
      "category": "기타",
      "menu": "수수팥(2색)"
    },
    {
      "category": "기타",
      "menu": "수수팥(카스테라)"
    },
    {
      "category": "기타",
      "menu": "수수팥(팥)"
    },
    {
      "category": "기타",
      "menu": "약과"
    },
    {
      "category": "기타",
      "menu": "오곡밥"
    },
    {
      "category": "기타",
      "menu": "오곡밥(팥만)"
    },
    {
      "category": "십리향3송이(이티)",
      "menu": "[{\"호박(기계)\":3},{\"모듬(기계)\":3},{\"약식(기계)\":3},{\"쑥밤콩(기계)\":3},{\"밤콩(기계)\":3},{\"완두(기계)\":3}]"
    }
  ];

let sortMenus=menus.sort(function(a,b){
                            if (a.category > b.category) return 1;
                            if (a.category < b.category) return -1;
                            if(a.menu>b.menu) return 1;
                            if(a.menu<b.menu) return -1;
                            return 0;
                    } );

sortMenu=[{"category":"기타","menu":"견과류강정"},
           {"category":"기타","menu":"멥밥"},
           {"category":"기타","menu":"미숫가루(고품격)"},
           {"category":"기타","menu":"미숫가루(오곡)"},
           {"category":"기타","menu":"미숫가루(흑임자)"},
           {"category":"기타","menu":"수수팥(2색)"},
           {"category":"기타","menu":"수수팥(카스테라)"},
           {"category":"기타","menu":"수수팥(팥)"},
           {"category":"기타","menu":"약과"},
           {"category":"기타","menu":"오곡밥"},
           {"category":"기타","menu":"오곡밥(팥만)"},
           {"category":"멥떡","menu":"가래떡"},{"category":"멥떡","menu":"꿀떡"},{"category":"멥떡","menu":"녹두호박설기"},{"category":"멥떡","menu":"단호박소담"},{"category":"멥떡","menu":"대추편"},{"category":"멥떡","menu":"딸기설기"},{"category":"멥떡","menu":"멥편 (팥)"},{"category":"멥떡","menu":"멥편(기피)"},{"category":"멥떡","menu":"멥편(녹두)"},{"category":"멥떡","menu":"멥편(콩)"},{"category":"멥떡","menu":"무지개설기"},{"category":"멥떡","menu":"미니설기(100)"},{"category":"멥떡","menu":"미니설기(무지)"},{"category":"멥떡","menu":"미니설기(첫돌)"},{"category":"멥떡","menu":"미니설기(하트)"},{"category":"멥떡","menu":"바람떡"},{"category":"멥떡","menu":"밤콩설기"},{"category":"멥떡","menu":"백설기"},{"category":"멥떡","menu":"송편"},{"category":"멥떡","menu":"쑥밤콩설기"},{"category":"멥떡","menu":"잣설기"},{"category":"멥떡","menu":"절편(2색)"},{"category":"멥떡","menu":"절편(쑥)"},{"category":"멥떡","menu":"절편(흰)"},{"category":"멥떡","menu":"초코설기"},{"category":"멥떡","menu":"현미설기"},{"category":"멥떡","menu":"흑임자설기"},{"category":"백리향1송이","menu":"[{\"호박(미니랩)\":3},{\"쑥밤콩(미니랩)\":3},{\"밤콩(미니랩)\":3},{\"고구마호박찰(미니랩)\":3},{\"완두(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3},{\"모듬(미니랩)\":3}]"},{"category":"백리향2송이","menu":"[{\"쑥밤콩(미니랩)\":3},{\"호박(미니랩)\":3},{\"모듬(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3},{\"완두(미니랩)\":3},{\"딸기(미니랩)\":9},{\"고구마호박찰(미니랩)\":12}]"},{"category":"백리향2송이(이티)","menu":"[{\"고구마호박찰(미니랩)\":12},{\"호박(미니랩)\":3},{\"쑥밤콩(미니랩)\":3},{\"완두(미니랩)\":3},{\"모듬(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3}]"},{"category":"십리향1송이","menu":"[{\"완두(기계)\":3},{\"호박(기계)\":3},{\"모듬(기계)\":3}]"},{"category":"십리향2송이","menu":"[{\"완두(기계)\":3},{\"모듬(기계)\":3},{\"밤콩(기계)\":3},{\"쑥밤콩(기계)\":3},{\"약식(기계)\":3},{\"호박(기계)\":3}]"},{"category":"십리향3송이(이티)","menu":"[{\"호박(기계)\":3},{\"모듬(기계)\":3},{\"약식(기계)\":3},{\"쑥밤콩(기계)\":3},{\"밤콩(기계)\":3},{\"완두(기계)\":3}]"},{"category":"십리향3송이(흑임자)","menu":"[{\"완두(기계)\":3},{\"호박(기계)\":3},{\"모듬(기계)\":3},{\"약식(기계)\":3},{\"밤콩(기계)\":3},{\"쑥밤콩(기계)\":3}]"},{"category":"찰떡","menu":"고구마호박찰"},{"category":"찰떡","menu":"기피인절미"},{"category":"찰떡","menu":"기피편"},{"category":"찰떡","menu":"깨편"},{"category":"찰떡","menu":"녹두편"},{"category":"찰떡","menu":"모듬영양"},{"category":"찰떡","menu":"시루떡"},{"category":"찰떡","menu":"쑥인절미"},{"category":"찰떡","menu":"약식"},{"category":"찰떡","menu":"완두시루"},{"category":"찰떡","menu":"이티"},{"category":"찰떡","menu":"콩깨편"},{"category":"찰떡","menu":"콩영양"},{"category":"찰떡","menu":"콩인절미"},{"category":"찰떡","menu":"콩편"},{"category":"찰떡","menu":"함시루"},{"category":"찰떡","menu":"현미모듬"},{"category":"찰떡","menu":"현미쑥인절미"},{"category":"찰떡","menu":"현미인절미"},{"category":"찰떡","menu":"흑임자인절미"},{"category":"찰떡","menu":"흰인절미"}];

  console.log("sortMenus:"+JSON.stringify(sortMenus));

  let categorySeq=0,menuSeq=0;
  let menusWithSeq=[];
  let currentCategory="기타";

  sortMenu.forEach(menu=>{
      if(menu.category==currentCategory){
            menusWithSeq.push({category:menu.category,menu:menu.menu,categorySeq:categorySeq,menuSeq:menuSeq});
            menuSeq++;
      }else{
          menuSeq=0;
          categorySeq++;
          currentCategory=menu.category;
          menusWithSeq.push({category:menu.category,menu:menu.menu,categorySeq:categorySeq,menuSeq:menuSeq});
          menuSeq++;          
      }
  })

  console.log("output:"+JSON.stringify(menusWithSeq));

router.addCategory({category:"십리향2송이" ,categorySeq: 0, type:"complex", sequences:[]});
router.addCategory({category: "백리향2송이",categorySeq: 1, type:"complex", sequences:[]});
router.addCategory({category: "십리향3송이(흑임자)",categorySeq: 2,type:"complex",  sequences:[]});
router.addCategory({category: "백리향1송이",categorySeq: 3, type:"complex", sequences:[]});
router.addCategory({category: "백리향2송이(이티)",categorySeq: 4, type:"complex", sequences:[]});
router.addCategory({category: "멥떡",categorySeq: 5, type:"general", sequences:[]});
router.addCategory({category: "십리향1송이",categorySeq: 6,type:"complex",  sequences:[]});
router.addCategory({category: "찰떡",categorySeq: 7, type:"general",sequences:[]});
router.addCategory({category: "기타",categorySeq: 8, type:"general",sequences:[]});
router.addCategory({category: "십리향3송이(이티)",categorySeq: 9, type:"complex", sequences:[]});

menusWithSeq.forEach(menu=>{
    if(menu.menu.indexOf("[")==0){//complex menu
        router.addComplexMenu( {category:menu.category,categorySeq:menu.categorySeq , menu:menu.menu,menuSeq:menu.menuSeq});
    }else{ //general menu
        router.addMenu( {category:menu.category,categorySeq:menu.categorySeq , menu:menu.menu,menuSeq:menu.menuSeq});
    }
})
*/
  