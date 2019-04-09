import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatTableDataSource, MatPaginator, MatRadioChange } from '@angular/material';
import { PersonService } from '../person.service';
import { Person } from '../person';

export interface MovieDetail {
  movieid: number;
  title: string;
  role: string;
  revenue: number;
  avg_rating: number;
  releasedate: string;
}

export interface Trend {
  popularity: number;
  period: string;
}

@Component({
  selector: 'app-person-profile',
  templateUrl: './person-profile.component.html',
  styleUrls: ['./person-profile.component.css']
})
export class PersonProfileComponent implements OnInit {

  person: Person;
  topMovies: MovieDetail[];
  topMoviesColumns: string[];
  topMoviesDataSource: MatTableDataSource<MovieDetail>;
  topMoviesCriteria = 'popularity';
  show = false;
  trendChart = {
    type: 'line',
    data: [{data: [], label: ''}],
    labels: [],
    options: { scaleShowVerticalLines: true, responsive: true },
    legend: true
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
        this.topMoviesDataSource = new MatTableDataSource<MovieDetail>(this.topMovies);
        this.topMoviesDataSource.paginator = this.paginator;
        this.updateTopMoviesColumns();
      });
  }

  getPopularityTrend(): void {
    this.personService
      .getPopularityTrend(this.person.personid.toString())
      .toPromise()
      .then(trend => {
        this.setTrendData(trend);
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

  setQueryParam($event: MatRadioChange): void {
    this.topMoviesCriteria = $event.value;
    this.getTopMovies();
  }

  setTrendData(trend: Trend[]) {
    trend.forEach((value, index) => {
        this.trendChart.data[0]['data'].push(value.popularity);
        this.trendChart.labels.push(value.period);
      });
  }

  routeToMovieDetail(row): void {
    if (row) {
      console.log(row);
      this.router.navigateByUrl('/detail/' + row.movieid);
    }
  }
}
