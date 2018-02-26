import { Component, ViewChild, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, App, Slides } from 'ionic-angular';

/**
 * Generated class for the Page2Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-page2',
  templateUrl: 'page2.html',
})
export class Page2Page {
  //public loginForm: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public app: App
  ) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad Page2Page');
  }

  //Slider methods
  @ViewChild('slider') slider: Slides;
  @ViewChild('innerSlider') innerSlider: Slides;

  login(){
    this.checkPassword(Input);
    this.slider.slideTo(1);
    //this.presentLoading('Thanks for signing up!');
  }

  checkPassword(password){

  }

  resetPassword(){
    this.presentLoading('An e-mail was sent with your new password.');
  }

  slideNext(){
    this.innerSlider.slideNext();
  }

  slidePrevious(){
    this.innerSlider.slidePrev();
  }
   

  presentLoading(message){
    const loading = this.loadingCtrl.create({
      duration: 500
    });

    loading.onDidDismiss(() => {
      const alert = this.alertCtrl.create({
        title: 'Success',
        subTitle: message,
        buttons: ['Dismiss']
      });
      alert.present();
    });

    loading.present();
  }

}
