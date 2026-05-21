import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { AppTopBarComponent } from '../topbar/app.topbar.component'
import { FooterSectionComponent } from '../footersection.component'
import { AppConfigService } from '../../../app.config'

@Component({
  selector: 'feature-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AppTopBarComponent, FooterSectionComponent],
  template: `
    <div class="landing-wrapper" [ngClass]="landingClass">
      <app-topbar (darkModeSwitch)="toggleDarkMode()"></app-topbar>
      <router-outlet></router-outlet>
      <footer-section [isDarkMode]="isDarkMode"></footer-section>
    </div>
  `,
  styles: [`
    .landing-wrapper {
      min-height: 100vh;
      overflow-x: hidden;
      transition: background-color 300ms ease, color 300ms ease;

      &.layout-dark {
        background: #090909;
        color: #ffffff;
      }

      &.layout-light {
        background: #ffffff;
        color: #111827;
      }
    }
  `]
})
export class FeatureLayoutComponent implements OnInit {

  constructor(private configService: AppConfigService) {}

  get isDarkMode(): boolean {
    return this.configService.config().darkMode
  }

  get landingClass(): any {
    return {
      'layout-dark': this.isDarkMode,
      'layout-light': !this.isDarkMode,
    }
  }

  ngOnInit(): void {
    this.configService.config.update(c => ({ ...c, darkMode: true }))
  }

  toggleDarkMode(): void {
    const newDark = !this.isDarkMode
    this.configService.config.update(c => ({ ...c, darkMode: newDark }))
  }
}
