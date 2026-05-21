import { Component } from '@angular/core'
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
    private readonly appConfigService: AppConfigService
  ) {
    if (
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
