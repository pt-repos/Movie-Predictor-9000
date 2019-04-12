import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatFormFieldModule, MatInputModule,
  MatAutocompleteModule, MatButtonModule,
  MatTableModule, MatPaginatorModule,
  MatRadioModule
} from '@angular/material';
import { RouteReuseStrategy } from '@angular/router';
import { ChartsModule } from 'ng2-charts';

import { AppComponent } from './app.component';
import { MoviesComponent } from './movies/movies.component';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';
import { AppRoutingModule } from './/app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { PersonProfileComponent } from './person-profile/person-profile.component';
import { CustomRouteReuseStrategy } from './custom-route-reuse.strategy';

@NgModule({
    declarations: [
        AppComponent,
        MoviesComponent,
        MovieDetailComponent,
        DashboardComponent,
        SearchBarComponent,
        PersonProfileComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        HttpClientModule,
        AppRoutingModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatTableModule,
        MatPaginatorModule,
        MatRadioModule,
        BrowserAnimationsModule,
        ChartsModule
    ],
    providers: [
      {
        provide: RouteReuseStrategy,
        useClass: CustomRouteReuseStrategy
      }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
