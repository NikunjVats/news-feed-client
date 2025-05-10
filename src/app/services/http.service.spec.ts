import { TestBed } from '@angular/core/testing';
import { HttpService } from './http.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { News } from '../models/news';

// Mock Constants to match constants.ts
const mockConstants = {
  NewsLimit: 200,
  BaseURL: 'http://localhost:5264/NewsFeed/'
};

describe('HttpService', () => {
  let service: HttpService;
  let httpTestingController: HttpTestingController;

  const mockNews: News[] = [
    { Id: 1, Title: 'News 1', Url: 'url1', By: 'user1', Time: '01-01-2021' },
    { Id: 2, Title: 'News 2', Url: 'url2', By: 'user2', Time: '02-02-2021' }
  ];

  const mockToken = 'mock-jwt-token';
  const baseURL = mockConstants.BaseURL;
  const newsLimit = mockConstants.NewsLimit;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(HttpService);
    // Manually set baseURL to mock Constants.BaseURL
    service.baseURL = mockConstants.BaseURL;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no unmatched HTTP requests are pending
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNewsFeed', () => {
    it('should fetch news feed with correct URL and limit', () => {
      service.getNewsFeed(newsLimit).subscribe({
        next: (news) => {
          expect(news).toEqual(mockNews);
        }
      });

      const req = httpTestingController.expectOne(`${baseURL}GetLatestNews/${newsLimit}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockNews);
    });

    it('should handle HTTP error for getNewsFeed', () => {
      const errorResponse = { status: 500, statusText: 'Server Error' };

      service.getNewsFeed(newsLimit).subscribe({
        next: () => fail('Expected error, but got success'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Server Error');
        }
      });

      const req = httpTestingController.expectOne(`${baseURL}GetLatestNews/${newsLimit}`);
      req.flush('Error', errorResponse);
    });

    it('should use provided limit for news feed request', () => {
      const customLimit = 50;

      service.getNewsFeed(customLimit).subscribe({
        next: (news) => {
          expect(news).toEqual(mockNews);
        }
      });

      const req = httpTestingController.expectOne(`${baseURL}GetLatestNews/${customLimit}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockNews);
    });
  });

  describe('login', () => {
    it('should send login POST request and return token', () => {
      service.login().subscribe({
        next: (token) => {
          expect(token).toBe(mockToken);
        }
      });

      const req = httpTestingController.expectOne(`${baseURL}Login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ Name: 'default' });
      req.flush({ token: mockToken });
    });

    it('should handle login error and throw error', () => {
      const errorResponse = { status: 401, statusText: 'Unauthorized' };

      service.login().subscribe({
        next: () => fail('Expected error, but got success'),
        error: (errorFn) => {
          // Invoke the thrown function to get the actual error
          const error = errorFn();
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
        }
      });

      const req = httpTestingController.expectOne(`${baseURL}Login`);
      req.flush('Unauthorized', errorResponse);
    });

    it('should log error to console on login failure', () => {
      spyOn(console, 'error');
      const errorResponse = { status: 401, statusText: 'Unauthorized' };

      service.login().subscribe({
        next: () => fail('Expected error, but got success'),
        error: () => {
          expect(console.error).toHaveBeenCalledWith('Login failed:', jasmine.any(Object));
        }
      });

      const req = httpTestingController.expectOne(`${baseURL}Login`);
      req.flush('Unauthorized', errorResponse);
    });
  });
});