import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'

@Component({
    selector: 'debug-section',
    imports: [CommonModule],
    template: `
    <section class="landing-templates theme-dark">
      <div id="debug" class=" py-6 px-6 lg:px-20 mx-0 p-6">
        <div
          class="grid grid-cols-12 mt-20 pb-2 md:pb-20"
          style="
          align-items: center;
          justify-content: center;
        "
        >
          <div
            class="col-span-12 text-surface-700  lg:px-20 flex flex-col lg:items-center text-center lg:text-left"
          >
            <h2
              class="line-height-1 text-surface-700 section-header  font-bold ml-0 md:ml-2 mb-12"
            >
            <span class="text-primary-500">DEBUG</span>
            </h2>

            <span
              class="text-surface-700 section-content line-height-3 ml-0 md:ml-2 mb-4"
              ><b>
                Unexpected results happen all the time. With full visibility
                into the entire chain sequence of calls, you can spot the source
                of errors and surprises in real-time with surgical precision.
                When your LLM starts throwing curveballs instead of answers, you
                don't just want to sit there catching them.</b
              >
              <br /><br />
              With FlowX Observatory, you can roll up your sleeves and play
              detective. We use the debugging tools to dive into perplexing
              agent loops, frustratingly slow chains, and to scrutinize prompts
              like they're suspects in a lineup.</span
            >
          </div>
        </div>
        <div class="flex justify-center mt-6 relative z-[3]">
          <a
            href="/docs/debug"
            class="font-semibold p-4 rounded flex items-center linkbox active"
            style="z-index: 99"
          >
            <span>Explore All DEBUG Features</span>
            <i class="pi pi-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
      <section
        class="templates templates-animation flex justify-center items-center flex-col mt-16"
      >
        <div class="flex md:flex-row flex-col gap-6 lg:gap-0">
          <div
            class="template-block block-1 mr-2 lg:mb-0 flex justify-center items-center"
            [ngStyle]="{
              'background-image': isDarkMode
                ? 'url(/assets/landing/images/1-llm-calls-dark.png)'
                : 'url(/assets/landing/images/1-llm-calls-light.png)'
            }"
            [style]="{ 'background-size': 'cover' }"
          >
            <a
              class="templates-btn"
              href="#"
              target="_blank"
              >LLM Calls</a
            >
          </div>
          <div
            class="template-block block-2 ml-2 flex justify-center items-center"
            [ngStyle]="{
              'background-image': isDarkMode
                ? 'url(/assets/landing/images/1-traces-dark.png)'
                : 'url(/assets/landing/images/1-traces-light.png)'
            }"
            [style]="{ 'background-size': 'cover' }"
          >
            <a
              class="templates-btn"
              href="#"
              target="_blank"
              >Traces</a
            >
          </div>
        </div>
        <div
          class="flex my-6 md:flex-row flex-col gap-6 lg:gap-0 items-center"
        >
          <div
            class="template-block block-3 mr-2 lg:mb-0 flex justify-center items-center"
            [ngStyle]="{
              'background-image': isDarkMode
                ? 'url(/assets/landing/images/1-analytics-dark.png)'
                : 'url(/assets/landing/images/1-analytics-light.png)'
            }"
            [style]="{ 'background-size': 'cover' }"
          >
            <a
              class="templates-btn"
              href="#"
              target="_blank"
              >Analytics</a
            >
          </div>
          <img
            class="template-block block-middle border-none box-shadow-none mr-2 hidden lg:flex justify-center items-center flex-col"
            [style]="{ height: '100%' }"
            [src]="
              isDarkMode
                ? '/assets/landing/images/debug_dark.png'
                : '/assets/landing/images/debug_light.png'
            "
          />
          <div
            class="template-block block-5 mr-2 flex justify-center items-center"
            [ngStyle]="{
              'background-image': isDarkMode
                ? 'url(/assets/landing/images/1-home-dark.png)'
                : 'url(/assets/landing/images/1-home-light.png)'
            }"
            [style]="{ 'background-size': 'cover' }"
          >
            <a
              class="templates-btn"
              href="#"
              target="_blank"
              >App Management</a
            >
          </div>
        </div>
        <div class="flex md:flex-row flex-col gap-6 lg:gap-0">
          <div
            class="template-block block-5 mr-2 lg:mb-0 flex justify-center items-center"
            [ngStyle]="{
              'background-image': isDarkMode
                ? 'url(/assets/landing/images/1-feedbacks-dark.png)'
                : 'url(/assets/landing/images/1-feedbacks-light.png)'
            }"
            [style]="{ 'background-size': 'cover' }"
          >
            <a
              class="templates-btn"
              href="#"
              target="_blank"
              >Feedbacks</a
            >
          </div>
          <div
            class="template-block block-5 mr-2 flex justify-center items-center"
            [ngStyle]="{
              'background-image': isDarkMode
                ? 'url(/assets/landing/images/1-details-dark.png)'
                : 'url(/assets/landing/images/1-details-light.png)'
            }"
            [style]="{ 'background-size': 'cover' }"
          >
            <a
              class="templates-btn"
              href="#"
              target="_blank"
              >Debug LLM Call</a
            >
          </div>
        </div>
        <div class="lines">
          <div class="top">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="left">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>
    </section>
  `
})
export class DebugSectionComponent {
  @Input() isDarkMode: boolean
}
