import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController,Platform} from 'ionic-angular';
import {StorageProvider} from "../../providers/storage/storage";
import {ServerProvider} from "../../providers/server/server";
import { Events } from 'ionic-angular';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import {ManagerPasswordPage} from "../manager-password/manager-password";

var gPage;

/**
 * Generated class for the ManagerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-manager',
  templateUrl: 'manager.html',
})
export class ManagerPage {
  section="sales";
  searchKeyWord;

  startDateIn;  //input format
  endDateIn;    // input format

  cashPaid:number=0;
  cashUnpaid:number=0;
  cardPaid:number=0;
  cardUnpaid:number=0;

  totalSales:number=0;

 ///////////////////////////////////////////////////////////////////////////////
 // 메뉴에 sequence 적용 코드-begin
  newComplexMenuItems=[];
  newName;
  newAmount;

  newChoiceNumber:number;

  newCategory:string;
  newCategoryType:string="general";
  saveButtonHidden:boolean=true;

  scrollCategoryEnable:boolean=true; //category 영역의 scroll여부, drag가 시작되면 drop까지 scroll이 불가능해야함.
  scrollMenuEnable:boolean=true;

  currentCategoryMenus;
  
  editSequence:boolean=false;

  // 메뉴에 sequence 적용 코드-end
  ///////////////////////////////////////////////////////////////////////////////

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public alertCtrl:AlertController,
              private platform: Platform,
              public events: Events,
              public serverProvider:ServerProvider,
              public storageProvider:StorageProvider,
              public ngZone:NgZone,
              private drag: DragulaService) {

      console.log("manager-constructor");

      // today
      let today=new Date();
      this.startDateIn={year:today.getFullYear(),month:today.getMonth(),date:today.getDate()};
      this.endDateIn={year:today.getFullYear(),month:today.getMonth(),date:today.getDate()};

      gPage=this;
      this.storageProvider.maxMenuId=0;
      if(this.storageProvider.menus.length>0){
          this.currentCategoryMenus=this.storageProvider.menus[0];
      }

      events.subscribe('updated', (tablename) => {   // menu table이 업데이트 되었을 경우 일부 변수값을 초기화한다.
            console.log("UI receive update event for "+tablename);
            if(tablename=="menu"){
                this.ngZone.run(()=>{
                    if(tablename=="menu"){
                        if(this.storageProvider.menus.length==0) return; // do nothing
                        console.log("currentCategoryMenus:"+JSON.stringify(this.currentCategoryMenus));                    
                        if(!this.currentCategoryMenus){  // initialize currentCategoryMenus
                            this.currentCategoryMenus=this.storageProvider.menus[0];
                        }else{
                            //update currentCategoryMenus
                            if(this.currentCategoryMenus.category){
                                let categoryIndex=this.storageProvider.menus.findIndex(function(val){return val.category==gPage.currentCategoryMenus.category}); 
                                if(categoryIndex==-1)
                                    categoryIndex=0;    
                                this.currentCategoryMenus=this.storageProvider.menus[categoryIndex];
                                console.log("optionStrings:"+JSON.stringify(this.currentCategoryMenus.optionStrings));
                            }else{
                                console.log("fix currentCategoryMenus when menu is empty");
                                gPage.currentCategoryMenus=this.storageProvider.menus[0];
                            }
                        }
                        if(this.currentCategoryMenus.type.startsWith("complex")){
                                    //선택옵션의 경우 newComplexMenuItems사용을 위해 초기회가 필요하다.
                                this.newComplexMenuItems=[];
                                if(this.currentCategoryMenus.type.startsWith("complex") && this.currentCategoryMenus.menus.length>0){
                                        let menuObj=JSON.parse(this.currentCategoryMenus.menus[0].menu);
                                        menuObj.forEach(menu=>{
                                            let key:any=Object.keys(menu);
                                            let object={};
                                            object[key]=menu[key];
                                            object["string"]=key+" "+menu[key];
                                            this.newComplexMenuItems.push(object);
                                        });
                                        this.newAmount=undefined;
                                        this.newName="";
                                        console.log("newComplexMenuItems:"+JSON.stringify(this.newComplexMenuItems));
                                        if(this.currentCategoryMenus.type=="complex-choice")
                                            this.newChoiceNumber=this.currentCategoryMenus.menus[0].choiceNumber;
                                }
                        }
                        console.log("currentCategoryMenus:"+JSON.stringify(this.currentCategoryMenus));
                    }
                })
            }
      });

      this.drag.drag.subscribe((val) =>
      {
         // Log the retrieved HTML element ID value
         console.log('Is dragging: ' + val[1].id);
         if(val[1].id.startsWith("category_")){
             this.scrollCategoryEnable=false;
         }else if(val[1].id.startsWith("menu_")){
              this.scrollMenuEnable=false;
         }

        setTimeout(() => { //drag이후 아무 event도 오지 않는 경우가 있다. 3초후에 풀어준다
            this.scrollCategoryEnable=true;
            this.scrollMenuEnable=true; 
        }, 3*1000); //  3 seconds     

      });

      // Subscribe to the drop event for the list component once it has
      // been dropped into location by the user
      this.drag.drop.subscribe((val) =>
      {
         // Log the retrieved HTML ID value and the re-ordered list value
         console.log('Is dropped: ' + val[1].id);
         //this.onDrop(val[2]);
         if(val[1].id.startsWith("category_")){
             this.scrollCategoryEnable=true;
             this.restructCategories(val[2]);
         }else if(val[1].id.startsWith("menu_")){
             this.scrollMenuEnable=true;
             this.restructMenus(val[2]);
         }
      });

      this.drag.over.subscribe((val) => {
        console.log(`hum...over comes`);
        //     this.scrollCategoryEnable=true;
        //     this.scrollMenuEnable=true; 
      });

      this.drag.out.subscribe((val) => {
        console.log(`hum....out comes`);
         //    this.scrollCategoryEnable=true;
         //    this.scrollMenuEnable=true; 
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ManagerPage');  // 매니저 페이지 로드하면서 메뉴를 다시 가져온다.
    this.platform.ready().then(() => {
            this.serverProvider.getMenus().then((menus)=>{
                this.ngZone.run(()=>{
                    this.storageProvider.convertMenuInfo(menus);
                })
            });
    });
  }

  ionViewWillUnload(){
    console.log("managerPage- ionViewWillUnload");
    this.events.unsubscribe("update");
  }
  
  salesSection(){
    this.section="sales";
  }

  menuSection(){
    this.section="menu";
  }

  onStartDaySelect(day){
    console.log("day:"+JSON.stringify(day));
    this.startDateIn=day;
    console.log("start-day:"+JSON.stringify(day));
    this.updateSales();
  }
  
  peridoCheck(){
    console.log("startDateIn "+JSON.stringify(this.startDateIn));

//{"year":2018,"month":3,"date":1,"isThisMonth":true,"isToday":false,"isSelect":true,"hasEvent":false}

    var start = new Date(this.startDateIn.year, this.startDateIn.month, this.startDateIn.date, 0, 0, 0, 0);
    var end = new Date(this.endDateIn.year, this.endDateIn.month, this.endDateIn.date, 0, 0, 0, 0);
    
    console.log("start:"+start.getTime()+" end:"+end.getTime());

    if(start.getTime()<=end.getTime())
        return true;
     return false;   
  }
  
  formatDate(day){
    let month=(day.month+1)<=9?"0"+(day.month+1):(day.month+1);
    let date=(day.date)<=9?"0"+(day.date):day.date;
    return day.year+"-"+month+"-"+date;
  }

  updateSales(){
    if(!this.peridoCheck()){
            let alert = this.alertCtrl.create({
              title: '시작일은 종료일보다 빨라야만 합니다.',
              buttons: ['확인']
            });
            alert.present();
            return;      
    }
    let startDate=this.formatDate(this.startDateIn);
    let endDate=this.formatDate(this.endDateIn);
    this.serverProvider.getSales(startDate,endDate).then((value:any)=>{
        console.log("sales:"+JSON.stringify(value));
        this.cashPaid=value.cashPaid;
        this.cashUnpaid=value.cashUnpaid;
        this.cardPaid=value.cardPaid;
        this.cardUnpaid=value.cardUnpaid;
        this.totalSales=this.cashPaid+this.cardPaid+this.cashUnpaid+this.cardUnpaid;
        console.log("totalSales:"+this.totalSales);
        this.searchKeyWord="";
    },(err)=>{
            let alert = this.alertCtrl.create({
              title: '네트웍 상태를 확인해주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
            return;

    })
  }

  onEndDaySelect(day){
    this.endDateIn=day;    
    console.log("end-day:"+JSON.stringify(day));
    this.updateSales();    
  }

  sum(a,b){
    let total=0;
    if(a){
        total+=parseInt(a);
    }
    if(b){
        total+=parseInt(b);
    }
    return total.toLocaleString();
  }

 searchSales(){
   if(!this.searchKeyWord || this.searchKeyWord.trim().length==0){
            let alert = this.alertCtrl.create({
              title: '주문자를 입력해 주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
            return;      
   }
    if(!this.peridoCheck()){
            let alert = this.alertCtrl.create({
              title: '시작일은 종료일보다 빨라야만 합니다.',
              buttons: ['확인']
            });
            alert.present();
            return;      
    }
    let startDate=this.formatDate(this.startDateIn);
    let endDate=this.formatDate(this.endDateIn);
    this.serverProvider.getSalesWithBuyer(startDate,endDate,this.searchKeyWord.trim()).then((value:any)=>{
        console.log("sales:"+JSON.stringify(value));
        this.cashPaid=value.cashPaid;
        this.cashUnpaid=value.cashUnpaid;
        this.cardPaid=value.cardPaid;
        this.cardUnpaid=value.cardUnpaid;
        this.totalSales=this.cashPaid+this.cardPaid+this.cashUnpaid+this.cardUnpaid;
    },(err)=>{
            let alert = this.alertCtrl.create({
              title: '네트웍 상태를 확인해주시기 바랍니다.',
              buttons: ['확인']
            });
            alert.present();
            return;

    })
 }
 
     modifySequence(){
        this.editSequence=true;    
    }

    cancelSequence(){
        this.editSequence=false;
        // menu정보를 다시 불러온다.
        this.storageProvider.refresh("menu").then(()=>{
                this.saveButtonHidden=true;
        })
    }

    addComplexMenuItem(type){
      if(!this.newName || this.newName.trim().length==0){
                let alert = this.alertCtrl.create({
                  title: '이름을 입력해주시기 바랍니다.',
                  buttons: ['확인']
                });
                alert.present();
                return;
      }
      if(type=="complex"){
            if( !this.newAmount|| this.newAmount.trim().length==0){
                        let alert = this.alertCtrl.create({
                        title: '수량을 입력해 주시기 바랍니다.',
                        buttons: ['확인']
                        });
                        alert.present();        
                        return;
            }
            if(parseInt(this.newAmount)<=0){
                        let alert = this.alertCtrl.create({
                        title: '수량은 0보다 커야만 합니다.',
                        buttons: ['확인']
                        });
                        alert.present();        
                        return;
                
            }
      }else{
          this.newAmount=1;
      }
      let object={};
      object[this.newName.trim()]=parseInt(this.newAmount);
      object["string"]=this.newName.trim()+" "+this.newAmount;
      this.newComplexMenuItems.push(object);
      /*
      this.newComplexMenuItems.sort( function(a,b){
          if(a.string <b.string) return -1;
          if(a.string>b.string) return 1;
          return 0;
      })
      */
      console.log("newComplexMenuItems:"+JSON.stringify(this.newComplexMenuItems));
      this.newName="";
      this.newAmount="";
  }

  saveComplexChoiceMenu(){
    if(this.newComplexMenuItems.length==0){
                let alert = this.alertCtrl.create({
                  title: '추가할 이름을 입력해주시기 바랍니다.',
                  buttons: ['확인']
                });
                alert.present();
                return;
    }
    
    // "menu": "[{\"모듬찰떡\":1},{\"단호박소담\":1},{\"완두시루떡\":1}]"
    let menu=[];
    let menuString="";
    this.newComplexMenuItems.forEach(item=>{
        console.log("item:"+JSON.stringify(item));
        menuString+=" "+item.string;      
        let obj=Object.assign({}, item); //deep copy
        delete obj.string;
        console.log("obj:"+JSON.stringify(obj));
        menu.push(obj);
    })
    let reqbody:any={category:this.currentCategoryMenus.category,categorySeq:this.currentCategoryMenus.categorySeq , menu:JSON.stringify(menu),menuSeq:0,choiceNumber:this.newChoiceNumber};
    let sequences=[];
    if(!this.saveButtonHidden){ //save all sequence values. humm...
        this.storageProvider.menus.forEach(category=>{
            if(category.category!=this.storageProvider.categorySelected){
                for(let i=0;i<category.menus.length;i++){
                    sequences.push( {category:category.menus[i].category,categorySeq:category.menus[i].categorySeq, menu:category.menus[i].menu,menuSeq:i});
                }
            }  
        })
    }
    this.storageProvider.addComplexMenu(reqbody).then(()=>{
        let categoryIndex=this.storageProvider.menus.findIndex(function(val){return val.category==gPage.currentCategoryMenus.category}); 
        this.currentCategoryMenus=this.storageProvider.menus[categoryIndex];
        this.saveButtonHidden=true;
        console.log("currentCategoryMenus:"+JSON.stringify(this.currentCategoryMenus.menus));                                        
        console.log("menus:"+JSON.stringify(this.storageProvider.menus));
            let alert = this.alertCtrl.create({
                    title: '메뉴가 저장되었습니다.',
                    buttons: ['확인']
            });
            alert.present();           
    },err=>{
            let alert = this.alertCtrl.create({
                    title: '메뉴 추가에 실패했습니다.',
                    subTitle: JSON.stringify(err),
                    buttons: ['확인']
            });
            alert.present();                
    })

  }

  saveSequence(){
    return new Promise((resolve,reject)=>{         //save storageProvider.menus into server....
        let sequences=[];
        this.storageProvider.menus.forEach(category=>{
            sequences.push({category:category.category,categorySeq:category.categorySeq,menu:"empty",menuSeq:-1});
            for(let i=0;i<category.menus.length;i++)
                sequences.push({category:category.category,categorySeq:category.categorySeq,menu:category.menus[i].menu,menuSeq:i});
        })
        console.log("sequences:"+JSON.stringify(sequences));
        let reqbody={sequences:sequences};
        this.storageProvider.changeSequence(reqbody).then(()=>{
                this.saveButtonHidden=true;
                resolve();
        },err=>{
            let alert = this.alertCtrl.create({
                    title: '메뉴저장에 실패했습니다.',
                    subTitle: JSON.stringify(err),
                    buttons: ['확인']
            });
            alert.present();
            reject(err);               
        })
    });
  }

  saveComplexMenu(){
    if(this.newComplexMenuItems.length==0){
                let alert = this.alertCtrl.create({
                  title: '추가할 이름을 입력해주시기 바랍니다.',
                  buttons: ['확인']
                });
                alert.present();
                return;
    }

    // "menu": "[{\"모듬찰떡\":1},{\"단호박소담\":1},{\"완두시루떡\":1}]"
    let menu=[];
    let menuString="";
    this.newComplexMenuItems.forEach(item=>{
        console.log("item:"+JSON.stringify(item));
        menuString+=" "+item.string;      
        let obj=Object.assign({}, item); //deep copy
        delete obj.string;
        console.log("obj:"+JSON.stringify(obj));
        menu.push(obj);
    })
    let reqbody:any={category:this.currentCategoryMenus.category,categorySeq:this.currentCategoryMenus.categorySeq , menu:JSON.stringify(menu),menuSeq:0};
    let sequences=[];
    if(!this.saveButtonHidden){ //save all sequence values. humm...
        this.storageProvider.menus.forEach(category=>{
            if(category.category!=this.storageProvider.categorySelected){
                    sequences.push({category:category.category,categorySeq:category.categorySeq,menu:"empty",menuSeq:-1});
                for(let i=0;i<category.menus.length;i++){
                    sequences.push( {category:category.menus[i].category,categorySeq:category.menus[i].categorySeq, menu:category.menus[i].menu,menuSeq:i});
                }
            }  
        })
    }
    this.storageProvider.addComplexMenu(reqbody).then(()=>{
        let categoryIndex=this.storageProvider.menus.findIndex(function(val){return val.category==gPage.currentCategoryMenus.category}); 
        this.currentCategoryMenus=this.storageProvider.menus[categoryIndex];        
        this.saveButtonHidden=true;
        console.log("currentCategoryMenus:"+JSON.stringify(this.currentCategoryMenus.menus));                                        
        console.log("menus:"+JSON.stringify(this.storageProvider.menus));
            let alert = this.alertCtrl.create({
                    title: '메뉴가 저장되었습니다.',
                    buttons: ['확인']
            });
            alert.present();         
    },err=>{
            let alert = this.alertCtrl.create({
                    title: '메뉴 추가에 실패했습니다.',
                    subTitle: JSON.stringify(err),
                    buttons: ['확인']
            });
            alert.present();                
    })
  }


  removeGeneralMenu(i){    
      console.log("removeGeneralMenu-currentCategoryMenus:"+JSON.stringify(this.currentCategoryMenus));
    let alert = this.alertCtrl.create({
                          title: this.currentCategoryMenus.menus[i].menu+"를 삭제합니다",
                          buttons: [
                          {
                            text: '아니오',
                            handler: () => {
                              return;
                            }
                          },
                          {
                            text: '네',
                            handler: () => {
                                  let reqbody:any={category:this.currentCategoryMenus.category, menu:this.currentCategoryMenus.menus[i].menu};
                                  let sequences=[];
                                  if(!this.saveButtonHidden){ //save all sequence values. humm...
                                    this.storageProvider.menus.forEach(category=>{
                                        if(category.category!=this.storageProvider.categorySelected){
                                                sequences.push({category:category.category,categorySeq:category.categorySeq,menu:"empty",menuSeq:-1});
                                            for(let i=0;i<category.menus.length;i++){
                                                sequences.push( {category:category.menus[i].category,categorySeq:category.menus[i].categorySeq, menu:category.menus[i].menu,menuSeq:i});
                                            }
                                        }  
                                    })
                                  }
                                  let menus=this.currentCategoryMenus.menus.slice(0); //!!!copy array!!! 중요하다.
                                  menus.splice(i,1);
                                  for(let i=0;i<menus.length;i++)
                                      sequences.push({ category:menus[i].category,categorySeq:menus[i].categorySeq, menu:menus[i].menu,menuSeq:i});
                                  reqbody.sequences=sequences;
                                  this.storageProvider.removeGeneralMenu(reqbody).then(()=>{
                                        this.saveButtonHidden=true;
                                        //console.log("currentCategoryMenus:"+JSON.stringify(this.currentCategoryMenus.menus));                                        
                                  },err=>{
                                        let alert = this.alertCtrl.create({
                                                title: '메뉴 삭제에 실패했습니다.',
                                                subTitle: JSON.stringify(err),
                                                buttons: ['확인']
                                        });
                                        alert.present();                
                                  })
                            }
                          }]});
      alert.present();                       
 }      
  

  addGeneralMenu(){
        if(!this.newName || this.newName.trim().length==0){
                    let alert = this.alertCtrl.create({
                    title: '이름을 입력해주시기 바랍니다.',
                    buttons: ['확인']
                    });
                    alert.present();
                    return;
        }
        let reqbody:any={category:this.currentCategoryMenus.category, menu:this.newName,categorySeq:this.currentCategoryMenus.categorySeq ,menuSeq:this.currentCategoryMenus.menus.length};
        let sequences=[];
        if(!this.saveButtonHidden){ //save all sequence values. humm...
            this.storageProvider.menus.forEach(category=>{
                        sequences.push({category:category.category,categorySeq:category.categorySeq,menu:"empty",menuSeq:-1});
                    for(let i=0;i<category.menus.length;i++){
                        sequences.push( {category:category.menus[i].category,categorySeq:category.menus[i].categorySeq, menu:category.menus[i].menu,menuSeq:i});
                    }
            })
        }
        reqbody.sequences=sequences;

        this.storageProvider.addGeneralMenu(reqbody).then(()=>{
            // 메뉴 정보를 다시 가져오는것은 어떨까?
            this.saveButtonHidden=true;
            console.log("currentCategoryMenus:"+JSON.stringify(this.currentCategoryMenus.menus));                                        
            this.newName="";
            this.newAmount="";
            this.newComplexMenuItems=[];            
        },err=>{
            if(typeof err==="string" && err.indexOf("AlreadyExist")>=0){
                let alert = this.alertCtrl.create({
                    title: '이미 존재하는 메뉴입니다.',
                    buttons: ['확인']
                });
                alert.present();
            }else{
                let alert = this.alertCtrl.create({
                    title: '메뉴 추가에 실패했습니다.',
                    subTitle:JSON.stringify(err),
                    buttons: ['확인']
                });
                alert.present();                
                
            }
        })      
  }

  removeComplexMenuItems(i){
    this.newComplexMenuItems.splice(i,1);    
  }

  categorySelectedCheck(category){
      if(this.storageProvider.categorySelected==category)
          return true;
      return false;    
  }
  

  restructCategories(val:any){
     let newMenus=[];
      val.childNodes.forEach((item)=>{
          console.log("item.id"+item.id);
          if(item.id && item.id.startsWith("category_")){
              let category=this.storageProvider.menus.findIndex(function(category){return category.id==item.id});
              newMenus.push(this.storageProvider.menus[category]);
          }
      })

      //compute categorySeq again.
      let index=0;
      newMenus.forEach(category=>{
        category.categorySeq=index;
        index++;
      });
      //change categorySeq in all menus.
      newMenus.forEach(category=>{
        console.log("category:"+category.category+ "seq:"+ category.categorySeq);
        category.menus.forEach(menu=>{
            menu.categorySeq=category.categorySeq;
        })
      });
      this.storageProvider.menus=newMenus;
      this.saveButtonHidden=false;
      console.log("menus:"+JSON.stringify(this.storageProvider.menus));
  }

  restructMenus(val:any){
      console.log("restructMenus");
      let menus=[];
      let optionStrings=[];
      let ids=[];
      val.childNodes.forEach((item)=>{
          //console.log("item.id"+item.id+ "ids:"+JSON.stringify(this.currentCategoryMenus.ids));
          if(item.id && item.id.startsWith("menu_")){
              let menuIndex=this.currentCategoryMenus.ids.findIndex(function(id){return id==item.id});
              menus.push(this.currentCategoryMenus.menus[menuIndex]);
              optionStrings.push(this.currentCategoryMenus.optionStrings[menuIndex]);
              ids.push(this.currentCategoryMenus.ids[menuIndex]);
          }
      })
      console.log("menus: "+JSON.stringify(menus));
      // menuSeq를 변경한단.
      for(let i=0;i<menus.length;i++){
           menus[i].menuSeq=i;
      }
      this.currentCategoryMenus.menus=menus;
      this.currentCategoryMenus.optionStrings=optionStrings;
      this.currentCategoryMenus.ids=ids;      
      //apply it into this.menus. 처리하자....  this를 넘기질 못한다. 그냥 global 변수를 사용하자.
      let categoryIndex=this.storageProvider.menus.findIndex(function(val){return val.category==gPage.currentCategoryMenus.category});     
      this.storageProvider.menus[categoryIndex]=this.currentCategoryMenus;
      this.saveButtonHidden=false;
      console.log("menus:"+JSON.stringify(this.storageProvider.menus[categoryIndex]));
  }

   selectCategory(category){
      console.log("selectCategory:"+category);
	  this.storageProvider.categorySelected=category;
      let categoryIndex=this.storageProvider.menus.findIndex(function(val){return val.category==category});     
      this.currentCategoryMenus=this.storageProvider.menus[categoryIndex];
      //선택옵션의 경우 newComplexMenuItems사용을 위해 초기회가 필요하다.
      this.newComplexMenuItems=[];
      if(this.currentCategoryMenus.type.startsWith("complex") && this.currentCategoryMenus.menus.length>0){
            let menuObj=JSON.parse(this.currentCategoryMenus.menus[0].menu);
            menuObj.forEach(menu=>{
                let key:any=Object.keys(menu);
                let object={};
                object[key]=menu[key];
                object["string"]=key+" "+menu[key];
                this.newComplexMenuItems.push(object);
            });
            this.newAmount=undefined;
            this.newName="";
            console.log("newComplexMenuItems:"+JSON.stringify(this.newComplexMenuItems));
            if(this.currentCategoryMenus.type=="complex-choice")
                this.newChoiceNumber=this.currentCategoryMenus.menus[0].choiceNumber;
      }
      this.newAmount=undefined;
      this.newName="";
      console.log("newComplexMenuItems:"+JSON.stringify(this.newComplexMenuItems));

      console.log("currentCategoryMenus:"+JSON.stringify(this.currentCategoryMenus));
   }


   reconfigureSeq(menus){
        //compute categorySeq again.
        let index=0;
        menus.forEach(category=>{
            category.categorySeq=index;
            index++;
        });
        menus.forEach(category=>{
            for(let i=0;i<category.menus.length;i++){
                category.menus[i].categorySeq=category.categorySeq;
                category.menus[i].menuSeq=i;
            }
        })
        
        let sequences=[];
        for(let j=0;j<menus.length;j++){
            let category=menus[j];
            sequences.push({category:category.category,categorySeq:category.categorySeq,menu:"empty",menuSeq:-1});                                        
            for(let i=0;i<category.menus.length;i++){
                sequences.push( {category:category.category,categorySeq:category.categorySeq, menu:category.menus[i].menu,menuSeq:i});
            }
        }
        return sequences;
   }

   addCategory(){
       if(!this.newCategory || this.newCategory.trim().length==0){
            let alert = this.alertCtrl.create({
                title: '카테고리 이름을 입력해주시기 바랍니다.',
                buttons: ['확인']
                });
                alert.present();
            return;
       }
        let sequences=[];
        // category 추가는 맨 마지막에 들어감으로 기존 메뉴의 sequence에는 영향을 주지 않는다.
        if(!this.saveButtonHidden){
            this.storageProvider.menus.forEach(category=>{
                sequences.push({category:category.category,categorySeq:category.categorySeq,menu:"empty",menuSeq:-1});
                for(let i=0;i<category.menus.length;i++)
                    sequences.push({category:category.category,categorySeq:category.categorySeq,menu:category.menus[i].menu,menuSeq:i});
            })
        }
        let reqBody={category:this.newCategory, type:this.newCategoryType, categorySeq:this.storageProvider.menus.length ,sequences:sequences};    
        this.storageProvider.addCategory(reqBody).then(()=>{
            // server로 부터 최신 정보를 받아오자.
            let alert = this.alertCtrl.create({
                    title: this.newCategory+'가 추가되었습니다.',
                    buttons: ['확인']
            });
            alert.present();
            this.newCategory="";  
            this.saveButtonHidden=true;
        },err=>{
            let alert = this.alertCtrl.create({
                    title: '카테고리 추가에 실패했습니다.',
                    subTitle: JSON.stringify(err),
                    buttons: ['확인']
            });
            alert.present();                
        })
   }


   removeCategory(category){
    console.log("removeCategory:"+category.category);
    let alert = this.alertCtrl.create({
                          title: category.category+"를 삭제합니다",
                          buttons: [
                          {
                            text: '아니오',
                            handler: () => {
                              return;
                            }
                          },
                          {
                            text: '네',
                            handler: () => {
                                let menus=this.storageProvider.menus.slice(0);
                                let categoryIndex=menus.findIndex(function(val){return val.category==category.category});     
                                console.log("categoryIndex:"+categoryIndex);      
                                menus.splice(categoryIndex,1);
                                let sequences=this.reconfigureSeq(menus);
                                let reqBody={category:category.category,sequences:sequences,type:category.type};
                                this.storageProvider.removeCategory(reqBody).then(()=>{
                                        // console.log(" "+ (this.categorySelected==category.category));
                                        if(this.storageProvider.categorySelected==category.category && this.storageProvider.menus.length>0){ //선택된 카테고리의 삭제라면 0번째를 선택함.
                                            this.storageProvider.categorySelected=this.storageProvider.menus[0].category;
                                            //this.currentCategoryMenus=this.storageProvider.menus[0].menus;
                                            console.log("this.categorySelected"+this.storageProvider.categorySelected);
                                        }else if(this.storageProvider.menus.length==0){
                                            this.storageProvider.categorySelected="";
                                            this.currentCategoryMenus={type:"general",optionStrings:[]};
                                        }  
                                        this.saveButtonHidden=true;
                                },err=>{
                                        let alert = this.alertCtrl.create({
                                                title: '카테고리 삭제에 실패했습니다.',
                                                subTitle: JSON.stringify(err),
                                                buttons: ['확인']
                                        });
                                        alert.present();                
                                })
                            }
                        }]});
          alert.present();              
   }

   categoyTypeSelect(type){
        this.newCategoryType=type;
        console.log("categoyTypeSelect "+this.newCategoryType);
   }

  close(){
      if(!this.saveButtonHidden){
          let alert = this.alertCtrl.create({
                          title: "메뉴 변경사항을 저장합니다.",
                          buttons: [
                          {
                            text: '아니오',
                            handler: () => {
                              this.storageProvider.maxMenuId=0;
                              this.storageProvider.categorySelected=undefined;
                              this.navCtrl.pop();
                              return;
                            }
                          },
                          {
                            text: '네',
                            handler: () => {
                                  this.saveSequence().then(()=>{
                                        this.storageProvider.maxMenuId=0;
                                        this.storageProvider.categorySelected=undefined;
                                        this.navCtrl.pop();
                                        return;
                                  },err=>{
                                        let alert = this.alertCtrl.create({
                                                title: '변경사항 저장에 실패했습니다.',
                                                subTitle: JSON.stringify(err),
                                                buttons: ['확인']
                                        });
                                        alert.present();                
                                        this.storageProvider.maxMenuId=0;
                                        this.storageProvider.categorySelected=undefined;
                                        this.navCtrl.pop();
                                  }); 
                                  return;
                            }
                          }]});
                    alert.present();       
      }else{
            this.storageProvider.maxMenuId=0;
            this.storageProvider.categorySelected=undefined;
            this.navCtrl.pop();
      }
  }

 // 메뉴에 sequence 적용 코드-end
 /////////////////////////////////////////////////////////////////////////////// 
 openConfig(){
   console.log("push ManagerPasswordPage");
   this.navCtrl.push(ManagerPasswordPage);
 }
}
