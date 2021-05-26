import { Component, OnInit } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ConstantService } from 'src/app/services/constant.service';
import { Storage } from '@ionic/storage';
import { SharedService } from 'src/app/services/shared.service';
import { Platform } from '@ionic/angular';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { NetworkService } from 'src/app/services/network.service';

@Component({
  selector: 'app-meal-management',
  templateUrl: './meal-management.page.html',
  styleUrls: ['./meal-management.page.scss'],
})
export class MealManagementPage implements OnInit {
  
  mealStatus:boolean
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
  syncDisabled:boolean;
  constructor(private datepipe: DatePipe, private storage: Storage, private sharedSvc: SharedService,
    private location: Location, private diagnostic: Diagnostic, private platform: Platform,
    private networkSvc: NetworkService) { 
  }

  ngOnInit() {
    this.maxDate = this.datepipe.transform(new Date(), ConstantService.message.maxDate)
    this.currentDate = new Date().toISOString();
    this.selectedSegment = "procurement";
    this.mealStatus = false;
    this.currentReason = [];
    this.noMealRemark = '';
    this.noMealRemarkStatus = false;
    this.mealNotHappenedRecords = [];
    this.syncDisabled = false;
    this.selectedWeek = this.datepipe.transform(this.currentDate,'full').split(',')[0].trim()

    this.storage.get(ConstantService.dbKeyNames.mealManagementData).then(async (data:any)=>{
      console.log(data)
      this.reasonList = await data.reason;
      this.menuList = await data.menu;
      await this.setMealDataToUi(this.currentDate);

      // if(this.selectedWeek == 'Sunday'){
      //   this.sharedSvc.showAlert("Warning","Sunday is off, choose other date");
      // }else{
      //   this.menuList.forEach(menu => {
      //     if(menu.day == this.selectedWeek){
      //       this.menuOnDate = menu.items
      //     }
      //   });
      // }
    })
  }

  toggle(){
    if(!this.mealSwitch)
    {
      this.mealStatus =false;
      console.log(this.mealStatus);
    }
    else{
      this.mealStatus = true;
      console.log(this.mealStatus);
    }

  }

  changeDate(currentDate){
    console.log(currentDate)
    this.mealStatus = false;
    this.currentReason = [];
    this.noMealRemark = '';
    this.noMealRemarkStatus = false;
    this.procurementImage = undefined;
    this.procurementRemark = undefined;
    this.procurementDateTime = undefined;
    this.preparationImage = undefined;
    this.preparationRemark = undefined;
    this.preparationDateTime = undefined;
    this.distributionImage = undefined;
    this.distributionRemark = undefined;
    this.distributionDateTime = undefined;
    this.mealNotHappenedRecords = [];
    this.syncDisabled = false;
    this.setMealDataToUi(currentDate);
  }

  setMealDataToUi(currentDate){
    this.toggle();
    this.selectedWeek = this.datepipe.transform(this.currentDate,'full').split(',')[0].trim();
    if(this.selectedWeek == 'Sunday'){
      this.sharedSvc.showAlert("Warning","Sunday is off, choose other date");
    }else{
      this.menuList.forEach(menu => {
        if(menu.day == this.selectedWeek){
          this.menuOnDate = menu.items
        }
      });
    }
    this.storage.get(ConstantService.dbKeyNames.mealManagementRecord).then((mealManagementRecord: any[])=>{
      if(mealManagementRecord == null){
        
      }else{
        this.mealNotHappenedRecords = mealManagementRecord;
        let data: any = mealManagementRecord.filter(data=> data.date.substr(0, 10) == currentDate.substr(0, 10));
        if(data[0].status != undefined)
        if(data[0].status){
          this.mealSwitch = data[0].status == 1?true:false;
          this.procurementImage = data[0].stage1Image;
          this.procurementRemark = data[0].stage1Remark;
          this.preparationImage = data[0].stage2Image;
          this.preparationRemark = data[0].stage2Remark;
          this.distributionImage = data[0].stage3Image;
          this.distributionRemark = data[0].stage3Remark;
        }else{
          this.mealSwitch = data[0].status == 1?true:false;
          this.currentReason = data[0].reasonId
          this.noMealRemark = data[0].remarks
        }
        if(data[0].sync_status){
          this.syncDisabled = true;
        }
      }
    })
  }

  selectReason(){
    console.log(this.currentReason)
  }

  segmentChanged(){

  }

  mealSubmit(){
    let mealNotHappened
    if(!this.mealStatus){
      if(this.currentReason.length == 0){
        this.sharedSvc.showMessage("Please select the reason, why meal not happened.")
      }else{
        this.noMealRemarkStatus = false;
        this.currentReason.forEach(reasonId => {
          if(reasonId == 4 && this.noMealRemark.trim() == ''){
            this.noMealRemarkStatus = true;
          }
        });
        if(this.noMealRemarkStatus){
          this.sharedSvc.showMessage("Remark field is mandatory to fillup.")
        }else{
          mealNotHappened = {
            "date": this.currentDate,
            "status": this.mealStatus == true? 1 : 0,
            "reasonId": this.currentReason,
            "remarks": this.noMealRemark,
            "sync_status": false,
          }
          this.saveMealManagementRecord(mealNotHappened)
        }
      }
    }else{
      if(this.distributionImage != undefined){
        mealNotHappened = {
          "date": this.currentDate,
          "status": this.mealStatus == true? 1 : 0,
          "stage1Image": this.procurementImage,
          "stage1Remark": this.procurementRemark,
          "stage2Image": this.preparationImage,
          "stage2Remark": this.preparationRemark,
          "stage3Image": this.distributionImage,
          "stage3Remark": this.distributionRemark,
          "sync_status": false,
        }
        this.saveMealManagementRecord(mealNotHappened)
      }else{
        this.sharedSvc.showMessage("Capture the distribution image.")
      }
    }
  }

  saveMealManagementRecord(mealNotHappened){
    this.mealNotHappenedRecords.push(mealNotHappened)
    this.storage.get(ConstantService.dbKeyNames.mealManagementRecord).then(fetchedData=>{
      if(fetchedData == null){
        this.storage.set(ConstantService.dbKeyNames.mealManagementRecord,this.mealNotHappenedRecords).then(()=>{
          this.sharedSvc.showMessage(ConstantService.message.recordSaved);
          this.location.back();
        });
      }else{
        let updateDataStatus: boolean = false;
        for (let i = 0; i < fetchedData.length; i++) {
          if(fetchedData[i].date.substr(0,10) == this.currentDate.substr(0,10)){
              fetchedData[i] = mealNotHappened;
              updateDataStatus = true;
          }
        }
        if(updateDataStatus){
          this.storage.set(ConstantService.dbKeyNames.mealManagementRecord, fetchedData).then(data => {
            this.sharedSvc.showMessage(ConstantService.message.recordUpdate)
            this.location.back();
          })
        }else{
          this.storage.set(ConstantService.dbKeyNames.mealManagementRecord, this.mealNotHappenedRecords).then(data => {
            this.sharedSvc.showMessage(ConstantService.message.recordSaved)
            this.location.back();
          })
        }
      }
    })
  }

  goToProcurement(){
    this.selectedSegment = 'procurement'
  }

  goToPreparation(){
    if(this.procurementImage != undefined)
    this.selectedSegment = 'preparation'
  }

  goToDistribution(){
    if(this.preparationImage != undefined)
    this.selectedSegment = 'distribution'
  }

  uploadphoto(){
    this.takeLocationPermission();
  }

  takeLocationPermission(){
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
          this.sharedSvc.showAlertCallBack(ConstantService.message.somethingWentWrong,ConstantService.message.geoTagForPhoto).then(data => {
            if (data) {
              this.diagnostic.switchToLocationSettings();
            } else {
              this.sharedSvc.showMessage(ConstantService.message.enableGeoLocation)
            }
          })
        } else {
          this.sharedSvc.openCamera(this.networkSvc.online).then(data=>{
            switch (this.selectedSegment) {
              case 'procurement':
                this.procurementImage = this.sharedSvc.imageData;
                this.procurementDateTime = this.datepipe.transform(this.currentDate,ConstantService.message.dateTimeFormat);
                this.procurementGeoInfo = this.sharedSvc.geocoderResult;
                console.log("Reverse Geo Location"+JSON.stringify(this.sharedSvc.geocoderResult));
                break;
              case 'preparation':
                this.preparationImage = this.sharedSvc.imageData
                this.preparationDateTime = this.datepipe.transform(this.currentDate,ConstantService.message.dateTimeFormat);
                this.preparationGeoInfo = this.sharedSvc.geocoderResult;
                console.log("Reverse Geo Location"+JSON.stringify(this.sharedSvc.geocoderResult));
                break;
              case 'distribution':
                this.distributionImage = this.sharedSvc.imageData
                this.distributionDateTime = this.datepipe.transform(this.currentDate,ConstantService.message.dateTimeFormat);
                this.distributionGeoInfo = this.sharedSvc.geocoderResult;
                console.log("Reverse Geo Location"+JSON.stringify(this.sharedSvc.geocoderResult));
                break;
            }
          }).catch(error=>{
            setTimeout(() => {
              console.log(error)
              this.sharedSvc.imageData = undefined;
              this.sharedSvc.showAlert(ConstantService.message.somethingWentWrong,ConstantService.message.internetOrLocationOff)
            }, 1000);
          });
        }
      })
    // }else{
    //   this.sharedSvc.showMessage(ConstantService.message.checkInternetConnection)
    // }
  }
}
