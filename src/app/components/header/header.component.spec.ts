import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { ShareService } from '../../services/share.service';
import { HttpService } from '../../services/http.service';
import { FormsModule } from '@angular/forms';
import { News } from '../../models/news';
import { of } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockShareService: any;
  let mockHttpService: any;

  const mockNews: News[] = [
    {
      Id: 1,
      Title: 'News 1',
      Url: 'url 1',
      By: 'abc',
      Time: '01-01-1991'
    },
    {
      Id: 2,
      Title: 'News 2',
      Url: 'url 2',
      By: 'pqr',
      Time: '02-02-1992'
    },
    {
      Id: 3,
      Title: 'News 3',
      Url: 'url 3',
      By: 'abc',
      Time: '01-01-1993'
    }
  ];

  beforeEach(() => {
    mockShareService = {
      allNews$: of(mockNews),
      isLoggedIn$: of(false),
      updateNewsSearchResults: jasmine.createSpy('updateNewsSearchResults'),
      triggerReload: jasmine.createSpy('triggerReload')
    };

    mockHttpService = {
      login: jasmine.createSpy('login').and.returnValue(of('mock-token'))
    };

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HeaderComponent // Import standalone HeaderComponent
      ],
      providers: [
        { provide: ShareService, useValue: mockShareService },
        { provide: HttpService, useValue: mockHttpService },
        provideHttpClient(withInterceptorsFromDi()), // Provide HttpClient
        provideHttpClientTesting() // Mock backend for HttpClient
      ]
    });

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize allNews and isLoggedIn signals on ngOnInit', () => {
    expect(component.allNews()).toEqual(mockNews);
    expect(component.isLoggedIn()).toBeFalse();
  });

  it('should filter news items based on searchQuery', () => {
    component.searchQuery.set('news 2');
    component.onSearch();
    expect(mockShareService.updateNewsSearchResults).toHaveBeenCalledWith([
      {
        Id: 2,
        Title: 'News 2',
        Url: 'url 2',
        By: 'pqr',
        Time: '02-02-1992'
      }
    ]);
  });

  it('should call updateNewsSearchResults with empty array for no matches', () => {
    component.searchQuery.set('not found');
    component.onSearch();
    expect(mockShareService.updateNewsSearchResults).toHaveBeenCalledWith([]);
  });

  it('should login, store token, set isLoggedIn true, and trigger reload', () => {
    component.onLogin();
    expect(mockHttpService.login).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe('mock-token');
    expect(component.isLoggedIn()).toBeTrue();
    expect(mockShareService.triggerReload).toHaveBeenCalled();
  });

  it('should logout, clear token, set isLoggedIn false, and trigger reload', () => {
    localStorage.setItem('token', 'dummy-token');
    component.onLogout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(component.isLoggedIn()).toBeFalse();
    expect(mockShareService.triggerReload).toHaveBeenCalled();
  });
});