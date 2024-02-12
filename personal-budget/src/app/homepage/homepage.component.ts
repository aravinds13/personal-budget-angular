import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import * as d3 from 'd3';
import { scaleOrdinal } from 'd3-scale';
import { DataService } from '../data.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit {
  public chartData: any = [];

  // @ViewChild('myD3Chart') chartRef: ElementRef;

  public chart: any = [];
  private _current: any;

  constructor(private chartRef: ElementRef, private http: HttpClient, public data: DataService) {

  }
  ngOnInit(): void {

    this.getData();
  }

  getData() {
    this.data.fetchData();
    this.createChart();
    this.createD3Chart();
  }

  createChart() {
    this.chart = new Chart("myChart", {
      type: 'pie',
      data: this.data.dataSource
    });
  }

  createD3Chart(){
    const ctx = document.getElementById('myD3Chart') as HTMLCanvasElement;
    var svg = d3.select(ctx)
        .append("svg")
        .append("g")

    svg.append("g")
        .attr("class", "slices");
    svg.append("g")
        .attr("class", "labels");
    svg.append("g")
        .attr("class", "lines");

    var width = 960,
        height = 450,
        radius = Math.min(width, height) / 2;

    var pie = d3.pie()
      .sort(null)
      .value((d: any) => {
        return d.value;
      });

    var arc = d3.arc()
      .outerRadius(radius * 0.8)
      .innerRadius(radius * 0.4);

    var outerArc = d3.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var key = (d: any) => { return d.data.label; };

    var color = scaleOrdinal()
      .domain([...this.data.dataSource.labels])
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    const dataSource = this.data.dataSource;
    const generateData = () => {
      var labels = color.domain();
      var values = [...dataSource.datasets[0].data];
      var returnObj = []
      for(var i=0; i<labels.length; i++){
        returnObj.push({label: labels[i], value: values[i]});
      }
      return returnObj;
    }


    const change = (data: any) => {
        console.log(data);

        /* ------- PIE SLICES -------*/
        var slice = svg.select(".slices").selectAll("path.slice")
            .data(pie(data), key);

        slice.enter()
            .insert("path")
            .style("fill", (d: any) => color(d.data.label) as any)
            .attr("class", "slice");

        slice
          .transition().duration(1000)
          .attrTween("d", (d: any) => { // Explicitly define the type of 'd' as 'any'
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return (t: any) => { // Explicitly define the type of 't' as 'number'
              return arc(interpolate(t)) || ""; // Return an empty string if the value is null
            };
          })

        slice.exit()
          .remove();

        /* ------- TEXT LABELS -------*/

        var text = svg.select(".labels").selectAll("text")
            .data(pie(data), key);

        text.enter()
          .append("text")
          .attr("dy", ".35em")
          .text((d: any) => { // Explicitly define the type of 'd' as 'any'
            return d.data.label;
          });

        const midAngle = (d: any) => {
          return d.startAngle + (d.endAngle - d.startAngle)/2;
        }

        text.transition().duration(1000)
          .attrTween("transform", (d: any) => { // Explicitly define the type of 'this' as 'any', and the type of 'd' as 'any'
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return (t: any) => {
              var d2 = interpolate(t);
              var pos = outerArc.centroid(d2);
              pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
              return "translate("+ pos +")";
            };
          })
            .styleTween("text-anchor", (d: any) => { // Explicitly define the type of 'd' as 'any'
              this._current = this._current || d;
              var interpolate = d3.interpolate(this._current, d);
              this._current = interpolate(0);
              return (t: any) => {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start":"end";
              };
            });

        text.exit()
            .remove();

        /* ------- SLICE TO TEXT POLYLINES -------*/

        var polyline = svg.select(".lines").selectAll("polyline")
            .data(pie(data), key);

        polyline.enter()
            .append("polyline");

        polyline.transition().duration(1000)
          .attrTween("points", (d: any) => {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return (t: any) => {
              var d2 = interpolate(t);
              var pos = outerArc.centroid(d2);
              pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
              return `${arc.centroid(d2)},${outerArc.centroid(d2)},${pos}`;
            };
          });

        polyline.exit()
          .remove();
    };

    change(generateData());
}

}
