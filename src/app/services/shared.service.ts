import { Injectable } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Location } from '@angular/common';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Subject } from 'rxjs';
import { ConstantService } from './constant.service';
import { Storage } from '@ionic/storage';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Network } from '@ionic-native/network/ngx';


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
  public userFullName: string;
  public geocoderResult: any;
  public schoolId: number;
  public accessToken: string;
  public teacherRole: boolean;
  public userName: string
  public latitude: number
  public longitude: number
  public blinkStauts: boolean;

  private dataUpdate = new Subject();

  constructor(private alertCtrl: AlertController, private location: Location, private loadingCtrl: LoadingController,
    private toastCtrl: ToastController, private camera: Camera, private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder, private diagnostic: Diagnostic, private storage: Storage,
    private androidPermissions: AndroidPermissions, private locationAccuracy: LocationAccuracy) {}

  async showMessage(msg: string, duration: number = 2000): Promise < void > {
    const message = await this.toastCtrl.create({
      message: msg,
      duration: duration
    });
    await message.present();
  }

  async showAlert(header: string, msg: string, buttons: Array < any > = ['OK']): Promise < void > {
    const alert = await this.alertCtrl.create({
      header: header,
      cssClass: 'my-custom-class',
      backdropDismiss: false,
      message: msg,
      buttons: buttons
    });
    return await alert.present();
  }

  showAlertCallBack(title: string, message: string, okBtn: string = 'OK', cancelBtn ? : string): Promise < boolean > {
    let promise: Promise < boolean > = new Promise(async (resolve, reject) => {
      let confirm = await this.alertCtrl.create({
        header: title,
        message: message,
        cssClass: 'my-custom-class',
        backdropDismiss: false,
        buttons: [{
            text: cancelBtn,
            role: 'cancel',
            handler: () => {
              resolve(false)
            }
          },
          {
            text: okBtn,
            handler: () => {
              resolve(true)
            }
          }
        ]
      });
      confirm.present();
    })
    return promise;
  }

  async showLoader(message) {
    this.isLoading = true;
    return await this.loadingCtrl.create({
      spinner: 'circles',
      message: message,
    }).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss().then();
        }
      });
    });
  }

  async dismissLoader() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().then(() => (''));
  }

  /**
   * This method is used to camera option to take the receipt photo
   * @memberof SharedService
   */
  openCamera(networkStatus): Promise < any > {
    let promise: Promise < any > = new Promise(async (resolve, reject) => {
      const options: CameraOptions = {
        quality: 90, // picture quality
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        targetWidth: 720,
        cameraDirection: this.camera.Direction.BACK,
        correctOrientation: true
      };
      this.setCameraImageToPath(options,networkStatus).then(data => {
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    });
    return promise;
  }

  /**
   * This method will allow the user to acces the gallery of the mobile to choose the image for profile image.
   *
   * @memberof SharedService
   */
  //  openGallery(): Promise < any > {
  //   let promise: Promise < any > = new Promise(async (resolve, reject) => {
  //     const options: CameraOptions = {
  //       quality: 90,
  //       sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
  //       destinationType: this.camera.DestinationType.DATA_URL,
  //       encodingType: this.camera.EncodingType.JPEG,
  //       mediaType: this.camera.MediaType.PICTURE,
  //       targetWidth: 600,
  //       targetHeight: 800
  //     };
  //     this.setCameraImageToPath(options).then(data=>{
  //       resolve(data)
  //     }).catch(error=>{
  //       reject(error)
  //     })
  //   });
  //   return promise;
  // }


  /**
   * This method get the base64 data from camera, set to the imageUrl to show updated image in view.
   * Push the image after conertion to file in fileImage variable for further use.
   *
   * @param {*} file
   * @memberof SharedService
   */
  setCameraImageToPath(options,networkStatus): Promise < any > {
    let promise: Promise < any > = new Promise(async (resolve, reject) => {
      this.camera.getPicture(options).then((base64Data) => {
        this.showLoader("Please wait...")
        let geoLocationOption = {
          maximumAge: 3000, timeout: 30000, enableHighAccuracy: true
        }
        let geoCoderOptions: NativeGeocoderOptions = {
          useLocale: true,
          maxResults: 5
        };

        this.diagnostic.isLocationEnabled().then((isEnabled) => {
          debugger;
          if(isEnabled){
            this.geolocation.getCurrentPosition(geoLocationOption).then(resp => {
              this.imageData = {
                src: "data:image/jpeg;base64," + base64Data,
                meta_info: "Lat:" + resp.coords.latitude + "; Long:" + resp.coords.longitude + "; Accuracy :" + resp.coords.accuracy
              }
              if (networkStatus) {
              this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, geoCoderOptions)
                .then((result: NativeGeocoderResult[]) => {
                  this.geocoderResult = result[0];
                  setTimeout(() => {
                    this.dismissLoader();
                    resolve(this.imageData)
                  }, 500);
                }).catch((error) => {
                  this.dismissLoader();
                  console.log(error);
                  reject(error)
                });
              }else{
                let geoCode = {
                  'latitude': resp.coords.latitude,
                  'longitude': resp.coords.longitude
                }
                this.geocoderResult = geoCode;
                setTimeout(() => {
                  this.dismissLoader();
                  resolve(this.imageData)
                }, 500);
              }
            }).catch(error => {
              this.dismissLoader();
              console.log(error);
              reject(error)
            });
          }else{
            this.dismissLoader();
            reject('error')
          }
        });
      }, (error) => {
        this.dismissLoader();
        console.log(error);
        reject(error)
      });
    });
    return promise;
  }

  publishDataUpdate(data: any) {
    this.dataUpdate.next(data);
  }
    
  observeDataUpdate(): Subject<any> {
    return this.dataUpdate;
  }

  chckAppGpsPermission(network): Promise < any > {
    let promise: Promise < any > = new Promise(async (resolve, reject) => {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
        result => {
          if (result.hasPermission) {
            this.requestToSwitchOnGPS(network).then(data => {
              resolve(data)
            }).catch(error => {
              reject(error)
            })
          } else {
            this.askGPSPermission(network);
          }
        },
        error => {
          reject(error)
        }
      );
    })
    return promise
  }

  requestToSwitchOnGPS(network): Promise < any > {
    let promise: Promise < any > = new Promise(async (resolve, reject) => {
      this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
        () => {
          this.openCamera(network).then(data => {
            resolve(data)
          }).catch(error => {
            reject(error)
          })
        },
        error => {
          reject(error)
        }
      );
    })
    return promise
  }

  askGPSPermission(network): Promise < any > {
    let promise: Promise < any > = new Promise(async (resolve, reject) => {
      this.locationAccuracy.canRequest().then((canRequest: boolean) => {
        if (canRequest) {
        } else {
          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
            .then(
              () => {
                this.requestToSwitchOnGPS(network).then(data => {
                  resolve(data)
                }).catch(error => {
                  reject(error)
                })
              },
              error => {
                reject(error)
              }
            );
        }
      }).then(error=>{
        reject(error)
      });
    })
    return promise
  }

  checkForDataSync(){
    this.blinkStauts = false;
    if(this.teacherRole){
      this.storage.get(ConstantService.dbKeyNames.studentAttendanceData).then(data=>{
        if(data != null){
          let filter = data.filter(d=> d.sync_status == false);
          if(filter.length > 0){
            this.blinkStauts = true;
          }
        }
      })
      this.storage.get(ConstantService.dbKeyNames.studentMealAttendanceData).then(data=>{
        if(data != null){
          let filter = data.filter(d=> d.sync_status == false);
          if(filter.length > 0){
            this.blinkStauts = true;
          }
        }
      })
    }else{
      this.storage.get(ConstantService.dbKeyNames.hmstudentAttendanceData).then(data=>{
        if(data != null){
          let filter = data.filter(d=> d.sync_status == false);
          if(filter.length > 0){
            this.blinkStauts = true;
          }
        }
      })
      this.storage.get(ConstantService.dbKeyNames.hmstudentMealAttendanceData).then(data=>{
        if(data != null){
          let filter = data.filter(d=> d.sync_status == false);
          if(filter.length > 0){
            this.blinkStauts = true;
          }
        }
      })
      this.storage.get(ConstantService.dbKeyNames.cchAttendanceData).then(data=>{
        if(data != null){
          let filter = data.filter(d=> d.sync_status == false);
          if(filter.length > 0){
            this.blinkStauts = true;
          }
        }
      })
      this.storage.get(ConstantService.dbKeyNames.mealManagementRecord).then(data=>{
        if(data != null){
          let filter = data.filter(d=> d.sync_status == false);
          if(filter.length > 0){
            this.blinkStauts = true;
          }
        }
      })
    }
  }
    
}
