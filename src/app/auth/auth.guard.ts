import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'
import { AuthConfigService } from './auth.service'

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthConfigService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated) {
      return true
    }
    // Redirect to Keycloak login
    this.authService.login()
    return false
  }
}
