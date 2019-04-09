import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Person } from './person';
import { MovieDetail, Trend } from './person-profile/person-profile.component';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  constructor(private http: HttpClient) { }

  getPersons(filter: { name: string }): Observable<Person[]> {
    if (!filter.name) {
      return of([]);
    }
    const options = { params: new HttpParams().set('name', filter.name) };
    return this.http.get('api/person', options)
      .pipe(
        map(response => response['data'])
      );
  }

  getPersonById(id: string): Observable<Person> {
    if (!id) {
      return of();
    }
    const options = { params: new HttpParams().set('id', id) };
    return this.http.get('api/person', options)
      .pipe(
        map(response => response['data'][0])
      );
  }

  getTopMovies(id: string, criteria: string): Observable<MovieDetail[]> {
    if (!id) {
      return of();
    }
    const options = { params: new HttpParams().set('id', id).set('criteria', criteria) };
    return this.http.get('api/person/movies', options)
      .pipe(
        map(response => response['data'])
      );
  }

  getPopularityTrend(id: string): Observable<Trend[]> {
    if (!id) {
      return of();
    }
    const options = { params: new HttpParams().set('id', id) };
    return this.http.get('api/person/trends', options)
      .pipe(
        map(response => response['data'])
      );
  }
}
