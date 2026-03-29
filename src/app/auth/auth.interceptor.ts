import { Injectable } from '@angular/core'

import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http'

import { catchError } from 'rxjs/operators'
import { Observable, throwError } from 'rxjs'

import { OAuthService } from 'angular-oauth2-oidc'

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private oAuthService: OAuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const url = request.url.toLowerCase()
    if (!url.includes('login') && !url.includes('token')) {
      return next.handle(request)
    }
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.warn(error)
        if (error.status === 401) {
          this.oAuthService.logOut()
        }

        return throwError(error)
      })
    )
  }
}
