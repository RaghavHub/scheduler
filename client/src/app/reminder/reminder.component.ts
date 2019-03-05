import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {Reminder} from './../reminder'
import * as Moment from 'Moment';
import { MatTable } from '@angular/material';
import { ScheduleFetchService } from './../schedule-fetch.service'
import { FormControl, FormGroup, NgForm } from '@angular/forms';

@Component({
  selector: 'app-reminder',
  templateUrl: './reminder.component.html',
  styleUrls: ['./reminder.component.css']
})
export class ReminderComponent implements OnInit {
  newReminderForm = new FormGroup({
    category: new FormControl()
  });
  reminder:Reminder;
  categories:string[];
  id:number;
  date = new Date;
  time =new Date() ;
  schedule:Reminder[]=[];
  selectedReminder:Reminder;
  count:number;
  message:string;
  selectedReminders:number[];
  isNew:boolean=false;
  isSelect:boolean = false;
  filter:any =[];
  isTodo:boolean=false;
  @ViewChild(MatTable) table: MatTable<any>;
  displayedColumns :string[] =['id','category','date','time','desc','status','comments'];
  filter_form = new NgForm(null,null);
  categoryControl = new FormControl();
  categoryOptions: Observable<string[]>;

  //todo
  items:string[];

  constructor(private schedulefetch: ScheduleFetchService, private changeDetectorRefs: ChangeDetectorRef ) {
    this.schedule =new Array();
    this.reminder = new Reminder();
    this.categories=[]
    this.refresh()
    this.items=[];
    this.filter=[]
    // this.reminder = reminder
   }

  ngOnInit() {
    this.categoryOptions = this.categoryControl.valueChanges
      .pipe(
        startWith(''),
        map(name => name ? this._filter(name) : this.categories.slice())
      );
  }

  addItem(f){
    console.log(this.categoryControl.value)
    f.value['category'] = this.categoryControl.value
    console.log(this.categoryControl.value)
    console.log(f.value['category']);
    var reminder = this.formToReminder(f);
    console.log(reminder);
    var record = this.reminderToQuery(reminder);
    var promise = new Promise(resolve => {
      this.schedulefetch.fetchData(JSON.stringify(record)).subscribe((data: any[]) =>{resolve(data);})
    });
    promise.then((res:any[]) => {
      // console.log(res+" "+this.selectedReminder);
      if (res.length == 0 && this.selectedReminder == null) { this.add_data(record);}
      else if (this.selectedReminder != null) { this.modify_data(record); } 
      else this.message="Record Exists";
    })
  }
  onSelect(row){
    // console.log("row",row)
    this.selectedReminder = row
    this.reminder = row
    this.isNew = true;
  }
  btn_done(){
    this.reminder.status = 'Done';
    var query = this.reminderToQuery(this.reminder);
    this.modify_data(query);
    this.selectedReminder = null;
  }
  btn_del(){
    this.message =null;
    if(this.selectedReminder!=null){
      var record = this.reminderToQuery(this.selectedReminder);
      var promise = new Promise(resolve => {
        this.schedulefetch.deleteData(JSON.stringify(record)).subscribe((data: any[]) => {
          resolve()
        })
      });
      promise.then(() => { this.table.renderRows(); })
      this.selectedReminder = null
    }
    else{
      this.message = "Select record to be deleted"
    }
  }
  showForm(){
          this.isNew = !this.isNew ;
  }
  showTodo(){
    this.isTodo = !this.isTodo;
  }

  filter_by_date(move) {
    var date;
    if(move=='forward'){
      date = Moment(this.date.setDate(this.date.getDate() + 1)).format('YYYYMMDD');
    }
    else if(move=='backward'){
      // date = this.date.setDate(this.date.getDate() + 1).toString();
      date = Moment(this.date.setDate(this.date.getDate() - 1)).format('YYYYMMDD');
    }
    this.date = Moment(date).toDate();
    var reminder = new Reminder(null, null, null, date);
    this.update_table(reminder);
  }

  apply_filter(f){
    // console.log(this.filter_form)
    var reminder =this.formToReminder(f);
    var filter = this.reminderToQuery(reminder);
    // console.log("filter",filter)
    var promise = new Promise(resolve => {
      this.schedulefetch.fetchData(JSON.stringify(filter)).subscribe((data: any[]) => {
      this.handle_data(data);
      resolve()
    })});
    promise.then(() => { this.table.renderRows(); })
  }

  toggle(){
    this.isSelect = (!this.isSelect)
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.categories.filter(option => { if (option != null) return option.toLowerCase().indexOf(filterValue)===0});
  }

  set_threshold(days){
    // console.log("days",days);
    var promise = new Promise(resolve => {
      this.schedulefetch.setThreshold(JSON.stringify([days])).subscribe((data: any[]) => {
      // console.log("res",data);
      })
    });
    promise.then(() => { this.table.renderRows(); })
  }

  //quick to-do
  add_todo(item){
    var items = item.split('\n');
    // console.log(items);
    var date = Moment(date).format('YYYYMMDD');
    for (var i in items){
      this.id =this.id+1;
      // console.log(this.id)
      var reminder = new Reminder(this.id, null, items[i],date);
      var record = this.reminderToQuery(reminder);
      this.add_data(record);
    }
    this.isTodo = false;
  }

  add_data(record){
    var promise = new Promise(resolve => {

      this.schedulefetch.putData(JSON.stringify(record)).subscribe((data: any) => {this.refresh()});
      resolve()
    })
    promise.then(() => { this.table.renderRows(); })
  }

  modify_data(record){
      var promise = new Promise(resolve => {

        this.schedulefetch.updateData(JSON.stringify(record)).subscribe((data: any) => {this.isNew = false;this.selectedReminder =null;} )
        resolve()
      })
    promise.then(() => { this.table.renderRows(); })
    }
  

  handle_data(data){
    this.schedule=[];
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var reminder = new Reminder()
      var date = null;
      var time = null;
      if (row['date'] == null) {
        reminder.date = null
      }
      else {
        date = Moment(row['date']).format('YYYY-MM-DD')
        time = '00:00:00'
        reminder.date = date

      }
      if (row['start_time'] == null) {
        reminder.start_time = null
      }
      else {
        date = Moment(new Date()).format('YYYY-MM-DD');
        reminder.start_time = Moment(date + " " + row['start_time']).toDate()
      }
      reminder.id = data[i]['id']
      reminder.category = data[i]['category']
      reminder.desc = data[i]['desc']
      reminder.status = data[i]['status']
      reminder.comments = (data[i]['comments'] == null ? '' : data[i]['comments'])
      this.schedule.push(reminder);
      this.schedule.sort(function (a, b) { 
        var x_time = (a.start_time == null) ?'23:59:59' : Moment(a.start_time).format('HH:mm:ss');
        var y_time = (b.start_time == null) ? '23:59:59' : Moment(b.start_time).format('HH:mm:ss');
        var x = Moment(new Date(a.date + " " + x_time))
        var y = Moment(new Date(b.date + " " + y_time))
        // console.log("y", y_time)
        return (x.diff(y));
      })
    }

  }

  update_table(reminder){
    var query = this.reminderToQuery(reminder)
    var promise = new Promise(resolve => {
      this.schedulefetch.fetchData(JSON.stringify(query)).subscribe((data: any[]) => {
        this.handle_data(data);
        resolve()
      })
    });
    promise.then(() => { this.table.renderRows(); })
  }

  refresh(){
    this.filter =[];
    var date =new Date()
    if (this.date!=null){
       date = this.date;
    }
    var reminder = new Reminder(null, null, null, Moment(date).format('YYYYMMDD'));
    // var promise1 = new Promise(resolve => {
    //   this.schedulefetch.fetchData(JSON.stringify(query)).subscribe((data: any[]) => {
    //     this.handle_data(data);
    //     resolve()
    //   })
    // });
    var promise2 = new Promise(resolve => {
      var query =['category']
      this.schedulefetch.fetchField(JSON.stringify(query)).subscribe((data: any[]) => {
        for (var i in data){
          this.categories.push(data[i]['category'])
        }
        resolve()
      })
    });
    // promise1.then(() => { this.table.renderRows(); })
    promise2.then(() => { this.table.renderRows(); })
    this.reminder = new Reminder();
    var promise = new Promise(resolve => {
      this.schedulefetch.getID().subscribe((data: any) => {
        this.id = data[0]['MAX(`id`)']
        // console.log(this.id);
        // this.id = data;
        resolve()
      })
    });
    promise.then(() => {this.reminder.id =this.id + 1;
      this.reminder.date = Moment(this.date).format('YYYY-MM-DD');});
    this.isNew = false;
    this.selectedReminder = null;
    this.update_table(reminder);
  }

  reminderToQuery(reminder){
    var date;
    var time;
    if (reminder.date != null) {
      date = Moment(reminder.date).format('YYYYMMDD')
    }
    if (reminder.start_time != null) {
      // console.log("start time",reminder.start_time);
      time = Moment(reminder.start_time).format('HH:mm:ss')
    }
    return { "id": reminder.id, "category": reminder.category, "date": date, "start_time": time, "desc": reminder.desc, "status": reminder.status, "comments": reminder.comments }
  }
  formToReminder(f){
    var reminder = new Reminder(f.value['id'],f.value['category'],f.value['desc'],f.value['date'],f.value['start_time'],f.value['status'],f.value['comments'])
    return reminder
  }

}
