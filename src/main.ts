import { enableProdMode, provideZoneChangeDetection } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { providePrimeNG } from 'primeng/config'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

import { AppModule } from './app/app.module'
import { environment } from './environments/environment'

// FlowX.AI brand color palette
const FlowXPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{amber.50}',
      100: '{amber.100}',
      200: '{amber.200}',
      300: '{amber.300}',
      400: '#fdb913',
      500: '#fdb913',
      600: '#e5a711',
      700: '#cc950f',
      800: '#b3830d',
      900: '#99710b',
      950: '#805f09'
    },
    colorScheme: {
      light: {
        primary: {
          color: '#fdb913',
          inverseColor: '#090909',
          hoverColor: '#e5a711',
          activeColor: '#cc950f'
        },
        highlight: {
          background: 'rgba(253, 185, 19, 0.16)',
          focusBackground: 'rgba(253, 185, 19, 0.24)',
          color: '#fdb913',
          focusColor: '#cc950f'
        },
        surface: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
          950: '#121212'
        }
      },
      dark: {
        primary: {
          color: '#fdb913',
          inverseColor: '#090909',
          hoverColor: '#ffe066',
          activeColor: '#ffd633'
        },
        highlight: {
          background: 'rgba(253, 185, 19, 0.16)',
          focusBackground: 'rgba(253, 185, 19, 0.24)',
          color: '#fdb913',
          focusColor: '#ffe066'
        },
        surface: {
          0: '#f5f5f5',
          50: '#dddddd',
          100: '#bbbbbb',
          200: '#999999',
          300: '#6d6d6d',
          400: '#8a8a8a',
          500: '#333333',
          600: '#252525',
          700: '#1a1721',
          800: '#141517',
          900: '#0d0d0d',
          950: '#090909'
        }
      }
    }
  }
})

if (environment.production) {
  enableProdMode()
}

platformBrowserDynamic().bootstrapModule(AppModule, {
  applicationProviders: [
    provideZoneChangeDetection(),
    providePrimeNG({
      theme: {
        preset: FlowXPreset,
        options: {
          darkModeSelector: '.flowx-dark'
        }
      },
      ripple: true
    })
  ],
})
  .catch(err => console.error(err))
