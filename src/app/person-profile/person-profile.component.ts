import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatTableDataSource, MatPaginator, MatRadioChange } from '@angular/material';
import { PersonService } from '../person.service';
import { Movie } from '../movie';
import { Person } from '../person';

export interface MovieDetail {
  movieid: number;
  title: string;
  role: string;
  revenue: number;
  avg_rating: number;
  releasedate: string;
}

@Component({
  selector: 'app-person-profile',
  templateUrl: './person-profile.component.html',
  styleUrls: ['./person-profile.component.css']
})
export class PersonProfileComponent implements OnInit {

  person: Person;
  topMovies: MovieDetail[];
  topMoviesColumns: string[] = ['title', 'role', 'releasedate'];
  topMoviesDataSource: MatTableDataSource<MovieDetail>;
  topMoviesCriteria: string = 'popularity';
  show: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private personService: PersonService
  ) { }

  ngOnInit() {
    // this.topMoviesDataSource.paginator = this.paginator;
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

  updateTopMoviesColumns(): void {
    if (this.topMoviesCriteria === 'rating') {
      this.topMoviesColumns =  ['title', 'role', 'avg_rating', 'releasedate'];
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

  routeToMovieDetail(row): void {
    if (row) {
      console.log(row);
      this.router.navigateByUrl('/detail/' + row.movieid);
    }
  }
}
