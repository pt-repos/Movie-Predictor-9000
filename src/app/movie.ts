export class Movie {
    movieid: number;
    imdbid: string;
    title: string;
    budget: number;
    revenue: number;
    releasedate: string;
    runtime: number;
    popularity: number;
    avg_rating: number;

    // TODO: person-profile specific fields - refactor into separate interface
    role: string;
}
