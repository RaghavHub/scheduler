import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpParams } from "@angular/common/http";


@Injectable({
  providedIn: 'root'
})
export class ScheduleFetchService {

  constructor(private http:HttpClient) { }

  fetchData(data){
    const params = new HttpParams().set('selection',data );
    return this.http.get('http://localhost:5000/',{params:params});
  }
  fetchPending(data) {
    const params = new HttpParams().set('threshold', data);
    return this.http.get('http://localhost:5000/reminder/pending/', { params: params });
  }

  setThreshold(data) {
    console.log(data)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post('http://localhost:5000/threshold/', data, httpOptions);
  }
  fetchField(fields) {
    const params = new HttpParams().set('selection', fields);
    return this.http.get('http://localhost:5000/getFields/', { params: params });
  }
  putData(data){
    console.log(data)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post('http://localhost:5000/', data,httpOptions );
  }
  updateData(data) {
    console.log(data)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post('http://localhost:5000/update/', data, httpOptions);
  }
  getID() {
    return this.http.get('http://localhost:5000/id/');
  }
  deleteData(data) {
    console.log("delete called")
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post('http://localhost:5000/delete/', data, httpOptions);
  }

}
