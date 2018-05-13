# ricecakeUI

this is the ricecakeuserinterfaces for a ricecakeshop in korea!
You will notice it is written by ionic which save us so many times for making this app so quickly!
I really highly recommend for all of you since easiness of typing and understanding each coding as soon as possiible!
If you have more questions, please join our website, Thank you very much!

$ionic cordova plugin add cordova-plugin-inappbrowser

$npm install --save @ionic-native/in-app-browser

$ionic cordova plugin add cordova-plugin-printer

$npm install --save @ionic-native/printer

$ionic cordova plugin add cordova-plugin-advanced-http

$npm install --save @ionic-native/http

$npm install --save ionic3-calendar-en

$ionic cordova plugin add phonegap-plugin-push

$npm install --save @ionic-native/push

$ionic cordova plugin add cordova-plugin-background-mode

$npm install --save @ionic-native/background-mode

$npm install --save ng2-dragula

$ionic cordova plugin add cordova-plugin-nativestorage

$npm install --save @ionic-native/native-storage

$ionic cordova plugin add cordova-plugin-screen-orientation

$npm install --save @ionic-native/screen-orientation

app.scss에 아래 라인을 반듯이 추가해야만 한다

    .gu-mirror {

      position: fixed !important;

      margin: 0 !important;

      z-index: 9999 !important;

      opacity: 0.8;

      -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=80)";

      filter: alpha(opacity=80);

    }

    .gu-hide {

      display: none !important;

    }

    .gu-unselectable {

      -webkit-user-select: none !important;

      -moz-user-select: none !important;

      -ms-user-select: none !important;

      user-select: none !important;

    }

    .gu-transit {

      opacity: 0.2;

      -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=20)";

      filter: alpha(opacity=20);

    }



