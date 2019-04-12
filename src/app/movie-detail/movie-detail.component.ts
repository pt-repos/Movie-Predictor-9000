import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { Movie } from '../movie';
import { MovieService } from '../movie.service';
import { MatTableDataSource, MatPaginator } from '@angular/material';

@Component({
    selector: 'app-movie-detail',
    templateUrl: './movie-detail.component.html',
    styleUrls: ['./movie-detail.component.css']
})
export class MovieDetailComponent implements OnInit {
    movie: Movie;
    similarMovies = new MatTableDataSource<Movie>([]);
    similarMoviesColumns =  ['title', 'releasedate'];

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private movieService: MovieService,
        private location: Location
    ) { }

    ngOnInit(): void {
      this.getMovie();
    }

    // getMovie(): void {
    //     const id = String(this.route.snapshot.paramMap.get('id'));
    //     this.movieService.getMovie(id)
    //         .subscribe(movie => {
    //             this.movie = movie;
    //         });
    // }

    getMovie(): void {
      this.movieService
        .getMovie(this.route.snapshot.paramMap.get('id'))
        .toPromise()
        .then(movie => {
          this.movie = movie;
          console.log('movie');
          console.log(movie);
          this.getSimilarMovies();
        });
    }

    getSimilarMovies(): void {
      this.movieService
        .getSimilarMovies(this.movie.movieid.toString())
        .toPromise()
        .then(movies => {
          console.log('movies:');
          console.log(movies);
          this.similarMovies.data = movies;
          this.similarMovies.paginator = this.paginator;
        });
    }

    goBack(): void {
        this.location.back();
    }

    routeToMovieDetail(row): void {
      if (row) {
        console.log(row);
        this.router.navigateByUrl('/detail/' + row.movieid);
      }
    }
}