import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit {
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

  // @ViewChild('myChart') chartRef: ElementRef;

  public chart: any = [];

  constructor(private elementRef: ElementRef, private http: HttpClient) {

  }
  ngOnInit(): void {
    this.http.get('http://localhost:3000/budget')
      .subscribe((res: any) => {
        for (var i = 0; i < res.myBudget.length; i++) {
          (this.dataSource.datasets[0].data as number[])[i] = res.myBudget[i].budget;
          (this.dataSource.labels as any[])[i] = res.myBudget[i].title;
        }
        this.createChart();
      })
  }

  createChart() {
    // const ctx = this.chartRef.nativeElement.querySelector('#myChart');
    // const myPieChart = new Chart(ctx, {
    //     type: 'pie',
    //     data: this.dataSource
    // });
    let htmlRef = this.elementRef.nativeElement.querySelector(`#myChart`);
    this.chart = new Chart(htmlRef, {
      type: 'pie',
      data: this.dataSource
    });
  }
}
