import { Injectable } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Location } from '@angular/common';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  // To store the status that the page is root page or not
  public rootPage: boolean;
  public isLoading = false;

  // To store the page name
  public serviceStatus: string;
  public imageData: any;

  constructor(private alertCtrl: AlertController, private location: Location, private loadingCtrl: LoadingController,
    private toastCtrl: ToastController, private camera: Camera, private geolocation: Geolocation) { }


  /**
   * This method is used to show alert when their is no record found.
   *
   * @memberof SharedService
   */
  async showAlertForNoRecord() {
    const alert = await this.alertCtrl.create({
      header: 'INFO',
      message: 'NO_RECORD_FOUND',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.location.back();
          }
        }
      ]
    });

    await alert.present();
  }

  async showMessage(msg: string, duration: number = 2000): Promise<void> {
    const message = await this.toastCtrl.create({
      message: msg,
      duration: duration
    });
    await message.present();
  }

  async showAlert(header: string, msg: string, buttons: Array<any> = ['OK']): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: header,
      cssClass:'my-custom-class',
      message: msg,
      buttons: buttons
    });
    return await alert.present();
  }

  async present() {
    this.isLoading = true;
    return await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Downloading Please Wait. . ',
    }).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss().then();
        }
      });
    });
  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().then(() => (''));
  }

  /**
     * This method is used to camera option to take the receipt photo
     * @memberof SharedService
     */
    openCamera(): Promise < any > {
      let promise: Promise < any > = new Promise(async (resolve, reject) => {
        const options: CameraOptions = {
          quality: 90, // picture quality
          destinationType: this.camera.DestinationType.DATA_URL,
          encodingType: this.camera.EncodingType.JPEG,
          mediaType: this.camera.MediaType.PICTURE,
          targetWidth: 720,
          correctOrientation: true
        };
        this.setCameraImageToPath(options).then(data=>{
          resolve(data)
        })
      });
      return promise;
    }

    /**
      * This method will allow the user to acces the gallery of the mobile to choose the image for profile image.
      *
      * @memberof SharedService
      */
     openGallery(): Promise < any > {
      let promise: Promise < any > = new Promise(async (resolve, reject) => {
        const options: CameraOptions = {
          quality: 90,
          sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
          destinationType: this.camera.DestinationType.DATA_URL,
          encodingType: this.camera.EncodingType.JPEG,
          mediaType: this.camera.MediaType.PICTURE,
          targetWidth: 600,
          targetHeight: 800
        };
        this.setCameraImageToPath(options).then(data=>{
          resolve(data)
        })
      });
      return promise;
    }


    /**
     * This method get the base64 data from camera, set to the imageUrl to show updated image in view.
     * Push the image after conertion to file in fileImage variable for further use.
     *
     * @param {*} file
     * @memberof SharedService
     */
    setCameraImageToPath(options): Promise < any > {
      let promise: Promise < any > = new Promise(async (resolve, reject) => {
        this.camera.getPicture(options).then((base64Data) => {
          this.geolocation.getCurrentPosition(options).then(resp => {
            this.imageData = {
              src: "data:image/jpeg;base64," + base64Data,
              meta_info: "Lat:" + resp.coords.latitude + "; Long:" + resp.coords.longitude + "; Accuracy :" + resp.coords.accuracy
            }
            resolve(this.imageData)
          }).catch(error => {
            this.imageData = {
              src: "data:image/jpeg;base64," + base64Data
            }
            resolve(this.imageData)
          });
        }, (err) => {
          reject(err)
        });
      });
      return promise;
    }

}