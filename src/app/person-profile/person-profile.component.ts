import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatTableDataSource } from '@angular/material'
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

  constructor(
    private route: ActivatedRoute,
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
      });
  }

  getTopMovies(): void {
    this.personService
      .getTopMovies(this.person.personid.toString())
      .subscribe(movies => this.topMovies = movies);
  }
}
