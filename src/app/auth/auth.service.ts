import { Injectable } from '@angular/core'
import { AuthConfig, NullValidationHandler, OAuthService } from 'angular-oauth2-oidc'
import { filter } from 'rxjs/operators'


@Injectable()
export class AuthConfigService {
  private _decodedAccessToken: any
  private _decodedIDToken: any
  get decodedAccessToken(): any {
    return this._decodedAccessToken
  }
  get decodedIDToken(): any {
    return this._decodedIDToken
  }

  constructor(
    private readonly oauthService: OAuthService,
    private readonly authConfig: AuthConfig
  ) {}

  async initAuth(): Promise<any> {
    return new Promise<void>((resolveFn) => {
      // setup oauthService
      this.oauthService.configure(this.authConfig)
      this.oauthService.setStorage(localStorage)
      this.oauthService.tokenValidationHandler = new NullValidationHandler()

      // subscribe to token events
      this.oauthService.events
        .pipe(
          filter((e: any) => e.type === 'token_received')
        )
        .subscribe(() => this.handleNewToken())

      // Try to login but don't block the app if not authenticated
      // Landing page should be accessible without auth
      this.oauthService.loadDiscoveryDocumentAndTryLogin().then((isLoggedIn) => {
        if (isLoggedIn && this.oauthService.hasValidAccessToken()) {
          this.oauthService.setupAutomaticSilentRefresh()
        }
        resolveFn()
      }).catch(() => {
        // Discovery or login failed — still allow the app to load (landing page)
        resolveFn()
      })
    })
  }

  get isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken()
  }

  login(): void {
    this.oauthService.initCodeFlow()
  }

  private handleNewToken(): void {
    this._decodedAccessToken = this.oauthService.getAccessToken()
    this._decodedIDToken = this.oauthService.getIdToken()
  }
}
