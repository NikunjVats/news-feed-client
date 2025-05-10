import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { News } from '../models/news';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  constructor() { }

  private allNewsShared = new BehaviorSubject<News[] | undefined>(undefined);
  allNews$ = this.allNewsShared.asObservable();
  updateAllNews(data : News[]) {
    this.allNewsShared.next(data);
  }

  private newsSearchResultsShared = new BehaviorSubject<News[] | undefined>(undefined);
  newsSearchResults$ = this.newsSearchResultsShared.asObservable();
  updateNewsSearchResults(data : News[]) {
    this.newsSearchResultsShared.next(data);
  }

  private reloadSubject = new Subject<void>();
  reload$ = this.reloadSubject.asObservable();
  triggerReload() {
    this.reloadSubject.next();
  }

  private isLoggedIn = new Subject<boolean>();
  isLoggedIn$ = this.isLoggedIn.asObservable();
  LoggedIn(data : boolean) {
    this.isLoggedIn.next(data);
  }
}
