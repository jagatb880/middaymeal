import { Component, OnInit } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ConstantService } from 'src/app/services/constant.service';
import { Storage } from '@ionic/storage';
import { SharedService } from 'src/app/services/shared.service';
import { Platform } from '@ionic/angular';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { NetworkService } from 'src/app/services/network.service';

// import { CalendarComponent } from 'ionic2-calendar/calendar';
import { ViewChild, Inject, LOCALE_ID } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-meal-management',
  templateUrl: './meal-management.page.html',
  styleUrls: ['./meal-management.page.scss'],
})
export class MealManagementPage implements OnInit {

  mealStatus: boolean
  mealSwitch: any;
  maxDate: string;
  currentDate: string;
  reasonList: any;
  currentReason: any;
  selectedSegment: any;
  menuList: any;
  menuOnDate: any;
  selectedWeek: any;
  noMealRemark: string;
  noMealRemarkStatus: boolean;
  mealNotHappenedRecords: any[];
  procurementImage: any;
  procurementDateTime: any;
  procurementRemark: any;
  procurementGeoInfo: any;
  preparationImage: any;
  preparationDateTime: any;
  preparationRemark: any;
  preparationGeoInfo: any;
  distributionImage: any;
  distributionRemark: any;
  distributionDateTime: any;
  distributionGeoInfo: any;
  syncDisabled: boolean;
  dateSelected: boolean;
  selectedDate: any;
  currentYear: string;
  currentMonth: string;

  minDate = new Date().toISOString();

  calendar = {
    mode: 'month',
    currentDate: new Date(),
  };

  

markDisabled: any;
  constructor(private datepipe: DatePipe, private storage: Storage, private sharedSvc: SharedService,
    private location: Location, private diagnostic: Diagnostic, private platform: Platform,
    private networkSvc: NetworkService, private alertCtrl: AlertController, @Inject(LOCALE_ID) private locale: string) {}

  ngOnInit() {
    this.markDisabled = (date: Date) => {
      var current = new Date();
      return date > current;
  };
    this.selectedDate =this.calendar.currentDate
    this.maxDate = this.datepipe.transform(new Date(), ConstantService.message.maxDate)
    this.selectedSegment = "procurement";
    this.mealStatus = false;
    this.currentReason = [];
    this.noMealRemark = '';
    this.noMealRemarkStatus = false;
    this.mealNotHappenedRecords = [];
    this.syncDisabled = false;
    this.dateSelected = false;
    //this.selectedWeek = this.datepipe.transform(this.currentDate, 'full').split(',')[0].trim()
    this.storage.get(ConstantService.dbKeyNames.mealManagementData).then(async (data:any)=>{
      this.reasonList = await data.reason;
      this.menuList = await data.menu;
      await this.setMealDataToUi(this.currentDate);
    })
    
  }

  toggle() {
    if (!this.mealSwitch) {
      this.mealStatus = false;
      console.log(this.mealStatus);
    } else {
      this.mealStatus = true;
      this.selectedSegment = 'procurement'
      console.log(this.mealStatus);
    }

  }

  changeDate(currentDate, event) {
    event.stopPropagation();
    return false
    // this.dateSelected = false;
    // console.log(currentDate)
    // this.clearAllPreviewousValues();
    // this.setMealDataToUi(currentDate);
  }

  setMealDataToUi(currentDate) {
    this.toggle();
    this.syncDisabled = false;
    this.selectedWeek = this.datepipe.transform(this.currentDate, 'full').split(',')[0].trim();
    if (this.selectedWeek == 'Sunday') {
      this.syncDisabled = true;
      this.sharedSvc.showAlertCallBack("Warning", "Sunday is off, choose other date").then(data=>{
        this.openCalender()
      });
    } else {
      if (this.menuList != undefined)
        this.menuList.forEach(menu => {
          if (menu.day == this.selectedWeek) {
            this.menuOnDate = menu.items
          }
        });
    }
    this.storage.get(ConstantService.dbKeyNames.mealManagementRecord).then((mealManagementRecord: any[]) => {
      if (mealManagementRecord == null) {

      } else {
        this.mealNotHappenedRecords = mealManagementRecord;
        let data: any = mealManagementRecord.filter(data => data.date.substr(0, 10) == currentDate.substr(0, 10));
        if (data.length > 0 && data[0].status != undefined)
          if (data[0].status) {
            this.mealSwitch = data[0].status == 1 ? true : false;
            this.procurementImage = data[0].stage1Image;
            this.procurementRemark = data[0].stage1Remark;
            this.procurementDateTime = data[0].stage1DateTime;
            this.procurementGeoInfo = data[0].stage1GeoInfo;
            this.preparationImage = data[0].stage2Image;
            this.preparationRemark = data[0].stage2Remark;
            this.preparationDateTime = data[0].stage2DateTime;
            this.preparationGeoInfo = data[0].stage2GeoInfo;
            this.distributionImage = data[0].stage3Image;
            this.distributionRemark = data[0].stage3Remark;
            this.distributionDateTime = data[0].stage3DateTime;
            this.distributionGeoInfo = data[0].stage3GeoInfo;
          } else {
            this.mealSwitch = data[0].status == 1 ? true : false;
            this.currentReason = data[0].reasonId
            this.noMealRemark = data[0].remarks
          }
        if (data[0].sync_status) {
          this.syncDisabled = true;
        }
      }
    })
  }

  selectReason() {
    console.log(this.currentReason)
  }

  segmentChanged() {

  }

  mealSubmit() {
    let mealNotHappened
    if (!this.syncDisabled)
      if (!this.mealStatus) {
        if (this.currentReason.length == 0) {
          this.sharedSvc.showMessage("Please select the reason, why meal not happened.")
        } else {
          this.noMealRemarkStatus = false;
          this.currentReason.forEach(reasonId => {
            if (reasonId == 4 && this.noMealRemark.trim() == '') {
              this.noMealRemarkStatus = true;
            }
          });
          if (this.noMealRemarkStatus) {
            this.sharedSvc.showMessage("Remark field is mandatory to fillup.")
          } else {
            mealNotHappened = {
              "date": this.currentDate,
              "status": this.mealStatus == true ? 1 : 0,
              "reasonId": this.currentReason,
              "remarks": this.noMealRemark,
              "sync_status": false,
            }
            this.saveMealManagementRecord(mealNotHappened)
          }
        }
      } else {
        if(this.selectedSegment == 'procurement' && this.procurementImage == undefined){
          this.sharedSvc.showMessage("Capture the procurement image.")
        }else if(this.selectedSegment == 'procurement'){
          this.setDataToObject(mealNotHappened)
        }else if(this.selectedSegment == 'preparation' && this.preparationImage == undefined){
          this.sharedSvc.showMessage("Capture the preparation image.")
        }else if(this.selectedSegment == 'preparation'){
          this.setDataToObject(mealNotHappened)
        }if(this.selectedSegment == 'distribution' && this.distributionImage == undefined){
          this.sharedSvc.showMessage("Capture the distribution image.")
        }else if(this.selectedSegment == 'distribution'){
          this.setDataToObject(mealNotHappened)
        }
      }
  }

  setDataToObject(mealNotHappened){
    mealNotHappened = {
      "date": this.currentDate,
      "status": this.mealStatus == true ? 1 : 0,
      "stage1Image": this.procurementImage,
      "stage1Remark": this.procurementRemark,
      "stage1DateTime": this.procurementDateTime,
      "stage1GeoInfo": this.procurementGeoInfo,
      "stage2Image": this.preparationImage,
      "stage2Remark": this.preparationRemark,
      "stage2DateTime": this.preparationDateTime,
      "stage2GeoInfo": this.preparationGeoInfo,
      "stage3Image": this.distributionImage,
      "stage3Remark": this.distributionRemark,
      "stage3DateTime": this.distributionDateTime,
      "stage3GeoInfo": this.distributionGeoInfo,
      "sync_status": false,
    }
    this.saveMealManagementRecord(mealNotHappened)
  }

  saveMealManagementRecord(mealNotHappened) {
    this.mealNotHappenedRecords.push(mealNotHappened)
    this.storage.get(ConstantService.dbKeyNames.mealManagementRecord).then(fetchedData => {
      if (fetchedData == null) {
        this.storage.set(ConstantService.dbKeyNames.mealManagementRecord, this.mealNotHappenedRecords).then(() => {
          this.sharedSvc.showMessage(ConstantService.message.recordSaved);
          this.location.back();
        });
      } else {
        let updateDataStatus: boolean = false;
        for (let i = 0; i < fetchedData.length; i++) {
          if (fetchedData[i].date.substr(0, 10) == this.currentDate.substr(0, 10)) {
            fetchedData[i] = mealNotHappened;
            updateDataStatus = true;
          }
        }
        if (updateDataStatus) {
          this.storage.set(ConstantService.dbKeyNames.mealManagementRecord, fetchedData).then(data => {
            this.sharedSvc.showMessage(ConstantService.message.recordUpdate)
            this.location.back();
          })
        } else {
          this.storage.set(ConstantService.dbKeyNames.mealManagementRecord, this.mealNotHappenedRecords).then(data => {
            this.sharedSvc.showMessage(ConstantService.message.recordSaved)
            this.location.back();
          })
        }
      }
    })
  }

  goToProcurement() {
    this.selectedSegment = 'procurement'
  }

  goToPreparation() {
    if (this.procurementImage != undefined)
      this.selectedSegment = 'preparation'
  }

  goToDistribution() {
    if (this.preparationImage != undefined)
      this.selectedSegment = 'distribution'
  }

  uploadphoto() {
    this.takeLocationPermission();
  }

  takeLocationPermission() {
    //if(this.networkSvc.online){
    switch (this.selectedSegment) {
      case 'procurement':
        this.procurementImage = undefined;
        break;
      case 'preparation':
        this.preparationImage = undefined;
        break;
      case 'distribution':
        this.distributionImage = undefined;
        break;
    }
    this.diagnostic.isLocationEnabled().then((isEnabled) => {
      if (!isEnabled && this.platform.is('cordova')) {
        //handle confirmation window code here and then call switchToLocationSettings
        this.sharedSvc.showAlertCallBack(ConstantService.message.somethingWentWrong, ConstantService.message.geoTagForPhoto).then(data => {
          if (data) {
            this.diagnostic.switchToLocationSettings();
          } else {
            this.sharedSvc.showMessage(ConstantService.message.enableGeoLocation)
          }
        })
      } else {
        this.sharedSvc.openCamera(this.networkSvc.online).then(data => {
          switch (this.selectedSegment) {
            case 'procurement':
              this.procurementImage = this.sharedSvc.imageData.src;
              this.procurementDateTime = this.datepipe.transform(new Date(), ConstantService.message.dateTimeFormat);
              this.procurementGeoInfo = this.sharedSvc.geocoderResult;
              console.log("Reverse Geo Location" + JSON.stringify(this.sharedSvc.geocoderResult));
              break;
            case 'preparation':
              this.preparationImage = this.sharedSvc.imageData.src
              this.preparationDateTime = this.datepipe.transform(new Date(), ConstantService.message.dateTimeFormat);
              this.preparationGeoInfo = this.sharedSvc.geocoderResult;
              console.log("Reverse Geo Location" + JSON.stringify(this.sharedSvc.geocoderResult));
              break;
            case 'distribution':
              this.distributionImage = this.sharedSvc.imageData.src
              this.distributionDateTime = this.datepipe.transform(new Date(), ConstantService.message.dateTimeFormat);
              this.distributionGeoInfo = this.sharedSvc.geocoderResult;
              console.log("Reverse Geo Location" + JSON.stringify(this.sharedSvc.geocoderResult));
              break;
          }
        }).catch(error => {
          setTimeout(() => {
            console.log(error)
            this.sharedSvc.imageData = undefined;
            this.sharedSvc.showAlert(ConstantService.message.somethingWentWrong, ConstantService.message.internetOrLocationOff)
          }, 1000);
        });
      }
    })
    // }else{
    //   this.sharedSvc.showMessage(ConstantService.message.checkInternetConnection)
    // }
  }

  clearAllPreviewousValues() {
    this.mealStatus = false;
    this.mealSwitch = false;
    this.currentReason = [];
    this.noMealRemark = '';
    this.noMealRemarkStatus = false;
    this.procurementImage = undefined;
    this.procurementRemark = undefined;
    this.procurementDateTime = undefined;
    this.procurementGeoInfo = undefined;
    this.preparationImage = undefined;
    this.preparationRemark = undefined;
    this.preparationDateTime = undefined;
    this.preparationGeoInfo = undefined;
    this.distributionImage = undefined;
    this.distributionRemark = undefined;
    this.distributionDateTime = undefined;
    this.distributionGeoInfo = undefined;
    this.mealNotHappenedRecords = [];
    this.syncDisabled = false;
  }

  // Change current month/week/day
  next() {
    var swiper = document.querySelector('.swiper-container')['swiper'];
    swiper.slideNext();
  }

  back() {
    var swiper = document.querySelector('.swiper-container')['swiper'];
    swiper.slidePrev();
  }

  // Focus today
  today() {
    this.calendar.currentDate = new Date();
  }

  // Calendar event was clicked
  async onEventSelected(event) {
    // Use Angular date pipe for conversion
    let start = formatDate(event.startTime, 'medium', this.locale);
    let end = formatDate(event.endTime, 'medium', this.locale);

    const alert = await this.alertCtrl.create({
      header: event.title,
      subHeader: event.desc,
      message: 'From: ' + start + '<br><br>To: ' + end,
      buttons: ['OK']
    });
    alert.present();
  }

  dateSelectedDone(){
    this.dateSelected = true
    this.clearAllPreviewousValues();
    this.setMealDataToUi(this.currentDate);
  }

  onTimeSelected(ev) {
    let selected = new Date(ev.selectedTime);
    this.selectedDate = selected
    this.storage.set("Currentdate",selected)
    this.currentDate = this.datepipe.transform(selected,"EEEE d MMM y");
    this.currentYear = this.datepipe.transform(selected,"y");
    this.currentMonth = this.datepipe.transform(selected,"MMM");
  }

  openCalender(){
    this.storage.get("Currentdate").then(date=>{
      this.calendar.currentDate = date;
      this.dateSelected = false
    })
  }
}
