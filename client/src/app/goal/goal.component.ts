import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Goal } from '../goal'
import * as Moment from 'Moment';
import { MatTable } from '@angular/material';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { GoalFetchService } from '../goal-fetch.service';

@Component({
  selector: 'app-goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.css']
})
export class GoalComponent implements OnInit {
  newgoalForm = new FormGroup({
    category: new FormControl()
  });
  goal: Goal;
  categories: string[];
  id: number;
  date = new Date;
  schedule: Goal[] = [];
  selectedgoal: Goal;
  count: number;
  message: string;
  selectedgoals: number[];
  isNew: boolean = false;
  isSelect: boolean = false;
  filter: any = [];
  isTodo: boolean = false;
  @ViewChild(MatTable) table: MatTable<any>;
  displayedColumns: string[] = ['id', 'category', 'date', 'desc', 'status', 'comments'];
  filter_form = new NgForm(null, null);
  categoryOptions: Observable<string[]>;

  //todo
  items: string[];

  constructor(private goalfetch: GoalFetchService, private changeDetectorRefs: ChangeDetectorRef) {
    this.schedule = new Array();
    this.goal = new Goal();
    this.categories = []
    this.refresh()
    this.items = [];
    this.filter = []
    // this.goal = goal
  }

  ngOnInit() {
    // this.categoryOptions = this.categoryControl.valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => this._filter(value))
    //   );
  }
  addItem(f) {
    var goal = this.formTogoal(f);
    var record = this.goalToQuery(goal);
    var promise = new Promise(resolve => {
      this.goalfetch.fetchData(JSON.stringify(record)).subscribe((data: any[]) => { resolve(data); })
    });
    promise.then((res: any[]) => {
      // console.log(res + " " + this.selectedgoal);
      if (res.length == 0 && this.selectedgoal == null) { this.add_data(record); }
      else if (this.selectedgoal != null) { this.modify_data(record); }
      else this.message = "Record Exists";
    })
  }
  onSelect(row) {
    // console.log("row", row)
    this.selectedgoal = row
    this.goal = row
    this.isNew = true;
  }
  btn_done() {
    this.goal.status = 'Done';
    var query = this.goalToQuery(this.goal);
    this.modify_data(query);
    this.selectedgoal = null;
  }
  btn_del() {
    this.message = null;
    if (this.selectedgoal != null) {
      var record = this.goalToQuery(this.selectedgoal);
      var promise = new Promise(resolve => {
        this.goalfetch.deleteData(JSON.stringify(record)).subscribe((data: any[]) => {
          resolve()
        })
      });
      promise.then(() => { this.table.renderRows(); })
      this.selectedgoal = null
    }
    else {
      this.message = "Select record to be deleted"
    }
  }
  showForm() {
    this.isNew = !this.isNew;
  }
  showTodo() {
    this.isTodo = !this.isTodo;
  }

  filter_by_date(move) {
    var date;
    if (move == 'forward') {
      date = Moment(this.date.setDate(this.date.getDate() + 1)).format('YYYYMMDD');
    }
    else if (move == 'backward') {
      // date = this.date.setDate(this.date.getDate() + 1).toString();
      date = Moment(this.date.setDate(this.date.getDate() - 1)).format('YYYYMMDD');
    }
    this.date = Moment(date).toDate();
    var goal = new Goal(null, null, null, date);
    this.update_table(goal);
  }

  apply_filter(f) {
    // console.log(this.filter_form)
    var goal = this.formTogoal(f);
    var filter = this.goalToQuery(goal);
    // console.log("filter", filter)
    var promise = new Promise(resolve => {
      this.goalfetch.fetchData(JSON.stringify(filter)).subscribe((data: any[]) => {
        this.handle_data(data);
        resolve()
      })
    });
    promise.then(() => { this.table.renderRows(); })
  }

  toggle() {
    this.isSelect = (!this.isSelect)
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    if (this.categories != null) { return this.categories.filter(option => { if (option != null) option.toLowerCase().includes(filterValue) }); }
    else return this.categories;
  }

  set_threshold(days) {
    // console.log("days", days);
    var promise = new Promise(resolve => {
      this.goalfetch.setThreshold(JSON.stringify([days])).subscribe((data: any[]) => {
        // console.log("res", data);
      })
    });
    promise.then(() => { this.table.renderRows(); })
  }

  //quick to-do
  add_todo(item) {
    var items = item.split('\n');
    // console.log(items);
    var date = Moment(date).format('YYYYMMDD');
    for (var i in items) {
      this.id = this.id + 1;
      // console.log(this.id)
      var goal = new Goal(this.id, null, items[i], date);
      var record = this.goalToQuery(goal);
      this.add_data(record);
    }
    this.isTodo = false;
  }

  add_data(record) {
    var promise = new Promise(resolve => {

      this.goalfetch.putData(JSON.stringify(record)).subscribe((data: any) => { this.refresh() });
      resolve()
    })
    promise.then(() => { this.table.renderRows(); })
  }

  modify_data(record) {
    var promise = new Promise(resolve => {

      this.goalfetch.updateData(JSON.stringify(record)).subscribe((data: any) => { this.isNew = false; this.selectedgoal = null; })
      resolve()
    })
    promise.then(() => { this.table.renderRows(); })
  }


  handle_data(data) {
    this.schedule = [];
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var goal = new Goal()
      var date = null;
      if (row['date'] == null) {
        goal.date = null
      }
      else {
        date = Moment(row['date']).format('YYYY-MM-DD')
        goal.date = date

      }
      goal.id = data[i]['id']
      goal.category = data[i]['category']
      goal.desc = data[i]['desc']
      goal.status = data[i]['status']
      goal.comments = (data[i]['comments'] == null ? '' : data[i]['comments'])
      this.schedule.push(goal);
      this.schedule.sort(function (a, b) {
        var x = Moment(new Date(a.date))
        var y = Moment(new Date(b.date))
        return (x.diff(y));
      })
    }

  }

  update_table(goal) {
    var query = this.goalToQuery(goal)
    var promise = new Promise(resolve => {
      this.goalfetch.fetchData(JSON.stringify(query)).subscribe((data: any[]) => {
        this.handle_data(data);
        resolve()
      })
    });
    promise.then(() => { this.table.renderRows(); })
  }

  refresh() {
    this.filter = [];
    var goal = new Goal();
    // var promise1 = new Promise(resolve => {
    //   this.schedulefetch.fetchData(JSON.stringify(query)).subscribe((data: any[]) => {
    //     this.handle_data(data);
    //     resolve()
    //   })
    // });
    var promise2 = new Promise(resolve => {
      var query = ['category']
      this.goalfetch.fetchField(JSON.stringify(query)).subscribe((data: any[]) => {
        for (var i in data) {
          this.categories.push(data[i]['category'])
        }
        resolve()
      })
    });
    // promise1.then(() => { this.table.renderRows(); })
    promise2.then(() => { this.table.renderRows(); })
    this.goal = new Goal();
    var promise = new Promise(resolve => {
      this.goalfetch.getID().subscribe((data: any) => {
        this.id = data[0]['MAX(`id`)']
        // this.id = data;
        resolve()
      })
    });
    promise.then(() => {
      this.goal.id = this.id + 1;
    });
    this.isNew = false;
    this.selectedgoal = null;
    this.update_table(goal);
  }

  goalToQuery(goal) {
    var date;
    if (goal.date != null) {
      date = Moment(goal.date).format('YYYYMMDD')
    }
    return { "id": goal.id, "category": goal.category, "date": date, "desc": goal.desc, "status": goal.status, "comments": goal.comments }
  }
  formTogoal(f) {
    var goal = new Goal(f.value['id'], f.value['category'], f.value['desc'], f.value['date'], f.value['status'], f.value['comments'])
    return goal
  }

}
