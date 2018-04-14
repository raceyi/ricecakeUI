import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ConfigProvider} from "../config/config";
import { NavController,AlertController,Platform ,Events} from 'ionic-angular';

/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {
  orderList:any=[];
  trashList:any=[];

   carriers=[
        {
            "name": "박서준"
        },
        {
            "name": "정유미"
        },
        {
            "name": "이서진"
        }
    ];

/*
  menus:any=[{"category":"기타","menu":"견과류강정","categorySeq":0,"menuSeq":0},{"category":"기타","menu":"멥밥","categorySeq":0,"menuSeq":1},{"category":"기타","menu":"미숫가루(고품격)","categorySeq":0,"menuSeq":2},{"category":"기타","menu":"미숫가루(오곡)","categorySeq":0,"menuSeq":3},{"category":"기타","menu":"미숫가루(흑임자)","categorySeq":0,"menuSeq":4},{"category":"기타","menu":"수수팥(2색)","categorySeq":0,"menuSeq":5},{"category":"기타","menu":"수수팥(카스테라)","categorySeq":0,"menuSeq":6},{"category":"기타","menu":"수수팥(팥)","categorySeq":0,"menuSeq":7},{"category":"기타","menu":"약과","categorySeq":0,"menuSeq":8},{"category":"기타","menu":"오곡밥","categorySeq":0,"menuSeq":9},{"category":"기타","menu":"오곡밥(팥만)","categorySeq":0,"menuSeq":10},{"category":"멥떡","menu":"가래떡","categorySeq":1,"menuSeq":0},{"category":"멥떡","menu":"꿀떡","categorySeq":1,"menuSeq":1},{"category":"멥떡","menu":"녹두호박설기","categorySeq":1,"menuSeq":2},{"category":"멥떡","menu":"단호박소담","categorySeq":1,"menuSeq":3},{"category":"멥떡","menu":"대추편","categorySeq":1,"menuSeq":4},{"category":"멥떡","menu":"딸기설기","categorySeq":1,"menuSeq":5},{"category":"멥떡","menu":"멥편 (팥)","categorySeq":1,"menuSeq":6},{"category":"멥떡","menu":"멥편(기피)","categorySeq":1,"menuSeq":7},{"category":"멥떡","menu":"멥편(녹두)","categorySeq":1,"menuSeq":8},{"category":"멥떡","menu":"멥편(콩)","categorySeq":1,"menuSeq":9},{"category":"멥떡","menu":"무지개설기","categorySeq":1,"menuSeq":10},{"category":"멥떡","menu":"미니설기(100)","categorySeq":1,"menuSeq":11},{"category":"멥떡","menu":"미니설기(무지)","categorySeq":1,"menuSeq":12},{"category":"멥떡","menu":"미니설기(첫돌)","categorySeq":1,"menuSeq":13},{"category":"멥떡","menu":"미니설기(하트)","categorySeq":1,"menuSeq":14},{"category":"멥떡","menu":"바람떡","categorySeq":1,"menuSeq":15},{"category":"멥떡","menu":"밤콩설기","categorySeq":1,"menuSeq":16},{"category":"멥떡","menu":"백설기","categorySeq":1,"menuSeq":17},{"category":"멥떡","menu":"송편","categorySeq":1,"menuSeq":18},{"category":"멥떡","menu":"쑥밤콩설기","categorySeq":1,"menuSeq":19},{"category":"멥떡","menu":"잣설기","categorySeq":1,"menuSeq":20},{"category":"멥떡","menu":"절편(2색)","categorySeq":1,"menuSeq":21},{"category":"멥떡","menu":"절편(쑥)","categorySeq":1,"menuSeq":22},{"category":"멥떡","menu":"절편(흰)","categorySeq":1,"menuSeq":23},{"category":"멥떡","menu":"초코설기","categorySeq":1,"menuSeq":24},{"category":"멥떡","menu":"현미설기","categorySeq":1,"menuSeq":25},{"category":"멥떡","menu":"흑임자설기","categorySeq":1,"menuSeq":26},{"category":"백리향1송이","menu":"[{\"호박(미니랩)\":3},{\"쑥밤콩(미니랩)\":3},{\"밤콩(미니랩)\":3},{\"고구마호박찰(미니랩)\":3},{\"완두(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3},{\"모듬(미니랩)\":3}]","categorySeq":2,"menuSeq":0},{"category":"백리향2송이","menu":"[{\"쑥밤콩(미니랩)\":3},{\"호박(미니랩)\":3},{\"모듬(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3},{\"완두(미니랩)\":3},{\"딸기(미니랩)\":9},{\"고구마호박찰(미니랩)\":12}]","categorySeq":3,"menuSeq":0},{"category":"백리향2송이(이티)","menu":"[{\"고구마호박찰(미니랩)\":12},{\"호박(미니랩)\":3},{\"쑥밤콩(미니랩)\":3},{\"완두(미니랩)\":3},{\"모듬(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3}]","categorySeq":4,"menuSeq":0},{"category":"십리향1송이","menu":"[{\"완두(기계)\":3},{\"호박(기계)\":3},{\"모듬(기계)\":3}]","categorySeq":5,"menuSeq":0},{"category":"십리향2송이","menu":"[{\"완두(기계)\":3},{\"모듬(기계)\":3},{\"밤콩(기계)\":3},{\"쑥밤콩(기계)\":3},{\"약식(기계)\":3},{\"호박(기계)\":3}]","categorySeq":6,"menuSeq":0},{"category":"십리향3송이(이티)","menu":"[{\"호박(기계)\":3},{\"모듬(기계)\":3},{\"약식(기계)\":3},{\"쑥밤콩(기계)\":3},{\"밤콩(기계)\":3},{\"완두(기계)\":3}]","categorySeq":7,"menuSeq":0},{"category":"십리향3송이(흑임자)","menu":"[{\"완두(기계)\":3},{\"호박(기계)\":3},{\"모듬(기계)\":3},{\"약식(기계)\":3},{\"밤콩(기계)\":3},{\"쑥밤콩(기계)\":3}]","categorySeq":8,"menuSeq":0},{"category":"찰떡","menu":"고구마호박찰","categorySeq":9,"menuSeq":0},{"category":"찰떡","menu":"기피인절미","categorySeq":9,"menuSeq":1},{"category":"찰떡","menu":"기피편","categorySeq":9,"menuSeq":2},{"category":"찰떡","menu":"깨편","categorySeq":9,"menuSeq":3},{"category":"찰떡","menu":"녹두편","categorySeq":9,"menuSeq":4},{"category":"찰떡","menu":"모듬영양","categorySeq":9,"menuSeq":5},{"category":"찰떡","menu":"시루떡","categorySeq":9,"menuSeq":6},{"category":"찰떡","menu":"쑥인절미","categorySeq":9,"menuSeq":7},{"category":"찰떡","menu":"약식","categorySeq":9,"menuSeq":8},{"category":"찰떡","menu":"완두시루","categorySeq":9,"menuSeq":9},{"category":"찰떡","menu":"이티","categorySeq":9,"menuSeq":10},{"category":"찰떡","menu":"콩깨편","categorySeq":9,"menuSeq":11},{"category":"찰떡","menu":"콩영양","categorySeq":9,"menuSeq":12},{"category":"찰떡","menu":"콩인절미","categorySeq":9,"menuSeq":13},{"category":"찰떡","menu":"콩편","categorySeq":9,"menuSeq":14},{"category":"찰떡","menu":"함시루","categorySeq":9,"menuSeq":15},{"category":"찰떡","menu":"현미모듬","categorySeq":9,"menuSeq":16},{"category":"찰떡","menu":"현미쑥인절미","categorySeq":9,"menuSeq":17},{"category":"찰떡","menu":"현미인절미","categorySeq":9,"menuSeq":18},{"category":"찰떡","menu":"흑임자인절미","categorySeq":9,"menuSeq":19},
  {"category":"찰떡","menu":"흰인절미","categorySeq":9,"menuSeq":20},
        {
            "category": "십리향2송이",
            "menu": "[{\"모듬찰떡(기계)\":1},{\"단호박소담(기계)\":1},{\"완두시루떡(기계)\":1}]",
            "choiceNumber":2,
            "categorySeq":10,
            "menuSeq":0
        }
  ];
*/

//  menus:any=[{"category":"십리향2송이","menuSeq":0,"menu":"[{\"완두(기계)\":3},{\"모듬(기계)\":3},{\"밤콩(기계)\":3},{\"쑥밤콩(기계)\":3},{\"약식(기계)\":3},{\"호박(기계)\":3}]","categorySeq":6},{"category":"십리향2송이","menu":"empty","categorySeq":0,"type":"complex"},{"category":"백리향2송이","menuSeq":0,"menu":"[{\"쑥밤콩(미니랩)\":3},{\"호박(미니랩)\":3},{\"모듬(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3},{\"완두(미니랩)\":3},{\"딸기(미니랩)\":9},{\"고구마호박찰(미니랩)\":12}]","categorySeq":3},{"category":"백리향2송이","menu":"empty","categorySeq":1,"type":"complex"},{"category":"십리향3송이(흑임자)","menuSeq":0,"menu":"[{\"완두(기계)\":3},{\"호박(기계)\":3},{\"모듬(기계)\":3},{\"약식(기계)\":3},{\"밤콩(기계)\":3},{\"쑥밤콩(기계)\":3}]","categorySeq":8},{"category":"십리향3송이(흑임자)","menu":"empty","categorySeq":2,"type":"complex"},{"category":"백리향1송이","menuSeq":0,"menu":"[{\"호박(미니랩)\":3},{\"쑥밤콩(미니랩)\":3},{\"밤콩(미니랩)\":3},{\"고구마호박찰(미니랩)\":3},{\"완두(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3},{\"모듬(미니랩)\":3}]","categorySeq":2},{"category":"백리향1송이","menu":"empty","categorySeq":3,"type":"complex"},{"category":"백리향2송이(이티)","menuSeq":0,"menu":"[{\"고구마호박찰(미니랩)\":12},{\"호박(미니랩)\":3},{\"쑥밤콩(미니랩)\":3},{\"완두(미니랩)\":3},{\"모듬(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3}]","categorySeq":4},{"category":"백리향2송이(이티)","menu":"empty","categorySeq":4,"type":"complex"},{"category":"멥떡","menu":"empty","categorySeq":5,"type":"general"},{"category":"멥떡","menuSeq":0,"menu":"가래떡","categorySeq":1},{"category":"멥떡","menuSeq":1,"menu":"꿀떡","categorySeq":1},{"category":"멥떡","menuSeq":2,"menu":"녹두호박설기","categorySeq":1},{"category":"멥떡","menuSeq":3,"menu":"단호박소담","categorySeq":1},{"category":"멥떡","menuSeq":4,"menu":"대추편","categorySeq":1},{"category":"멥떡","menuSeq":5,"menu":"딸기설기","categorySeq":1},{"category":"멥떡","menuSeq":6,"menu":"멥편 (팥)","categorySeq":1},{"category":"멥떡","menuSeq":7,"menu":"멥편(기피)","categorySeq":1},{"category":"멥떡","menuSeq":8,"menu":"멥편(녹두)","categorySeq":1},{"category":"멥떡","menuSeq":9,"menu":"멥편(콩)","categorySeq":1},{"category":"멥떡","menuSeq":10,"menu":"무지개설기","categorySeq":1},{"category":"멥떡","menuSeq":11,"menu":"미니설기(100)","categorySeq":1},{"category":"멥떡","menuSeq":12,"menu":"미니설기(무지)","categorySeq":1},{"category":"멥떡","menuSeq":13,"menu":"미니설기(첫돌)","categorySeq":1},{"category":"멥떡","menuSeq":14,"menu":"미니설기(하트)","categorySeq":1},{"category":"멥떡","menuSeq":15,"menu":"바람떡","categorySeq":1},{"category":"멥떡","menuSeq":16,"menu":"밤콩설기","categorySeq":1},{"category":"멥떡","menuSeq":17,"menu":"백설기","categorySeq":1},{"category":"멥떡","menuSeq":18,"menu":"송편","categorySeq":1},{"category":"멥떡","menuSeq":19,"menu":"쑥밤콩설기","categorySeq":1},{"category":"멥떡","menuSeq":20,"menu":"잣설기","categorySeq":1},{"category":"멥떡","menuSeq":21,"menu":"절편(2색)","categorySeq":1},{"category":"멥떡","menuSeq":22,"menu":"절편(쑥)","categorySeq":1},{"category":"멥떡","menuSeq":23,"menu":"절편(흰)","categorySeq":1},{"category":"멥떡","menuSeq":24,"menu":"초코설기","categorySeq":1},{"category":"멥떡","menuSeq":25,"menu":"현미설기","categorySeq":1},{"category":"멥떡","menuSeq":26,"menu":"흑임자설기","categorySeq":1},{"category":"십리향1송이","menuSeq":0,"menu":"[{\"완두(기계)\":3},{\"호박(기계)\":3},{\"모듬(기계)\":3}]","categorySeq":5},{"category":"십리향1송이","menu":"empty","categorySeq":6,"type":"complex"},{"category":"찰떡","menu":"empty","categorySeq":7,"type":"general"},{"category":"찰떡","menuSeq":0,"menu":"고구마호박찰","categorySeq":9},{"category":"찰떡","menuSeq":1,"menu":"기피인절미","categorySeq":9},{"category":"찰떡","menuSeq":2,"menu":"기피편","categorySeq":9},{"category":"찰떡","menuSeq":3,"menu":"깨편","categorySeq":9},{"category":"찰떡","menuSeq":4,"menu":"녹두편","categorySeq":9},{"category":"찰떡","menuSeq":5,"menu":"모듬영양","categorySeq":9},{"category":"찰떡","menuSeq":6,"menu":"시루떡","categorySeq":9},{"category":"찰떡","menuSeq":7,"menu":"쑥인절미","categorySeq":9},{"category":"찰떡","menuSeq":8,"menu":"약식","categorySeq":9},{"category":"찰떡","menuSeq":9,"menu":"완두시루","categorySeq":9},{"category":"찰떡","menuSeq":10,"menu":"이티","categorySeq":9},{"category":"찰떡","menuSeq":11,"menu":"콩깨편","categorySeq":9},{"category":"찰떡","menuSeq":12,"menu":"콩영양","categorySeq":9},{"category":"찰떡","menuSeq":13,"menu":"콩인절미","categorySeq":9},{"category":"찰떡","menuSeq":14,"menu":"콩편","categorySeq":9},{"category":"찰떡","menuSeq":15,"menu":"함시루","categorySeq":9},{"category":"찰떡","menuSeq":16,"menu":"현미모듬","categorySeq":9},{"category":"찰떡","menuSeq":17,"menu":"현미쑥인절미","categorySeq":9},{"category":"찰떡","menuSeq":18,"menu":"현미인절미","categorySeq":9},{"category":"찰떡","menuSeq":19,"menu":"흑임자인절미","categorySeq":9},{"category":"찰떡","menuSeq":20,"menu":"흰인절미","categorySeq":9},{"category":"기타","menu":"empty","categorySeq":8,"type":"general"},{"category":"기타","menuSeq":0,"menu":"견과류강정","categorySeq":0},{"category":"기타","menuSeq":1,"menu":"멥밥","categorySeq":0},{"category":"기타","menuSeq":2,"menu":"미숫가루(고품격)","categorySeq":0},{"category":"기타","menuSeq":3,"menu":"미숫가루(오곡)","categorySeq":0},{"category":"기타","menuSeq":4,"menu":"미숫가루(흑임자)","categorySeq":0},{"category":"기타","menuSeq":5,"menu":"수수팥(2색)","categorySeq":0},{"category":"기타","menuSeq":6,"menu":"수수팥(카스테라)","categorySeq":0},{"category":"기타","menuSeq":7,"menu":"수수팥(팥)","categorySeq":0},{"category":"기타","menuSeq":8,"menu":"약과","categorySeq":0},{"category":"기타","menuSeq":9,"menu":"오곡밥","categorySeq":0},{"category":"기타","menuSeq":10,"menu":"오곡밥(팥만)","categorySeq":0},{"category":"십리향3송이(이티)","menuSeq":0,"menu":"[{\"호박(기계)\":3},{\"모듬(기계)\":3},{\"약식(기계)\":3},{\"쑥밤콩(기계)\":3},{\"밤콩(기계)\":3},{\"완두(기계)\":3}]","categorySeq":7},{"category":"십리향3송이(이티)","menu":"empty","categorySeq":9,"type":"complex"}];
  menus:any=[{"category":"검증(세트-선택)","menuSeq":0,"menu":"[{\"두텁\":2},{\"호박(기계)\":1},{\"떡꾹\":1},{\"찰떡\":3}]","categorySeq":10,"choiceNumber":"3"},{"category":"검증(세트-선택)","menu":"empty","categorySeq":10,"type":"complex-choice"},{"category":"십리향2송이","menuSeq":0,"menu":"[{\"완두(기계)\":3},{\"모듬(기계)\":3},{\"밤콩(기계)\":3},{\"쑥밤콩(기계)\":3},{\"약식(기계)\":3},{\"호박(기계)\":3}]","categorySeq":6},{"category":"십리향2송이","menuSeq":-1,"menu":"empty","categorySeq":6,"type":"complex"},{"category":"백리향2송이","menuSeq":0,"menu":"[{\"쑥밤콩(미니랩)\":3},{\"호박(미니랩)\":3},{\"모듬(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3},{\"완두(미니랩)\":3},{\"딸기(미니랩)\":9},{\"고구마호박찰(미니랩)\":12}]","categorySeq":3},{"category":"백리향2송이","menuSeq":-1,"menu":"empty","categorySeq":3,"type":"complex"},{"category":"십리향3송이(흑임자)","menuSeq":0,"menu":"[{\"완두(기계)\":3},{\"호박(기계)\":3},{\"모듬(기계)\":3},{\"약식(기계)\":3},{\"밤콩(기계)\":3},{\"쑥밤콩(기계)\":3}]","categorySeq":8},{"category":"십리향3송이(흑임자)","menuSeq":-1,"menu":"empty","categorySeq":8,"type":"complex"},{"category":"백리향1송이","menuSeq":0,"menu":"[{\"호박(미니랩)\":3},{\"쑥밤콩(미니랩)\":3},{\"밤콩(미니랩)\":3},{\"고구마호박찰(미니랩)\":3},{\"완두(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3},{\"모듬(미니랩)\":3}]","categorySeq":2},{"category":"백리향1송이","menuSeq":-1,"menu":"empty","categorySeq":2,"type":"complex"},{"category":"백리향2송이(이티)","menuSeq":0,"menu":"[{\"고구마호박찰(미니랩)\":12},{\"호박(미니랩)\":3},{\"쑥밤콩(미니랩)\":3},{\"완두(미니랩)\":3},{\"모듬(미니랩)\":3},{\"약식(미니랩)\":3},{\"콩영양(미니랩)\":3}]","categorySeq":4},{"category":"백리향2송이(이티)","menuSeq":-1,"menu":"empty","categorySeq":4,"type":"complex"},{"category":"멥떡","menuSeq":-1,"menu":"empty","categorySeq":5,"type":"general"},{"category":"멥떡","menuSeq":0,"menu":"가래떡","categorySeq":5},{"category":"멥떡","menuSeq":1,"menu":"꿀떡","categorySeq":5},{"category":"멥떡","menuSeq":2,"menu":"녹두호박설기","categorySeq":5},{"category":"멥떡","menuSeq":3,"menu":"단호박소담","categorySeq":5},{"category":"멥떡","menuSeq":4,"menu":"대추편","categorySeq":5},{"category":"멥떡","menuSeq":5,"menu":"딸기설기","categorySeq":5},{"category":"멥떡","menuSeq":6,"menu":"멥편 (팥)","categorySeq":5},{"category":"멥떡","menuSeq":7,"menu":"멥편(기피)","categorySeq":5},{"category":"멥떡","menuSeq":8,"menu":"멥편(녹두)","categorySeq":5},{"category":"멥떡","menuSeq":9,"menu":"멥편(콩)","categorySeq":5},{"category":"멥떡","menuSeq":10,"menu":"무지개설기","categorySeq":5},{"category":"멥떡","menuSeq":11,"menu":"미니설기(100)","categorySeq":5},{"category":"멥떡","menuSeq":12,"menu":"미니설기(무지)","categorySeq":5},{"category":"멥떡","menuSeq":13,"menu":"미니설기(첫돌)","categorySeq":5},{"category":"멥떡","menuSeq":14,"menu":"미니설기(하트)","categorySeq":5},{"category":"멥떡","menuSeq":15,"menu":"바람떡","categorySeq":5},{"category":"멥떡","menuSeq":16,"menu":"밤콩설기","categorySeq":5},{"category":"멥떡","menuSeq":17,"menu":"백설기","categorySeq":5},{"category":"멥떡","menuSeq":18,"menu":"송편","categorySeq":5},{"category":"멥떡","menuSeq":19,"menu":"쑥밤콩설기","categorySeq":5},{"category":"멥떡","menuSeq":20,"menu":"잣설기","categorySeq":5},{"category":"멥떡","menuSeq":21,"menu":"절편(2색)","categorySeq":5},{"category":"멥떡","menuSeq":22,"menu":"절편(쑥)","categorySeq":5},{"category":"멥떡","menuSeq":23,"menu":"절편(흰)","categorySeq":5},{"category":"멥떡","menuSeq":24,"menu":"초코설기","categorySeq":5},{"category":"멥떡","menuSeq":25,"menu":"현미설기","categorySeq":5},{"category":"멥떡","menuSeq":26,"menu":"흑임자설기","categorySeq":5},{"category":"십리향1송이","menuSeq":0,"menu":"[{\"완두(기계)\":3},{\"호박(기계)\":3},{\"모듬(기계)\":3}]","categorySeq":5},{"category":"십리향1송이","menuSeq":-1,"menu":"empty","categorySeq":5,"type":"complex"},{"category":"찰떡","menuSeq":-1,"menu":"empty","categorySeq":7,"type":"general"},{"category":"찰떡","menuSeq":0,"menu":"고구마호박찰","categorySeq":7},{"category":"찰떡","menuSeq":1,"menu":"기피인절미","categorySeq":7},{"category":"찰떡","menuSeq":2,"menu":"기피편","categorySeq":7},{"category":"찰떡","menuSeq":3,"menu":"깨편","categorySeq":7},{"category":"찰떡","menuSeq":4,"menu":"녹두편","categorySeq":7},{"category":"찰떡","menuSeq":5,"menu":"모듬영양","categorySeq":7},{"category":"찰떡","menuSeq":6,"menu":"시루떡","categorySeq":7},{"category":"찰떡","menuSeq":7,"menu":"쑥인절미","categorySeq":7},{"category":"찰떡","menuSeq":8,"menu":"약식","categorySeq":7},{"category":"찰떡","menuSeq":9,"menu":"완두시루","categorySeq":7},{"category":"찰떡","menuSeq":10,"menu":"이티","categorySeq":7},{"category":"찰떡","menuSeq":11,"menu":"콩깨편","categorySeq":7},{"category":"찰떡","menuSeq":12,"menu":"콩영양","categorySeq":7},{"category":"찰떡","menuSeq":13,"menu":"콩인절미","categorySeq":7},{"category":"찰떡","menuSeq":14,"menu":"콩편","categorySeq":7},{"category":"찰떡","menuSeq":15,"menu":"함시루","categorySeq":7},{"category":"찰떡","menuSeq":16,"menu":"현미모듬","categorySeq":7},{"category":"찰떡","menuSeq":17,"menu":"현미쑥인절미","categorySeq":7},{"category":"찰떡","menuSeq":18,"menu":"현미인절미","categorySeq":7},{"category":"찰떡","menuSeq":19,"menu":"흑임자인절미","categorySeq":7},{"category":"찰떡","menuSeq":20,"menu":"흰인절미","categorySeq":7},{"category":"기타","menuSeq":-1,"menu":"empty","categorySeq":8,"type":"general"},{"category":"기타","menuSeq":1,"menu":"견과류강정","categorySeq":8},{"category":"기타","menuSeq":2,"menu":"멥밥","categorySeq":8},{"category":"기타","menuSeq":3,"menu":"미숫가루(고품격)","categorySeq":8},{"category":"기타","menuSeq":4,"menu":"미숫가루(오곡)","categorySeq":8},{"category":"기타","menuSeq":5,"menu":"미숫가루(흑임자)","categorySeq":8},{"category":"기타","menuSeq":6,"menu":"수수팥(2색)","categorySeq":8},{"category":"기타","menuSeq":7,"menu":"수수팥(카스테라)","categorySeq":8},{"category":"기타","menuSeq":8,"menu":"수수팥(팥)","categorySeq":8},{"category":"기타","menuSeq":9,"menu":"약과","categorySeq":8},{"category":"기타","menuSeq":0,"menu":"오곡밥","categorySeq":8},{"category":"기타","menuSeq":10,"menu":"오곡밥(팥만)","categorySeq":8},{"category":"십리향3송이(이티)","menuSeq":0,"menu":"[{\"호박(기계)\":3},{\"모듬(기계)\":3},{\"약식(기계)\":3},{\"쑥밤콩(기계)\":3},{\"밤콩(기계)\":3},{\"완두(기계)\":3}]","categorySeq":7},{"category":"십리향3송이(이티)","menuSeq":-1,"menu":"empty","categorySeq":7,"type":"complex"}];
  categorySelected;
  maxMenuId:number=0;

  constructor(public http: HttpClient,
              public events: Events, 
              public configProvider:ConfigProvider) {
    console.log('Hello StorageProvider Provider');
    this.orderList=   [
        {
            "buyerName": "이경주",
            "totalPrice": 34000,
            "deliveryFee": 4000,
            "deliveryTime": "2018-03-29T03:00:00.000Z",
            "recipientAddress": "xxxxx",
            "orderedTime": "2018-03-29T10:33:13.985Z",
            "recipientName": "이경주",
            "payment": "unpaid-pre",
            "memo": "맛있게....",
            "paymentMethod": "cash",
            "carrier": null,
            "recipientPhoneNumber": "010-2722-8226",
            "price": 30000,
            "id": 69,
            "menuList": [
                {
                    "menuString": "모듬찰떡1 단호박소담1 완두시루떡1 ",
                    "amount": "1",
                    "unit": "개",
                    "category": "십리향1송이",
                    "menu": "[{\"모듬찰떡\":1},{\"단호박소담\":1},{\"완두시루떡\":1}]"
                }
            ],
            "deliveryMethod": "배달",
            "buyerPhoneNumber": "010-2722-8226",
            "hide": false
        },
        {
            "buyerName": "이경주",
            "totalPrice": 34000,
            "deliveryFee": 4000,
            "deliveryTime": "2018-03-29T03:00:00.000Z",
            "recipientAddress": "xxxxx",
            "orderedTime": "2018-03-29T10:32:34.440Z",
            "recipientName": "이경주",
            "payment": "unpaid-pre",
            "memo": "맛있게....",
            "paymentMethod": "cash",
            "carrier": null,
            "recipientPhoneNumber": "010-2722-8226",
            "price": 30000,
            "id": 66,
            "menuList": [
                {
                    "menuString": "단호박소담 ",
                    "amount": "8",
                    "unit": "개",
                    "category": "맵떡",
                    "menu": "단호박소담"
                }
            ],
            "deliveryMethod": "픽업",
            "buyerPhoneNumber": "010-2722-8226",
            "hide": false
        },
        {
            "buyerName": "이경주",
            "totalPrice": 34000,
            "deliveryFee": 4000,
            "deliveryTime": "2018-03-29T03:00:00.000Z",
            "recipientAddress": "xxxxx",
            "orderedTime": "2018-03-29T10:33:12.849Z",
            "recipientName": "이경주",
            "payment": "unpaid-pre",
            "memo": "맛있게....",
            "paymentMethod": "cash",
            "carrier": null,
            "recipientPhoneNumber": "010-2722-8226",
            "price": 30000,
            "id": 68,
            "menuList": [
                {
                    "menuString": "모듬찰떡1 단호박소담1 완두시루떡1 ",
                    "amount": "1",
                    "unit": "개",
                    "category": "십리향1송이",
                    "menu": "[{\"모듬찰떡\":1},{\"단호박소담\":1},{\"완두시루떡\":1}]"
                }
            ],
            "deliveryMethod": "배달",
            "buyerPhoneNumber": "010-2722-8226",
            "hide": false
        },
        {
            "buyerName": "이경주",
            "totalPrice": 34000,
            "deliveryFee": 4000,
            "deliveryTime": "2018-03-29T03:00:00.000Z",
            "recipientAddress": "xxxxx",
            "orderedTime": "2018-03-29T10:33:11.721Z",
            "recipientName": "이경주",
            "payment": "paid",
            "memo": "맛있게....",
            "paymentMethod": "cash",
            "carrier": null,
            "recipientPhoneNumber": "010-2722-8226",
            "price": 30000,
            "id": 67,
            "menuList": [
                {
                    "menuString": "모듬찰떡1 단호박소담1 완두시루떡1 ",
                    "amount": "1",
                    "unit": "개",
                    "category": "십리향1송이",
                    "menu": "[{\"모듬찰떡\":1},{\"단호박소담\":1},{\"완두시루떡\":1}]"
                }
            ],
            "deliveryMethod": "배달",
            "buyerPhoneNumber": "010-2722-8226",
            "hide": true
        }
    ];

    this.trashList=this.orderList; //just test
    
    this.convertMenuInfo(this.menus);
    this.convertOrderList(this.orderList);
    this.orderList.sort(function(a,b){
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            return 0;
    } );
    console.log("orderList.length:"+this.orderList.length);
  }
 
  convertMenuInfo(menus){
      let categories=[]; 
      menus.forEach(menu=>{
          if(categories.findIndex(function(value){
                return menu.category==value.category;
             })==-1){
               if(menu.type)
                  categories.push({category:menu.category, categorySeq:menu.categorySeq,type:menu.type});
               else 
                  categories.push({category:menu.category, categorySeq:menu.categorySeq});
          }
      })
      console.log("categories:"+JSON.stringify(categories));

      categories.sort(function(a,b){
          if(a.categorySeq<b.categorySeq)
              return -1;
          if(a.categorySeq>b.categorySeq)
              return 1;
          return 0;                
      });
      console.log("menus.sort:"+JSON.stringify(menus));


      let menuInfos=[];
      categories.forEach(category=>{
          let type;
          if(category.type)
            type=category.type;
          else
            type="general";
          menuInfos.push({type:type,category:category.category, id: "category_"+category.category, categorySeq:category.categorySeq,ids:[],menus:[],optionStrings:[]});
      })
       
        menus.forEach(menu=>{
          if(menu.menu!="empty"){
             let menuString=menu.menu;
             let type="general";
             let categoryIndex=categories.findIndex(function(value){
                  if(menu.category==value.category)
                    return true;
                  return false;  
             })
             if(menu.hasOwnProperty("choiceNumber") && menu.choiceNumber>0){
                    type="complex-choice";
                    let menuObjs=JSON.parse(menu.menu);
                    console.log("menuObj:"+JSON.stringify(menuObjs));
                    let index=0;
                    menuObjs.forEach(menuObj=>{
                        //let menuString="";
                        let key:any=Object.keys(menuObj);
                        menuString+=key+menuObj[key]+" ";
                        //menuInfos[categoryIndex].optionStrings.push(menuString); 
                        ++index;
                    });
                    menuString= menu.choiceNumber+"개 선택";
                    let menuClone = Object.assign({}, menu);
                    menuClone.menuString=menuString;
                    menuInfos[categoryIndex].menus.push(menuClone);
                    menuInfos[categoryIndex].choiceNumber=menu.choiceNumber;
                    menuInfos[categoryIndex].type=type;
             }else if(menu.menu.indexOf("[")==0){ 
                        type="complex";  
                        let menuObjs=JSON.parse(menu.menu);
                        console.log("menuObj:"+JSON.stringify(menuObjs));
                        menuString="";
                        menuObjs.forEach(menuObj=>{
                        let key:any=Object.keys(menuObj);
                        menuString+=key+menuObj[key]+" ";
                    });
                    let menuClone = Object.assign({}, menu);
                    menuClone.menuString=menuString;                    
                    menuInfos[categoryIndex].type=type;
                    menuInfos[categoryIndex].menus.push(menuClone);
                    menuInfos[categoryIndex].optionStrings.push(menuString); 
             }else{
                    let menuClone = Object.assign({}, menu);
                    menuClone.menuString=menuString;                 
                    menuInfos[categoryIndex].ids.push("menu_"+this.maxMenuId++);
                    menuInfos[categoryIndex].menus.push(menuClone);
                    menuInfos[categoryIndex].optionStrings.push(menuString); 
                    //console.log("!!!menuids: "+JSON.stringify(menuInfos[categoryIndex]));
             }
          }
        })     
        
        menuInfos.forEach(category=>{
          category.menus.sort(function(a,b){
              if(a.menuSeq<b.menuSeq)
                  return -1;
              if(a.menuSeq>b.menuSeq)
                  return 1;
              return 0;   
            });
           // menuString도 변경되어야 한다. 순서에 영향받는 General에 대해서만 변경해주면 된다. 
           category.optionStrings=[];
           category.menus.forEach(menu=>{
              category.optionStrings.push(menu.menu);
           });
        });

       // 카테고리 정렬. 왜 두번해야 할까?
        menuInfos.sort(function(a,b){
           if(a.categorySeq<b.categorySeq)
              return -1;
          if(a.categorySeq>b.categorySeq)
              return 1;
          return 0;                
        });

      if(!this.categorySelected && categories.length>0)
          this.categorySelected=categories[0].category;

        this.menus = menuInfos;
        console.log("menus: " + JSON.stringify(this.menus));
        this.events.publish('update','menu');
  }

  convertOrderList(orderList){
    orderList.forEach(order=>{
           order.orderedTimeString= order.orderedTime.substr(0,4)+"년"+order.orderedTime.substr(5,2)+"월"+
                                    order.orderedTime.substr(8,2)+"일"+order.orderedTime.substr(11,2)+"시"+ 
                                    order.orderedTime.substr(14,2)+"분";
           console.log(order.orderedTime+"orderedTimeString:"+order.orderedTimeString);
           if(order.paymentMethod=="cash"){
               if(order.payment.startsWith("paid")){
                    order.paymentString="현금-완납";
               }else if(order.payment.startsWith("unpaid")){ //must be unpaid
                    let strs=order.payment.split("-");
                    if(strs[1]=="pre")
                        order.paymentString="현금-선불";
                    else if(strs[1]=="after")    
                        order.paymentString="현금-후불";
               }
           }else if(order.paymentMethod=="card"){ //must be card
               if(order.payment.startsWith("paid")){
                    order.paymentString="카드-완납";
               }else if(order.payment.startsWith("unpaid")){ //must be unpaid
                    let strs=order.payment.split("-");
                    if(strs[1]=="pre")
                        order.paymentString="카드-선불(미납)";
                    else if(strs[1]=="after")   
                        order.paymentString="카드-후불(미납)";
               }
           }
    });
  }
}
