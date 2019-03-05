import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import { ChartsModule } from 'ng2-charts';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material-module';
import {MatNativeDateModule} from '@angular/material';
import { MAT_DATE_LOCALE } from '@angular/material';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ReminderComponent } from './reminder/reminder.component';
import { GoalComponent } from './goal/goal.component';

@NgModule({
  imports: [ BrowserModule,
  BrowserAnimationsModule, 
  FormsModule,
  HttpClientModule,
  MaterialModule, 
  MatNativeDateModule,
  ReactiveFormsModule, 
  ChartsModule,
  OwlDateTimeModule,
  OwlNativeDateTimeModule,],
  declarations: [ AppComponent, ReminderComponent, GoalComponent ],
  bootstrap:    [ AppComponent ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'sk-SK' },]
})
export class AppModule { }
