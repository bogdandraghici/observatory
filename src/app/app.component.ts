import { Component } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { filter } from 'rxjs/operators'
import { AppConfig, LayoutService } from './layout/full-layout/service/app.layout.service'
import { AppConfigService } from './app.config'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false
})
export class AppComponent {
  public forcedTheme: string | undefined
  constructor(
    private layoutService: LayoutService,
    private readonly appConfigService: AppConfigService,
    private readonly router: Router,
  ) {
    // Theme resolution order on startup:
    //   1. localStorage override — what the user picked last time via the
    //      topbar toggle. Always wins.
    //   2. `prefers-color-scheme: dark` — operating system preference.
    //   3. Default light.
    const stored = appConfigService.getStoredTheme()
    if (stored) {
      appConfigService.forceTheme(stored)
    } else if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      appConfigService.forceTheme('dark')
    }
    this.appConfigService.forcedTheme$.subscribe({
      next: (theme) => {
        if ((theme === 'dark')) {
          this.setDarkTheme()
        } else
        {
          this.setLightTheme()
        }
      },
    })
    // Safety net for stuck body scroll locks. PrimeNG drawers / dialogs
    // add `p-overflow-hidden` (and a few legacy variants) to `body` when
    // they open with blockScroll/modal. If the component unmounts while
    // closing (route change, fast nav, error), the class can stick and
    // the whole page stops scrolling until refresh. Clear it on every
    // navigation as a backstop — the drawers we control also pass
    // `[blockScroll]=false` now, so this only fires for stragglers.
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        const body = document.body
        if (!body) {
          return
        }
        body.classList.remove(
          'p-overflow-hidden',
          'p-overlay-mask',
          'p-overlay-mask-leave',
        )
        // Clear any inline overflow lock the SDK sets directly on body.
        if (body.style.overflow === 'hidden') {
          body.style.overflow = ''
        }
        // Same defensive sweep on the html root — PrimeNG has set it
        // there in some versions.
        const html = document.documentElement
        if (html?.style.overflow === 'hidden') {
          html.style.overflow = ''
        }
      })
  }

  setLightTheme(): void {
    // optional configuration with the default configuration
    const config: AppConfig = {
      ripple: true, // toggles ripple on and off
      inputStyle: 'outlined', // default style for input elements
      menuMode: 'static', // layout mode of the menu, valid values are "static" and "overlay"
      colorScheme: 'light', // color scheme of the template, valid values are "light" and "dark"
      theme: 'flowx-light', // default component theme for PrimeNG
      scale: 13, // size of the body font size to scale the whole application
    }
    this.layoutService.config.set(config)
  }

  setDarkTheme(): void {
    // optional configuration with the default configuration
    const config: AppConfig = {
      ripple: true, // toggles ripple on and off
      inputStyle: 'outlined', // default style for input elements
      menuMode: 'static', // layout mode of the menu, valid values are "static" and "overlay"
      colorScheme: 'dark', // color scheme of the template, valid values are "light" and "dark"
      theme: 'flowx-dark', // default component theme for PrimeNG
      scale: 13, // size of the body font size to scale the whole application
    }
    this.layoutService.config.set(config)

  }
}
