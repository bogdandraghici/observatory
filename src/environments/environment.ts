// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  debug: {
    ngRouter: false,
    effector: false,
  },
  production: false,
  // Pointed at dev-cls1 / dev-pr2127.
  // To go back to local docker compose, restore:
  // baseUrl: 'http://localhost:8091',
  // platformUrl: 'http://localhost:8092',
  baseUrl: 'https://services.cloud.pr2127.dev1.flowxai.dev/ai-observatory',
  platformUrl: 'https://services.cloud.pr2127.dev1.flowxai.dev/ai-platform',
  playgroundUrl: '',
  defaultNamespace: 'default',
  keycloak: {
    issuer: 'https://auth.cloud.pr2127.dev1.flowxai.dev/auth/realms/00000001-0001-4001-8001-000000000001',
    redirectUri: 'http://localhost:4300/',
    clientId: 'flowx-platform-authenticate',
    responseType: 'code',
    scope: 'openid profile email offline_access',
    requireHttps: 'true',
    showDebugInformation: 'false',
    disableAtHashCheck: 'false',
  }
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
