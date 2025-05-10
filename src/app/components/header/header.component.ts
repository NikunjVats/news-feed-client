import { Component, inject, OnInit, signal } from '@angular/core';
import { ShareService } from '../../services/share.service';
import { FormsModule } from "@angular/forms";
import { News } from '../../models/news';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-header',
  imports: [FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{

  shareService = inject(ShareService);
  httpService = inject(HttpService);
  allNews = signal<News[] | undefined>(undefined);
  searchQuery = signal<string>('');
  isLoggedIn = signal<boolean>(false);
  ngOnInit(): void {
    this.shareService.allNews$.subscribe(data =>
      this.allNews.set(data)
    )
    this.shareService.isLoggedIn$.subscribe(data => this.isLoggedIn.set(data));
  }
  onSearch() {
    var seachedNews = this.allNews()?.filter(newsItem => {
      return newsItem.Title.toLowerCase().includes(this.searchQuery().toLowerCase());
    })
    if (seachedNews){
      this.shareService.updateNewsSearchResults(seachedNews);
    }
  }

  onLogin() {
    this.httpService.login().subscribe({
      next : (result) => {
        localStorage.setItem("token", result);
        this.isLoggedIn.set(true);
        this.shareService.triggerReload();
      }
    });
  }

  onLogout() {
    localStorage.removeItem("token");
    this.isLoggedIn.set(false);
    this.shareService.triggerReload();
  }
}
