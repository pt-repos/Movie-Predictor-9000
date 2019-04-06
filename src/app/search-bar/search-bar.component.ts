import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { switchMap, debounceTime, startWith } from 'rxjs/operators';
import { Person } from '../person';
import { PersonService } from '../person.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {

  searchInput: FormControl = new FormControl();
  filteredOptions: Person[];

  constructor(private personService: PersonService, private router: Router) {}

  ngOnInit() {
    this.getFilteredOptions();
  }

  getFilteredOptions() {
    this.searchInput.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        switchMap(name => this.personService.getPersons({name: name}))
      ).subscribe(options => this.filteredOptions = options);
  }

  routeToPerson() {
    if(this.searchInput.value) {
      this.router.navigateByUrl('/person-profile/' + this.searchInput.value.personid);
    }
  }

  displayFn(person?: Person): string | undefined {
    return person ? person.fullname : undefined;
  }
}
