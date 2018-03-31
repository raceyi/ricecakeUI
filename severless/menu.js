let express = require('express');
let router = express.Router();

var AWS = require("aws-sdk");
var dynamoDB = require("./dynamo");

router.addMenu=function (param){
    return new Promise((resolve,reject)=>{
                let params={
                    TableName:"menu",
                    Item:{
                        "name":param.name
                    },
                    ConditionExpression : "attribute_not_exists(#name)",
                    ExpressionAttributeNames: {
                        "#name":"name"
                    }
                };
                console.log("addOrder-params:"+JSON.stringify(params));
                dynamoDB.dynamoInsertItem(params).then((value)=>{
                    // send push message into others for ordr list update
                    // 모든 db update에 대해 push 메시지가 전달되어야 한다.
                    let params = {
                        TableName: "menu"
                    };
                    dynamoDB.dynamoScanItem(params).then((result)=>{
                        resolve(result.Items);
                    },err=>{
                        reject(err);
                    });
                },err=>{
                    if(err.code=="ConditionalCheckFailedException"){
                        reject("AlreadyExist");
                    }else
                        reject(err);
                });
    });
}

router.deleteMenu=function(param){
    return new Promise((resolve,reject)=>{        
        var params = {
            TableName:"menu",
            Key:{
                "name":param.name
            },
            ConditionExpression : "attribute_exists(#name)",
            ExpressionAttributeNames: {
                "#name":"name"
            }
        };
        console.log("deleteMenu-params:"+JSON.stringify(params));                
        dynamoDB.dynamoDeleteItem(params).then((result)=>{
                let params = {
                    TableName: "menu"
                };
                dynamoDB.dynamoScanItem(params).then((result)=>{
                    resolve(result.Items);
                },err=>{
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

router.getMenus=function (param){
    return new Promise((resolve,reject)=>{
                    let params = {
                        TableName: "menu"
                    };
                    dynamoDB.dynamoScanItem(params).then((result)=>{
                        // let sort menus group by category and sort by category & name                        
                        /*
// 역순(내림차순;다나가, CBA)으로 소팅하여 출력
document.write(names.sort(compStringReverse) + '<br />');
// 주의: compStringReverse 함수 뒤에 ()를 붙이면 안됩니다.



// 문자열 내림차순 정렬에, 내부적으로 필요한 함수
// 가나다순 소팅에는 필요없음
function compStringReverse(a, b) {
  if (a > b) return -1;
  if (b > a) return 1;
  return 0;
}
                        */
                        resolve(result.Items);
                    },err=>{
                        reject(err);
                    });
                },err=>{
                        reject(err);
                });
}

module.exports = router;
