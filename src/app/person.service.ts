import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http } from '@angular/http';

import { Person } from './person';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  personsList: Person[];
  // constructor(private httpClient: HttpClient) { }
  constructor(private http: Http) { }

  // getPersons(filter: {name: string}): Observable<Person[]> {
  //   const res = this.httpClient.get<Person[]>('api/persons/' + filter.name)
  //     .pipe(map(result => this.personsList = result));
  //   console.log('personList: ' + this.personsList);
  //   return res;
  // }

  getPersons(filter: {name: string}): Observable<Person[]> {
    return this.http.get('api/persons/' + filter.name)
      .pipe(map(result => this.personsList = result.json().data));
  }
}
