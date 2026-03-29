import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { MenuItem } from 'primeng/api'
import { AppConfig, MinimalLayoutService } from './service/minimal.layout.service'

import { OAuthService } from 'angular-oauth2-oidc'
import { parseJwt } from '../../landing/utils/utils'

@Component({
    selector: 'minimal-topbar',
    templateUrl: './minimal.topbar.component.html',
    standalone: false
})
export class MinimalTopBarComponent implements OnInit {
  darkMode = false
  items!: MenuItem[]

  @ViewChild('menubutton') menuButton!: ElementRef

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef

  @ViewChild('topbarmenu') menu!: ElementRef



  userProfile

  constructor(
    public layoutService: MinimalLayoutService,
    private oauthService: OAuthService,
  ) {
  }
  ngOnInit(): void {
    const jwt = this.oauthService.authorizationHeader().split('Bearer ')[1]
    this.userProfile = parseJwt<any>(jwt)
    this.darkMode = this.layoutService.config().colorScheme === 'dark'
  }

  changeTheme(_____event: any): void {
    if (this.darkMode) {
      this.setLightTheme()
      this.darkMode = false
    } else {
      this.setDarkTheme()
      this.darkMode = true
    }
  }

  setLightTheme(): void {
    // optional configuration with the default configuration
    const config: AppConfig = {
      ripple: true, // toggles ripple on and off
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
      colorScheme: 'dark', // color scheme of the template, valid values are "light" and "dark"
      theme: 'flowx-dark-compact', // default component theme for PrimeNG
      scale: 13, // size of the body font size to scale the whole application
    }
    this.layoutService.config.set(config)

  }
}
