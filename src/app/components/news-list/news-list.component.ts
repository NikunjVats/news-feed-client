import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ShareService } from '../../services/share.service';
import { News } from '../../models/news';
import { catchError, of, Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { Constants } from '../../constants';

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.css'
})
export class NewsListComponent implements OnInit, OnDestroy{
  shareService = inject(ShareService);
  httpService = inject(HttpService);
  newsListToShow = signal<News[]>([]);
  newsSearchResults = signal<News[]>([]);
  page = signal(1);
  newsPerPage: number = 6;
  totalPages: number = 1;
  isLoading = signal(true);
  errorMessage = signal('');
  subscription : Subscription = new Subscription();
  
  ngOnInit(): void {
    this.shareService.reload$.subscribe(() => this.LoadNews());
    this.shareService.newsSearchResults$.subscribe(data => {
      this.newsSearchResults.set(data!);
      this.page.set(1);
      this.getNewsPage();
    });
    this.LoadNews();
  }

  LoadNews() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.subscription = this.httpService.getNewsFeed(Constants.NewsLimit).subscribe({
      next: (result) => {
        this.shareService.updateAllNews(result);
        this.shareService.updateNewsSearchResults(result);
        this.isLoading.set(false);
        this.shareService.LoggedIn(true);
      },
      error: (error) => {
        if(error.status === 401) {
          this.errorMessage.set('Please Login to view News!');
          this.shareService.LoggedIn(false);
        } else {
          this.errorMessage.set('Failed to load stories. Please try again later.');
        }
        
        this.shareService.updateAllNews([]);
        this.shareService.updateNewsSearchResults([]);
        this.isLoading.set(false);
      }
    });
  }

  getNewsPage(){
    this.newsListToShow.set(this.newsSearchResults().slice((this.page() - 1) * this.newsPerPage, this.page() * this.newsPerPage));
    this.totalPages = Math.ceil(this.newsSearchResults().length / this.newsPerPage);
  }


  nextPage() {
    this.page.update(value => ++value);
    this.getNewsPage();
  }

  prevPage() {
    this.page.update(value => --value);
    this.getNewsPage();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
