import { ErrorInterceptor } from './auth.interceptor'
import { HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http'
import { OAuthService } from 'angular-oauth2-oidc'
import { of, throwError } from 'rxjs'

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor
  let oauthService: jasmine.SpyObj<OAuthService>
  let next: jasmine.SpyObj<HttpHandler>

  beforeEach(() => {
    oauthService = jasmine.createSpyObj('OAuthService', ['logOut'])
    interceptor = new ErrorInterceptor(oauthService)
    next = jasmine.createSpyObj('HttpHandler', ['handle'])
  })

  it('should pass through non-auth requests without error handling', () => {
    const request = new HttpRequest('GET', '/api/data')
    next.handle.and.returnValue(of({} as any))

    interceptor.intercept(request, next).subscribe()

    expect(next.handle).toHaveBeenCalledWith(request)
  })

  it('should add error handling for login requests', (done) => {
    const request = new HttpRequest('GET', '/auth/login')
    next.handle.and.returnValue(of({} as any))

    interceptor.intercept(request, next).subscribe({
      next: () => done(),
    })
  })

  it('should add error handling for token requests', (done) => {
    const request = new HttpRequest('GET', '/auth/token')
    next.handle.and.returnValue(of({} as any))

    interceptor.intercept(request, next).subscribe({
      next: () => done(),
    })
  })

  it('should logout on 401 for login endpoints', (done) => {
    const request = new HttpRequest('GET', '/auth/login')
    const error = new HttpErrorResponse({ status: 401 })
    next.handle.and.returnValue(throwError(() => error))

    interceptor.intercept(request, next).subscribe({
      error: () => {
        expect(oauthService.logOut).toHaveBeenCalled()
        done()
      },
    })
  })

  it('should not logout on non-401 errors', (done) => {
    const request = new HttpRequest('GET', '/auth/token')
    const error = new HttpErrorResponse({ status: 500 })
    next.handle.and.returnValue(throwError(() => error))

    interceptor.intercept(request, next).subscribe({
      error: () => {
        expect(oauthService.logOut).not.toHaveBeenCalled()
        done()
      },
    })
  })

  it('should re-throw the error', (done) => {
    const request = new HttpRequest('GET', '/auth/login')
    const error = new HttpErrorResponse({ status: 403 })
    next.handle.and.returnValue(throwError(() => error))

    interceptor.intercept(request, next).subscribe({
      error: (err) => {
        expect(err.status).toBe(403)
        done()
      },
    })
  })
})
