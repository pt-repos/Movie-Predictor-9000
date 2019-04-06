import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { PersonService } from '../person.service';
import { Movie } from '../movie';
import { Person } from '../person';

export interface MovieDetail {
  movieid: number;
  title: string;
  role: string;
  revenue: number;
  rating: number;
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
      .getTopMovies(this.person.personid.toString())
      .toPromise()
      .then(movies => {
        this.topMovies = movies;
        this.topMoviesDataSource = new MatTableDataSource<MovieDetail>(this.topMovies);
        this.topMoviesDataSource.paginator = this.paginator;
      });
  }

  routeToMovieDetail(row) {
    if (row) {
      console.log(row);
      this.router.navigateByUrl('/detail/' + row.movieid);
    }
  }
}
