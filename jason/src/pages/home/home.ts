import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  mydate:string = new Date().toISOString();
 
  public dateEvent = {
    month: '2018-02-19',
    timeStarts: '06:00',
    timeEnds: '2018-02-20'
  }
  constructor(public navCtrl: NavController) {

  }

}
