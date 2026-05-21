import { AuthConfigService } from './auth.service'
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc'
import { Subject } from 'rxjs'

describe('AuthConfigService', () => {
  let service: AuthConfigService
  let oauthService: jasmine.SpyObj<OAuthService>
  let authConfig: AuthConfig
  let eventsSubject: Subject<any>

  beforeEach(() => {
    eventsSubject = new Subject()
    oauthService = jasmine.createSpyObj('OAuthService', [
      'configure',
      'setStorage',
      'loadDiscoveryDocumentAndTryLogin',
      'setupAutomaticSilentRefresh',
      'hasValidAccessToken',
      'getAccessToken',
      'getIdToken',
      'initCodeFlow',
    ], {
      events: eventsSubject.asObservable(),
      tokenValidationHandler: null,
    })

    authConfig = {
      issuer: 'https://auth.example.com',
      clientId: 'test-client',
    }

    service = new AuthConfigService(oauthService, authConfig)
  })

  describe('initAuth', () => {
    it('should configure oauth service', async () => {
      oauthService.loadDiscoveryDocumentAndTryLogin.and.resolveTo(false)

      await service.initAuth()

      expect(oauthService.configure).toHaveBeenCalledWith(authConfig)
      expect(oauthService.setStorage).toHaveBeenCalledWith(localStorage)
    })

    it('should setup silent refresh when logged in', async () => {
      oauthService.loadDiscoveryDocumentAndTryLogin.and.resolveTo(true)
      oauthService.hasValidAccessToken.and.returnValue(true)

      await service.initAuth()

      expect(oauthService.setupAutomaticSilentRefresh).toHaveBeenCalled()
    })

    it('should not setup silent refresh when not logged in', async () => {
      oauthService.loadDiscoveryDocumentAndTryLogin.and.resolveTo(false)

      await service.initAuth()

      expect(oauthService.setupAutomaticSilentRefresh).not.toHaveBeenCalled()
    })

    it('should resolve even on discovery failure', async () => {
      oauthService.loadDiscoveryDocumentAndTryLogin.and.rejectWith(new Error('Discovery failed'))

      await expectAsync(service.initAuth()).toBeResolved()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when token is valid', () => {
      oauthService.hasValidAccessToken.and.returnValue(true)
      expect(service.isAuthenticated).toBe(true)
    })

    it('should return false when token is invalid', () => {
      oauthService.hasValidAccessToken.and.returnValue(false)
      expect(service.isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('should initiate code flow', () => {
      service.login()
      expect(oauthService.initCodeFlow).toHaveBeenCalled()
    })
  })

  describe('token handling', () => {
    it('should update tokens on token_received event', async () => {
      oauthService.loadDiscoveryDocumentAndTryLogin.and.resolveTo(false)
      oauthService.getAccessToken.and.returnValue('new-access-token')
      oauthService.getIdToken.and.returnValue('new-id-token')

      await service.initAuth()

      // Simulate token received event
      eventsSubject.next({ type: 'token_received' })

      expect(service.decodedAccessToken).toBe('new-access-token')
      expect(service.decodedIDToken).toBe('new-id-token')
    })

    it('should not update tokens for other event types', async () => {
      oauthService.loadDiscoveryDocumentAndTryLogin.and.resolveTo(false)

      await service.initAuth()

      eventsSubject.next({ type: 'discovery_document_loaded' })

      expect(service.decodedAccessToken).toBeUndefined()
    })
  })
})
