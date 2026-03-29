import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'

@Component({
    selector: 'evaluation-section',
    imports: [CommonModule],
    template: `
    <section class="landing-templates theme-dark">
      <div id="evaluation" class=" py-6 px-6 lg:px-20 mx-0 p-6">
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
              <span>TEST &</span>
              <span class="text-primary-500"> EVALUATE</span>
            </h2>

            <span
              class="text-surface-700 section-content line-height-3 ml-0 md:ml-2 mb-4"
              ><b>
                Software engineering relies on unit testing to build performant,
                production-ready applications. FlowX Observatory provides that
                same functionality for LLM applications. Spin up test datasets,
                run your applications over them, and inspect results without
                having to leave FlowX Observatory.</b
              >
              <br /><br />
              Testing LLM applications without FlowX Observatory is like trying
              to assemble IKEA furniture without the manual: sure, you could
              wing it, but do you really want to risk it? Baked into FlowX
              Observatory is the option to utilize existing datasets or create
              new ones, and run them against your chains. Visual feedback on
              outputs and accuracy metrics are presented within the interface,
              streamlining the testing process for our engineering team.</span
            >
          </div>
        </div>
        <div class="flex justify-center mt-6 relative z-[3]">
          <a
            href="/docs/debug"
            class="font-semibold p-4 rounded flex items-center linkbox active"
            style="z-index: 99"
          >
            <span>Explore All EVALUATION Features</span>
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
                ? 'url(/assets/landing/images/1_dark.png)'
                : 'url(/assets/landing/images/1_light.png)'
            }"
            [style]="{ 'background-size': 'cover' }"
          >
            <a
              class="templates-btn"
              href="#"
              target="_blank"
              >Feature 1</a
            >
          </div>
          <div
            class="template-block block-2 ml-2 flex justify-center items-center"
            [ngStyle]="{
              'background-image': isDarkMode
                ? 'url(/assets/landing/images/1_dark.png)'
                : 'url(/assets/landing/images/1_light.png)'
            }"
            [style]="{ 'background-size': 'cover' }"
          >
            <a
              class="templates-btn"
              href="#"
              target="_blank"
              >Feature 2</a
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
                ? 'url(/assets/landing/images/1_dark.png)'
                : 'url(/assets/landing/images/1_light.png)'
            }"
            [style]="{ 'background-size': 'cover' }"
          >
            <a
              class="templates-btn"
              href="#"
              target="_blank"
              >Feature 3</a
            >
          </div>
          <img
            class="template-block block-middle border-none box-shadow-none mr-2 hidden lg:flex justify-center items-center flex-col"
            [style]="{ height: '100%' }"
            [src]="
              isDarkMode
                ? '/assets/landing/images/evaluation_dark.png'
                : '/assets/landing/images/evaluation_light.png'
            "
          />
          <div
            class="template-block block-5 mr-2 flex justify-center items-center"
            [ngStyle]="{
              'background-image': isDarkMode
                ? 'url(/assets/landing/images/1_dark.png)'
                : 'url(/assets/landing/images/1_light.png)'
            }"
            [style]="{ 'background-size': 'cover' }"
          >
            <a
              class="templates-btn"
              href="#"
              target="_blank"
              >Feature 4</a
            >
          </div>
        </div>
        <div class="flex md:flex-row flex-col gap-6 lg:gap-0">
          <div
            class="template-block block-5 mr-2 lg:mb-0 flex justify-center items-center"
            [ngStyle]="{
              'background-image': isDarkMode
                ? 'url(/assets/landing/images/1_dark.png)'
                : 'url(/assets/landing/images/1_light.png)'
            }"
            [style]="{ 'background-size': 'cover' }"
          >
            <a
              class="templates-btn"
              href="#"
              target="_blank"
              >Feature 5</a
            >
          </div>
          <div
            class="template-block block-5 mr-2 flex justify-center items-center"
            [ngStyle]="{
              'background-image': isDarkMode
                ? 'url(/assets/landing/images/1_dark.png)'
                : 'url(/assets/landing/images/1_light.png)'
            }"
            [style]="{ 'background-size': 'cover' }"
          >
            <a
              class="templates-btn"
              href="#"
              target="_blank"
              >Feature 6</a
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
export class EvaluationSectionComponent {
  @Input() isDarkMode: boolean
}
