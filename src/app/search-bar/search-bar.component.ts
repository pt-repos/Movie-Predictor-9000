import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { switchMap, debounceTime, startWith } from 'rxjs/operators';
import { Observable, Subject, of } from 'rxjs';
import { Person } from '../person';
import { PersonService } from '../person.service';


@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {

  searchInput: FormControl = new FormControl();
  filteredOptions: Person[];

  constructor(private personService: PersonService) {}

  setOptions(options: Person[]): void {
    this.filteredOptions = options;
    console.log('this.filteredOptions:');
    console.log(this.filteredOptions);
  }

  ngOnInit() {
    this.searchInput.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        switchMap(name => this.personService.getPersons({name: name}))
      ).subscribe(options => this.setOptions(options));
  }

  /* filteredOptions: Observable<Person[]>;
  private searchText = new Subject<string>();

  constructor(private personService: PersonService) { }

  search(name: string) {
    this.searchText.next(name);
  }

  ngOnInit() {
    this.filteredOptions = this.searchText.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(name => this.personService.getPersons({name: name}))
    );
  } */
}
