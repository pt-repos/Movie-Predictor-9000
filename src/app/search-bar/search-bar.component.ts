import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { switchMap, debounceTime, tap, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Person } from '../person';
import { PersonService } from '../person.service';


@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {

  filteredList: Person[] = [];
  // personsForm: FormGroup;
  // isLoading = false;

  // constructor(private fBuilder: FormBuilder, private personService: PersonService) { }

  // ngOnInit() {
  //   this.personsForm = this.fBuilder.group({
  //     searchInput: null
  //   });

  //   this.personsForm
  //     .get('input')
  //     .valueChanges
  usersForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private personService: PersonService) { }

  ngOnInit() {
    this.usersForm = this.fb.group({
      userInput: null
    });

    this.usersForm
      .get('userInput')
      .valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoading = true),
        switchMap(value => this.personService.getPersons({name: value})
          .pipe(
            finalize(() => this.isLoading = false)
          )
        )
      )
      .subscribe(result => this.filteredList = result);
      console.log('filteredList: ' + this.filteredList)
  }
}
