import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { News } from '../models/news';
import { catchError, map } from 'rxjs';
import { Constants } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor() { }
  baseURL = Constants.BaseURL;
  http = inject(HttpClient);

  getNewsFeed(limit: number) {
    return this.http.get<News[]>(this.baseURL + "GetLatestNews/" + limit);
  }
  
  login() {
    return this.http.post<{token : string}>(this.baseURL + "Login", {"Name" : "default"}).pipe(catchError((error) => {
      console.error('Login failed:', error);
      throw(() => error);
    }))
    .pipe(map((response) => response.token));
  }
}
