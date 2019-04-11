import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatTableDataSource, MatPaginator, MatRadioChange } from '@angular/material';

import { PersonService } from '../person.service';
import { Person } from '../person';
import { Movie } from '../movie';

// export interface MovieDetail {
//   movieid: number;
//   title: string;
//   role: string;
//   revenue: number;
//   avg_rating: number;
//   releasedate: string;
// }

export interface Trend {
  value: number;
  period: string;
}

// export interface Genre {
//   id: number;
//   name: string;
//   popularity: number;
//   mcount: number;
// }

@Component({
  selector: 'app-person-profile',
  templateUrl: './person-profile.component.html',
  styleUrls: ['./person-profile.component.css']
})
export class PersonProfileComponent implements OnInit {

  person: Person;
  topMovies: Movie[];
  topMoviesColumns: string[];
  topMoviesDataSource: MatTableDataSource<Movie>;
  topMoviesCriteria = 'popularity';
  trendCriteria = 'popularity';
  show = false;
  trendChart = {
    type: 'line',
    data: [{ data: [], label: '', fill: false }],
    labels: [],
    legend: true,
    options: {
      scaleShowVerticalLines: true,
      responsive: true
    }
  };
  genresChart = {
    type: 'radar',
    data: [{ data: [], label: '', fill: true, count: 0 }],
    labels: [],
    legend: true,
    options: {
      scaleShowVerticalLines: true,
      responsive: true,
      scale: {
        ticks: {
          beginAtZero: true
        }
      }
    }
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private personService: PersonService
  ) { }

  ngOnInit() {
    this.person = { personid: -1, fullname: '', gender: '' };
    this.getPerson();
  }

  getPerson(): void {
    this.personService
      .getPersonById(this.route.snapshot.paramMap.get('id'))
      .toPromise()
      .then(person => {
        this.person = person;
        this.getGenresData();
        this.getTopMovies();
        this.getPopularityTrend();
      });
  }

  getTopMovies(): void {
    this.personService
      .getTopMovies(this.person.personid.toString(), this.topMoviesCriteria)
      .toPromise()
      .then(movies => {
        this.topMovies = movies;
        this.topMoviesDataSource = new MatTableDataSource<Movie>(this.topMovies);
        this.topMoviesDataSource.paginator = this.paginator;
        this.updateTopMoviesColumns();
      });
  }

  getPopularityTrend(): void {
    this.personService
      .getPopularityTrend(this.person.personid.toString(), this.trendCriteria)
      .toPromise()
      .then(trend => {
        this.setTrendData(trend);
      });
  }

  getGenresData(): void {
    this.personService
      .getGenresData(this.person.personid.toString())
      .toPromise()
      .then(genres => {
        genres.forEach((dataPoint) => {
          this.genresChart.data[0]['data'].push(dataPoint.popularity);
          this.genresChart.data[0]['label'] = 'popularity';
          this.genresChart.labels.push(dataPoint.name);
        });
      });
  }

  updateTopMoviesColumns(): void {
    if (this.topMoviesCriteria === 'rating') {
      this.topMoviesColumns = ['title', 'role', 'avg_rating', 'releasedate'];
    } else if (this.topMoviesCriteria === 'revenue') {
      this.topMoviesColumns = ['title', 'role', 'revenue', 'releasedate'];
    } else {
      this.topMoviesColumns = ['title', 'role', 'releasedate'];
    }
  }

  changeTopMoviesCriteria($event: MatRadioChange): void {
    this.topMoviesCriteria = $event.value;
    this.getTopMovies();
  }

  changeTrendCriteria($event: MatRadioChange): void {
    this.trendCriteria = $event.value;
    this.trendChart.data[0]['data'] = [];
    this.trendChart.labels = [];
    this.getPopularityTrend();
  }

  setTrendData(trend: Trend[]) {
    trend.forEach((dataPoint, index) => {
      this.trendChart.data[0]['data'].push(dataPoint.value);
      this.trendChart.labels.push(dataPoint.period);
    });
  }

  // setTrendData(trend: Trend[]) {
  //   this.trendChart.data[this.trendChart.count] = { data: [], labels: '', fill: false };
  //   console.log('count: ' + this.trendChart.count);
  //   console.log('data: ' + this.trendChart.data[0]);
  //   trend.forEach((dataPoint, index) => {
  //     this.trendChart.data[this.trendChart.count]['data'].push(dataPoint.value);
  //     if (!this.trendChart.labelSet.has(dataPoint.period)) {
  //       this.trendChart.labels.push(dataPoint.period);
  //     }
  //   });
  //   this.trendChart.count++;
  // }

  routeToMovieDetail(row): void {
    if (row) {
      console.log(row);
      this.router.navigateByUrl('/detail/' + row.movieid);
    }
  }
}
