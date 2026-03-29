
import { Component } from '@angular/core'
import { AppConfigService } from '../../app.config'
import { NgIconsModule } from '@ng-icons/core'
import { Router } from '@angular/router'
import { ButtonModule } from 'primeng/button'

@Component({
    selector: 'works-section',
    imports: [NgIconsModule, ButtonModule],
    template: `
    <section class="landing-templates theme-dark">
      <div id="works" class="landing-works py-6 px-6 lg:px-20 mx-0 my-0 p-6">
        <div
          class="grid grid-cols-12 mt-20 pb-2 md:pb-20"
          style="
          height: 90vh;
          min-height: 600px;
          align-items: center;
          justify-content: center;
        "
        >
          <div
            class="col-span-12 text-surface-700 text-gray-600  lg:px-20 flex flex-col lg:items-center text-center lg:text-left"
          >
            <h2
              class="line-height-1 text-surface-700 text-gray-600 section-header  font-bold ml-0 md:ml-2 mb-12"
            >
            <span class="text-primary-500">HOW IT WORKS</span>
            </h2>

            <span class="text-surface-700 text-gray-600 section-content line-height-3 ml-0 md:ml-2 mb-4"
              ><b
                >Welcome to Observatory-X, your all-seeing observatory for AI
                agents.</b
              >
              <br /><br />Just as Ursa Minor's stars illuminate the night sky,
              Observatory-X shines a light on your AI ecosystem. <br /><br />
              With its powerful Python-based library installed in each AI agent,
              Observatory-X offers real-time logging, advanced analytics, usage
              reports, and proactive alerts. <br />
              Like an astronomer studying the stars, Observatory-X empowers you
              to observe and understand the behavior of your AI agents,
              providing unparalleled visibility and insight into their
              activities.<br /><br />
              Step into a world of discovery with Observatory-X and unlock the
              full potential of your AI constellation.</span
            >
          </div>
          <div
            class="flex justify-center col-span-12   p-1 flex-order-1 lg:flex-order-0 lg:px-20"
          >
            <div class="card bg-white/90" style="border-radius: 12px">
              <img
                src="assets/landing/ai-agents.svg"
                class="w-11"
                alt="mockup mobile"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class WorksSectionComponent {
  constructor(
    private configService: AppConfigService,
    public router: Router,
  ) {}

  get isDarkMode(): any {
    return this.configService.config().darkMode
  }
}
