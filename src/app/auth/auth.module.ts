import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { APP_INITIALIZER, NgModule } from '@angular/core'

import { AuthConfig, OAuthModule } from 'angular-oauth2-oidc'



import { AuthConfigService } from './auth.service'


import { OAuthModuleConfig, authConfig } from './auth.config'

import { environment } from '../../environments/environment'

export function init_app(
  authConfigService: AuthConfigService
): () => Promise<any> {
  return () =>
    authConfigService.initAuth().then(() => {
    })
}

@NgModule({ imports: [OAuthModule.forRoot({
            resourceServer: {
                customUrlValidation: (url: string) => url.startsWith(`${environment.baseUrl}`),
                sendAccessToken: true,
            },
        })], providers: [
        AuthConfigService,
        { provide: AuthConfig, useValue: authConfig },
        OAuthModuleConfig,
        {
            provide: APP_INITIALIZER,
            useFactory: init_app,
            deps: [AuthConfigService],
            multi: true,
        },
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AuthConfigModule {}
