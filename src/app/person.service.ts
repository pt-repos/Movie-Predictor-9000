import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Http, RequestOptions } from '@angular/http';

import { Person } from './person';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  personsList: Person[];
  // personsList: string[];
  result: any;

  constructor(private http: HttpClient) { }
  // constructor(private http: Http) { }

  getPersons(filter: { name: string }): Observable<Person[]> {
    if (!filter.name) {
      return of([]);
    }
    const options = { params: new HttpParams().set('name', filter.name) };
    return this.http.get('api/persons', options)
      .pipe(
        map(response => this.personsList = response['data'])
      );
  }

  // getPersons(filter: { name: string }): Observable<string[]> {
  //   if(!filter.name) {
  //     return of([]);
  //   }

  //   return this.http.get('/api/persons', { params: { 'name': filter.name } })
  //     .pipe(map(result => this.personsList = result.json().data));
  // }
}
