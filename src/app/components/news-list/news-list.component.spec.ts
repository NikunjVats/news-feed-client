import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsListComponent } from './news-list.component';
import { ShareService } from '../../services/share.service';
import { HttpService } from '../../services/http.service';
import { News } from '../../models/news';
import { of, Subject, throwError } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Constants } from '../../constants';

describe('NewsListComponent', () => {
  let component: NewsListComponent;
  let fixture: ComponentFixture<NewsListComponent>;
  let mockShareService: any;
  let mockHttpService: any;
  let reloadSubject: Subject<void>;
  let newsSearchResultsSubject: Subject<News[]>;

  const mockNews: News[] = [
    { Id: 1, Title: 'News 1', Url: 'url1', By: 'user1', Time: '01-01-2021' },
    { Id: 2, Title: 'News 2', Url: 'url2', By: 'user2', Time: '02-02-2021' },
    { Id: 3, Title: 'News 3', Url: 'url3', By: 'user3', Time: '03-03-2021' },
    { Id: 4, Title: 'News 4', Url: 'url4', By: 'user4', Time: '04-04-2021' },
    { Id: 5, Title: 'News 5', Url: 'url5', By: 'user5', Time: '05-05-2021' },
    { Id: 6, Title: 'News 6', Url: 'url6', By: 'user6', Time: '06-06-2021' },
    { Id: 7, Title: 'News 7', Url: 'url7', By: 'user7', Time: '07-07-2021' }
  ];

  beforeEach(() => {
    reloadSubject = new Subject<void>();
    newsSearchResultsSubject = new Subject<News[]>();

    mockShareService = {
      reload$: reloadSubject.asObservable(),
      newsSearchResults$: newsSearchResultsSubject.asObservable(),
      updateAllNews: jasmine.createSpy('updateAllNews'),
      updateNewsSearchResults: jasmine.createSpy('updateNewsSearchResults'),
      LoggedIn: jasmine.createSpy('LoggedIn')
    };

    mockHttpService = {
      getNewsFeed: jasmine.createSpy('getNewsFeed').and.returnValue(of(mockNews))
    };

    TestBed.configureTestingModule({
      imports: [NewsListComponent],
      providers: [
        { provide: ShareService, useValue: mockShareService },
        { provide: HttpService, useValue: mockHttpService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    fixture = TestBed.createComponent(NewsListComponent);
    component = fixture.componentInstance;
    // Initialize newsSearchResults before detectChanges to ensure consistent state
    component.newsSearchResults.set(mockNews);
    component.getNewsPage(); // Ensure initial page is set
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and load news on ngOnInit', () => {
    // Reset mocks to test ngOnInit specifically
    mockHttpService.getNewsFeed.calls.reset();
    mockShareService.updateAllNews.calls.reset();
    mockShareService.updateNewsSearchResults.calls.reset();
    mockShareService.LoggedIn.calls.reset();

    component.ngOnInit();
    fixture.detectChanges();

    expect(mockHttpService.getNewsFeed).toHaveBeenCalledWith(Constants.NewsLimit);
    expect(mockShareService.updateAllNews).toHaveBeenCalledWith(mockNews);
    expect(mockShareService.updateNewsSearchResults).toHaveBeenCalledWith(mockNews);
    expect(component.newsListToShow()).toEqual(mockNews.slice(0, 6));
    expect(component.totalPages).toBe(2);
    expect(component.isLoading()).toBeFalse();
    expect(component.errorMessage()).toBe('');
    expect(mockShareService.LoggedIn).toHaveBeenCalledWith(true);
  });

  it('should handle 401 error and set error message', () => {
    mockHttpService.getNewsFeed.and.returnValue(throwError(() => ({ status: 401 })));
    component.LoadNews();
    expect(component.errorMessage()).toBe('Please Login to view News!');
    expect(mockShareService.updateAllNews).toHaveBeenCalledWith([]);
    expect(mockShareService.updateNewsSearchResults).toHaveBeenCalledWith([]);
    expect(component.isLoading()).toBeFalse();
    expect(mockShareService.LoggedIn).toHaveBeenCalledWith(false);
  });

  it('should handle non-401 error and set generic error message', () => {
    mockHttpService.getNewsFeed.and.returnValue(throwError(() => ({ status: 500 })));
    component.LoadNews();
    expect(component.errorMessage()).toBe('Failed to load stories. Please try again later.');
    expect(mockShareService.updateAllNews).toHaveBeenCalledWith([]);
    expect(mockShareService.updateNewsSearchResults).toHaveBeenCalledWith([]);
    expect(component.isLoading()).toBeFalse();
  });

  it('should reload news when reload$ emits', () => {
    spyOn(component, 'LoadNews').and.callThrough();
    reloadSubject.next();
    expect(component.LoadNews).toHaveBeenCalled();
  });

  it('should update newsSearchResults and reset page when newsSearchResults$ emits', () => {
    const filteredNews = mockNews.slice(0, 3);
    newsSearchResultsSubject.next(filteredNews);
    expect(component.newsSearchResults()).toEqual(filteredNews);
    expect(component.page()).toBe(1);
    expect(component.newsListToShow()).toEqual(filteredNews);
    expect(component.totalPages).toBe(1);
  });

  it('should navigate to next page and update newsListToShow', () => {
    component.nextPage();
    expect(component.page()).toBe(2);
    expect(component.newsListToShow()).toEqual(mockNews.slice(6, 7));
    expect(component.totalPages).toBe(2);
  });

  it('should navigate to previous page and update newsListToShow', () => {
    // Set to page 2
    component.page.set(2);
    component.getNewsPage(); // Ensure newsListToShow is updated for page 2
    expect(component.page()).toBe(2);
    expect(component.newsListToShow()).toEqual(mockNews.slice(6, 7));

    // Navigate to previous page
    component.prevPage();
    expect(component.page()).toBe(1);
    expect(component.newsListToShow()).toEqual(mockNews.slice(0, 6));
  });

  it('should unsubscribe from subscriptions on ngOnDestroy', () => {
    spyOn(component.subscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.subscription.unsubscribe).toHaveBeenCalled();
  });
});