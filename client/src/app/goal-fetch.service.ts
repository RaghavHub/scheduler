import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpParams } from "@angular/common/http";


@Injectable({
  providedIn: 'root'
})
export class GoalFetchService {
  url = 'http://localhost:5000/goal/'

  constructor(private http: HttpClient) { }

  fetchData(data) {
    const params = new HttpParams().set('selection', data);
    return this.http.get(this.url, { params: params });
  }
  fetchPending(data) {
    const params = new HttpParams().set('threshold', data);
    return this.http.get(this.url+'pending/', { params: params });
  }

  setThreshold(data) {
    console.log(data)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(this.url+'threshold/', data, httpOptions);
  }
  fetchField(fields) {
    const params = new HttpParams().set('selection', fields);
    return this.http.get(this.url+'getFields/', { params: params });
  }
  putData(data) {
    console.log(data)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(this.url, data, httpOptions);
  }
  updateData(data) {
    console.log(data)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(this.url+'update/', data, httpOptions);
  }
  getID() {
    return this.http.get(this.url+'id/');
  }
  deleteData(data) {
    console.log("delete called")
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(this.url+'delete/', data, httpOptions);
  }

}
