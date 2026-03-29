
import { Component } from '@angular/core'
import { AppConfigService } from '../../app.config'
import { NgIconsModule } from '@ng-icons/core'
import { Router } from '@angular/router'
import { ButtonModule } from 'primeng/button'

@Component({
    selector: 'quote-section',
    imports: [NgIconsModule, ButtonModule],
    template: `
    <div class="py-6 px-6 lg:px-20 mx-0 my-12 p-6">
      <div class="text-center mb-8">
        <h2 class="text-surface-900 font-normal text-6xl mb-2 mt-8">
          “Keep your eyes on the stars, and your feet on the ground. “
        </h2>
        <span class="text-surface-600 text-2xl">Theodore Roosevelt</span>
      </div>
    </div>
  `
})
export class QuoteSectionComponent {
  constructor(
    private configService: AppConfigService,
    public router: Router,
  ) {}

  get isDarkMode(): any {
    return this.configService.config().darkMode
  }
}
