
import { Component } from '@angular/core'
import { AppConfigService } from '../../app.config'
import { NgIconsModule } from '@ng-icons/core'
import { Router } from '@angular/router'
import { ButtonModule } from 'primeng/button'

@Component({
    selector: 'highlights-section',
    imports: [NgIconsModule, ButtonModule],
    template: `
    <div id="highlights" class="py-6 px-6 lg:px-20 mx-0 my-12 lg:mx-20 p-6">
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
          class="card flex justify-center col-span-12 lg:col-span-6 p-1 flex-order-1 lg:flex-order-0"
          style="border-radius: 12px"
        >
          <video
            src="/assets/landing/preview.mp4"
            autoplay=""
            loop=""
            muted=""
            class="rounded-xl border shadow-2xl w-full"
          ></video>
        </div>

        <div
          class="col-span-12 lg:col-span-6 flex flex-col lg:items-end text-center lg:text-right"
        >
          <h2 class="line-height-1 text-surface-900 section-header font-bold">Debug</h2>

          <span class="text-surface-700 section-content line-height-3 ml-0 md:ml-2 mb-4"
            >Unexpected results happen all the time. With full visibility into
            the entire chain sequence of calls, you can spot the source of
            errors and surprises in real-time with surgical precision. When your
            LLM starts throwing curveballs instead of answers, you don't just
            want to sit there catching them. <br />
            <br />With FlowX Observatory, you can roll up your sleeves and play
            detective. We use the debugging tools to dive into perplexing agent
            loops, frustratingly slow chains, and to scrutinize prompts like
            they're suspects in a lineup.</span
          >
          <div class="feature">
            <div class="feature-icon">
              <ng-icon name="bootstrapCheckCircleFill"></ng-icon>
            </div>
            <div class="feature-text section-content font-bold">Nested traces</div>
          </div>
          <div class="feature">
            <div class="feature-icon">
              <ng-icon name="bootstrapCheckCircleFill"></ng-icon>
            </div>
            <div class="feature-text section-content font-bold">
              Prompt-level visibility
            </div>
          </div>
          <div class="feature">
            <div class="feature-icon">
              <ng-icon name="bootstrapCheckCircleFill"></ng-icon>
            </div>
            <div class="feature-text section-content font-bold">Real-time insights</div>
          </div>
          <div class="feature">
            <div class="feature-icon">
              <ng-icon name="bootstrapCheckCircleFill"></ng-icon>
            </div>
            <div class="feature-text section-content font-bold">Playground mode</div>
          </div>
        </div>
      </div>
      <hr />
      <div
        class="grid grid-cols-12 mt-20 pb-2 md:pb-20 bg-white/100"
        style="
        height: 90vh;
        min-height: 600px;
        align-items: center;
        justify-content: center;
      "
      >
        <div
          class="col-span-12 lg:col-span-6 flex flex-col lg:items-center text-center lg:text-left"
        >
          <h2 class="line-height-1 text-surface-900 section-header font-bold sm:mt-12">
            Test & Evaluate
          </h2>

          <span class="text-surface-700 section-content line-height-3 ml-0 md:ml-2 mb-4"
            >Software engineering relies on unit testing to build performant,
            production-ready applications. FlowX Observatory provides that same
            functionality for LLM applications. Spin up test datasets, run your
            applications over them, and inspect results without having to leave
            FlowX Observatory. <br />
            <br />Testing LLM applications without FlowX Observatory is like trying
            to assemble IKEA furniture without the manual: sure, you could wing
            it, but do you really want to risk it? Baked into FlowX Observatory is
            the option to utilize existing datasets or create new ones, and run
            them against your chains. Visual feedback on outputs and accuracy
            metrics are presented within the interface, streamlining the testing
            process for our engineering team.</span
          >
          <div class="feature">
            <div class="feature-icon">
              <ng-icon name="bootstrapCheckCircleFill"></ng-icon>
            </div>
            <div class="feature-text section-content font-bold">Dataset curation</div>
          </div>
          <div class="feature">
            <div class="feature-icon">
              <ng-icon name="bootstrapCheckCircleFill"></ng-icon>
            </div>
            <div class="feature-text section-content font-bold">
              Evaluate chain performance
            </div>
          </div>
          <div class="feature">
            <div class="feature-icon">
              <ng-icon name="bootstrapCheckCircleFill"></ng-icon>
            </div>
            <div class="feature-text section-content font-bold">
              AI-assisted evaluation
            </div>
          </div>
          <div class="feature">
            <div class="feature-icon">
              <ng-icon name="bootstrapCheckCircleFill"></ng-icon>
            </div>
            <div class="feature-text section-content font-bold">Easy benchmarking</div>
          </div>
        </div>
        <div
          class="card flex justify-center col-span-12 lg:col-span-6 p-1 flex-order-1 lg:flex-order-0"
          style="border-radius: 12px"
        >
          <video
            src="/assets/landing/preview.mp4"
            autoplay=""
            loop=""
            muted=""
            class="rounded-xl border shadow-2xl w-full"
          ></video>
        </div>
      </div>
      <hr />
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
          class="card flex justify-center col-span-12 lg:col-span-6 p-1 flex-order-1 lg:flex-order-0"
          style="border-radius: 12px"
        >
          <video
            src="/assets/landing/preview.mp4"
            autoplay=""
            loop=""
            muted=""
            class="rounded-xl border shadow-2xl w-full"
          ></video>
        </div>

        <div
          class="col-span-12 lg:col-span-6 flex flex-col lg:items-end text-center lg:text-right sm:mt-12"
        >
          <h2 class="line-height-1 text-surface-900 section-header font-bold">Monitoring</h2>

          <span class="text-surface-700 section-content line-height-3 ml-0 md:ml-2 mb-4"
            >Given the stochastic nature of LLMs, it can be hard to answer the
            simple question: “what’s happening with my application?”
            FlowX Observatory enables mission-critical observability with only a few
            lines code.
            <br />
            <br />Think of FlowX Observatory's monitoring as your AI’s babysitter:
            always vigilant, never distracted, and ready to report every little
            mischief. It'll give you the play-by-play, ensure everything's in
            order, and notify you if things get out of hand.</span
          >
          <div class="feature">
            <div class="feature-icon">
              <ng-icon name="bootstrapCheckCircleFill"></ng-icon>
            </div>
            <div class="feature-text section-content font-bold">
              Application-level usage stats
            </div>
          </div>
          <div class="feature">
            <div class="feature-icon">
              <ng-icon name="bootstrapCheckCircleFill"></ng-icon>
            </div>
            <div class="feature-text section-content font-bold">
              Feedback collection
            </div>
          </div>
          <div class="feature">
            <div class="feature-icon">
              <ng-icon name="bootstrapCheckCircleFill"></ng-icon>
            </div>
            <div class="feature-text section-content font-bold">Filter traces</div>
          </div>
          <div class="feature">
            <div class="feature-icon">
              <ng-icon name="bootstrapCheckCircleFill"></ng-icon>
            </div>
            <div class="feature-text section-content font-bold">
              Performance comparison
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HighlightsSectionComponent {
  constructor(
    private configService: AppConfigService,
    public router: Router,
  ) {}

  get isDarkMode(): any {
    return this.configService.config().darkMode
  }
}
