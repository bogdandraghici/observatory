import { enableProdMode, provideZoneChangeDetection } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { providePrimeNG } from 'primeng/config'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

import { AppModule } from './app/app.module'
import { environment } from './environments/environment'

// FlowX Design System — PrimeNG preset (colors.json palettes)
const FlowXPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#e6f0fb',
      100: '#b0d1f3',
      200: '#8abbed',
      300: '#549ce5',
      400: '#3389e0',
      500: '#006bd8',
      600: '#005fc0',
      700: '#004c99',
      800: '#003b77',
      900: '#002d5b',
      950: '#001a35'
    },
    colorScheme: {
      light: {
        primary: {
          color: '#006bd8',
          inverseColor: '#ffffff',
          hoverColor: '#005fc0',
          activeColor: '#004c99'
        },
        highlight: {
          background: 'rgba(0, 107, 216, 0.10)',
          focusBackground: 'rgba(0, 107, 216, 0.18)',
          color: '#004c99',
          focusColor: '#003b77'
        },
        surface: {
          0:   '#ffffff',
          50:  '#f7f8f9',
          100: '#e3e8ed',
          200: '#cbd1db',
          300: '#a6b0be',
          400: '#8390a2',
          500: '#64748b',
          600: '#5b6a7e',
          700: '#475263',
          800: '#2a313a',
          900: '#1d232c',
          950: '#0f1318'
        }
      },
      dark: {
        primary: {
          color: '#3389e0',
          inverseColor: '#ffffff',
          hoverColor: '#549ce5',
          activeColor: '#8abbed'
        },
        highlight: {
          background: 'rgba(51, 137, 224, 0.18)',
          focusBackground: 'rgba(51, 137, 224, 0.28)',
          color: '#8abbed',
          focusColor: '#b0d1f3'
        },
        surface: {
          0:   '#f7f8f9',
          50:  '#cbd1db',
          100: '#a6b0be',
          200: '#8390a2',
          300: '#64748b',
          400: '#5b6a7e',
          500: '#475263',
          600: '#2a313a',
          700: '#1d232c',
          800: '#161b22',
          900: '#0f1318',
          950: '#000000'
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
