// data.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { Observable } from 'rxjs';
import {catchError, share } from 'rxjs/operators'
import {throwError as observableThrownError, throwError} from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private data: any[] = [];
  url= 'http://localhost:3000/budget';

  public dataSource = {
    datasets: [
        {
            data: [],
            backgroundColor: [
                '#ffcd56',
                '#ff6384',
                '#36a2eb',
                '#fd6b19',
            ]
        }
    ],
    labels: []
};

  constructor(private http: HttpClient) {}

  public fetchData() {
    // return this.http.get<any[]>('http://localhost:3000/budget');
    const res = this.http.get<any[]>(this.url).pipe(
      share(),
      catchError(this.handleError.bind(this))
    );
    res.subscribe((data: any) => { // Add type annotation to 'data'
      for (var i = 0; i < data.myBudget.length; i++) {
        (this.dataSource.datasets[0].data as number[])[i] = data.myBudget[i].budget;
        (this.dataSource.labels as any[])[i] = data.myBudget[i].title;
      }
    });
    return this.dataSource;
    // return this.http.get(this.url).pipe(share(), catchError(this.handleError.bind(this)));
  }

  setData(data: any[]): void {
    this.data = data;
  }

  getData(): any[] {
    return this.data;
  }

  private handleError(error: HttpErrorResponse | any): any {
    return observableThrownError(error)
  }
}
