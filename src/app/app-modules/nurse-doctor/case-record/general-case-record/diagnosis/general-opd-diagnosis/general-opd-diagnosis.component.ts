/*
* AMRIT – Accessible Medical Records via Integrated Technology 
* Integrated EHR (Electronic Health Records) Solution 
*
* Copyright (C) "Piramal Swasthya Management and Research Institute" 
*
* This file is part of AMRIT.
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see https://www.gnu.org/licenses/.
*/
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';

import { FormBuilder, FormGroup, FormControl, FormArray, NgForm } from '@angular/forms';

import { MasterdataService, NurseService, DoctorService } from '../../../../shared/services';

import { GeneralUtils } from '../../../../shared/utility';

import { ConfirmationService } from "../../../../../core/services/confirmation.service";
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-general-opd-diagnosis',
  templateUrl: './general-opd-diagnosis.component.html',
  styleUrls: ['./general-opd-diagnosis.component.css']
})
export class GeneralOpdDiagnosisComponent implements OnInit, OnDestroy {

  utils = new GeneralUtils(this.fb);

  @Input('generalDiagnosisForm')
  generalDiagnosisForm: FormGroup;

  @Input('caseRecordMode')
  caseRecordMode: string;

  @Input('visitCategory')
  visitCat: any;

  current_language_set: any;
  designation: any;
  specialist:boolean;
  constructor(
    private fb: FormBuilder,
    public httpServiceService: HttpServiceService,
    private nurseService: NurseService,
    private doctorService: DoctorService,
    private masterdataService: MasterdataService,
    private confirmationService: ConfirmationService) { }

  ngOnInit() {
    this.assignSelectedLanguage();
    // this.httpServiceService.currentLangugae$.subscribe(response =>this.current_language_set = response);
    this.designation = localStorage.getItem("designation");
     if (this.designation == "TC Specialist") {
       this.generalDiagnosisForm.controls['instruction'].enable();
       this.specialist = true;
     } else {
       this.generalDiagnosisForm.controls['instruction'].disable();
       this.specialist = false;
     }
   }

   ngDoCheck() {
    this.assignSelectedLanguage();
  }
  assignSelectedLanguage() {
    const getLanguageJson = new SetLanguageComponent(this.httpServiceService);
    getLanguageJson.setLanguage();
    this.current_language_set = getLanguageJson.currentLanguageObject;
    }
    
   get specialistDaignosis() {
    return this.generalDiagnosisForm.get("instruction");
  }

  ngOnChanges() {
    if (this.caseRecordMode == 'view') {
      let beneficiaryRegID = localStorage.getItem('beneficiaryRegID');
      let visitID = localStorage.getItem('visitID');
      let visitCategory = localStorage.getItem('visitCategory');

      if(localStorage.getItem("referredVisitCode") == "undefined" || localStorage.getItem("referredVisitCode") == null)
      {
      this.getDiagnosisDetails();
      }
      else
        if(parseInt(localStorage.getItem("specialist_flag")) == 3){
        this.getMMUDiagnosisDetails(beneficiaryRegID, visitID, visitCategory,localStorage.getItem("visitCode"));
        }
      else
      {
        this.getMMUDiagnosisDetails(beneficiaryRegID, localStorage.getItem("referredVisitID"), visitCategory,localStorage.getItem("referredVisitCode"));
      }
    }
  }

  diagnosisSubscription: Subscription;
  getDiagnosisDetails() {
    this.diagnosisSubscription = this.doctorService.populateCaserecordResponse$
      .subscribe(res => {
        if (res && res.statusCode == 200 && res.data && res.data.diagnosis) {
          this.generalDiagnosisForm.patchValue(res.data.diagnosis)
          if (res.data.diagnosis.provisionalDiagnosisList) {
            this.patchDiagnosisDetails(res.data.diagnosis.provisionalDiagnosisList);
          }
        }
      })
  }


  MMUdiagnosisSubscription:any;
  getMMUDiagnosisDetails(beneficiaryRegID, visitID, visitCategory,visitCode) {
    this.MMUdiagnosisSubscription = this.doctorService.getMMUCaseRecordAndReferDetails(beneficiaryRegID, visitID, visitCategory,visitCode)
    .subscribe(res => {
      if (res && res.statusCode == 200 && res.data && res.data.diagnosis) {
        this.generalDiagnosisForm.patchValue(res.data.diagnosis)
        if (res.data.diagnosis.provisionalDiagnosisList) {
          this.patchDiagnosisDetails(res.data.diagnosis.provisionalDiagnosisList);
        }
      }
    })

         
   
  }


  // MMUdiagnosisSubscription:any;
  // getMMUDiagnosisDetails(beneficiaryRegID, visitID, visitCategory) {
  //   this.diagnosisSubscription = this.doctorService.getMMUCaseRecordAndReferDetails(beneficiaryRegID, visitID, visitCategory,localStorage.getItem("visitCode"))
  //     .subscribe(res => {
  //       if (res && res.statusCode == 200 && res.data && res.data.diagnosis) {
  //         this.generalDiagnosisForm.patchValue(res.data.diagnosis)
  //         let diagnosisRes;
  //         if(res.data.diagnosis.provisionalDiagnosisList)
  //         {
  //         diagnosisRes = res.data.diagnosis.provisionalDiagnosisList;
  //         }
  //         else{
  //           diagnosisRes=[];
  //         }
  //         this.MMUdiagnosisSubscription = this.doctorService.getMMUCaseRecordAndReferDetails(beneficiaryRegID, localStorage.getItem("referredVisitID"), visitCategory,localStorage.getItem("referredVisitCode"))
  //         .subscribe(response => {

  //           if (response && response.statusCode == 200 && response.data && response.data.diagnosis) {
  //             let diagnosisResponse;
  //             if(response.data.diagnosis.provisionalDiagnosisList)
  //             {
  //           diagnosisResponse = response.data.diagnosis.provisionalDiagnosisList;
  //             }
  //             else{
  //               diagnosisResponse=[];
  //             }

  //             for(let i=0,j=diagnosisRes.length;i<diagnosisResponse.length;i++,j++)
  //             {
  //               diagnosisRes[j]=diagnosisResponse[i];
  //             }

  //             this.patchDiagnosisDetails(diagnosisRes);
  //           }
              
            

  //         })

         
  //       }
  //     })
  // }


  patchDiagnosisDetails(provisionalDiagnosis) {
    let savedDiagnosisData = provisionalDiagnosis;
    let diagnosisArrayList = this.generalDiagnosisForm.controls['provisionalDiagnosisList'] as FormArray;
    console.log("from diagnosis" + provisionalDiagnosis[0].term );
    if(provisionalDiagnosis[0].term != "" && provisionalDiagnosis[0].conceptID != "")
    {
      console.log("from diagnosis second" + provisionalDiagnosis[0].term );
      
      for (let i = 0; i < savedDiagnosisData.length; i++) {

        diagnosisArrayList.at(i).patchValue({
          "viewProvisionalDiagnosisProvided": savedDiagnosisData[i].term,
          "term": savedDiagnosisData[i].term,
          "conceptID": savedDiagnosisData[i].conceptID
        });
        (<FormGroup>diagnosisArrayList.at(i)).controls['viewProvisionalDiagnosisProvided'].disable();
        if (diagnosisArrayList.length < savedDiagnosisData.length)
          this.addDiagnosis();
      }
    }
  }

  addDiagnosis() {
    let diagnosisArrayList = this.generalDiagnosisForm.controls['provisionalDiagnosisList'] as FormArray;
    if (diagnosisArrayList.length <= 29) {
      diagnosisArrayList.push(this.utils.initProvisionalDiagnosisList());
    } else {
      this.confirmationService.alert(this.current_language_set.alerts.info.maxDiagnosis);
    }
  }
  removeDiagnosisFromList(index, diagnosisListForm?: FormGroup) {
    let diagnosisListArray = this.generalDiagnosisForm.controls['provisionalDiagnosisList'] as FormArray;
    if (diagnosisListArray.at(index).valid) {
      this.confirmationService.confirm(`warn`, this.current_language_set.alerts.info.warn).subscribe(result => {
        if (result) {
          let diagnosisListArray = this.generalDiagnosisForm.controls['provisionalDiagnosisList'] as FormArray;
          if (diagnosisListArray.length > 1) {
            diagnosisListArray.removeAt(index);
          }
          else {
            diagnosisListForm.reset();
            diagnosisListForm.controls['viewProvisionalDiagnosisProvided'].enable();
          }
          this.generalDiagnosisForm.markAsDirty();
        }
      });
    } else {
      if (diagnosisListArray.length > 1) {
        diagnosisListArray.removeAt(index);
      }
      else {
        diagnosisListForm.reset();
        diagnosisListForm.controls['viewProvisionalDiagnosisProvided'].enable();
      }
    }

  }
  checkProvisionalDiagnosisValidity(provisionalDiagnosis) {
    let temp = provisionalDiagnosis.value;
    if (temp.term && temp.conceptID) {
      return false;
    } else {
      return true;
    }
  }
  ngOnDestroy() {
    if (this.diagnosisSubscription) {
      this.diagnosisSubscription.unsubscribe();
    }
  }
}
