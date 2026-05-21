import {
  Component,
  Input,
  AfterViewInit,
  ElementRef,
  QueryList,
  ViewChildren,
  ViewChild,
  NgZone,
  HostListener,
} from '@angular/core'
import { CommonModule } from '@angular/common'

interface ShowcaseItem {
  id: string
  label: string
  imageDark: string
  imageLight: string
  description: string
  cta: string
  link: string
}

@Component({
  selector: 'showcase-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      id="showcase"
      class="showcase-section"
      [class.showcase-section--light]="!isDarkMode"
    >
      <div class="showcase-container">
        <!-- Header -->
        <div class="showcase-header">
          <span class="showcase-label">PRODUCT</span>
          <h2 class="showcase-title">See it in action</h2>
          <p class="showcase-subtitle">
            Explore the powerful features that help teams ship AI applications
            faster
          </p>
        </div>

        <!-- Scroll layout -->
        <div class="showcase-scroll-layout" #scrollLayout>
          <!-- LEFT: Stacked text sections -->
          <div class="showcase-scroll-left">
            @for (item of items; track item.id) {
            <div
              #scrollItem
              class="showcase-scroll-item"
              [attr.data-item-id]="item.id"
              [class.is-active]="activeItem === item.id"
            >
              <h3 class="showcase-item-title">{{ item.label }}</h3>
              <p class="showcase-item-desc">{{ item.description }}</p>
              <a class="showcase-item-cta" [href]="item.link">
                <span class="showcase-cta-glow"></span>
                {{ item.cta }}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 3L11 8L6 13"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </a>

              <!-- Mobile-only inline image -->
              <div class="showcase-mobile-image">
                <div class="showcase-mobile-image-card">
                  <img
                    [src]="isDarkMode ? item.imageDark : item.imageLight"
                    [alt]="item.label"
                  />
                </div>
              </div>
            </div>
            }
          </div>

          <!-- RIGHT: Image panel (desktop) -->
          <div class="showcase-scroll-right" #scrollRight>
            <div
              class="showcase-image-panel"
              #imagePanel
              [style.position]="panelPosition"
              [style.top.px]="panelTop"
              [style.width.px]="panelWidth"
            >
              <!-- Background effects -->
              <div class="showcase-panel-bg">
                <div class="showcase-grid-overlay"></div>
                <div class="showcase-orb showcase-orb--1"></div>
                <div class="showcase-orb showcase-orb--2"></div>
                <div class="showcase-orb showcase-orb--3"></div>
              </div>
              <!-- Screenshot -->
              <div class="showcase-screenshot-wrapper">
                @for (item of items; track item.id) {
                <img
                  class="showcase-screenshot"
                  [class.showcase-screenshot--active]="activeItem === item.id"
                  [src]="isDarkMode ? item.imageDark : item.imageLight"
                  [alt]="item.label"
                />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      /* ───────── Section ───────── */
      .showcase-section {
        padding: 6rem 1.5rem;
        background: #2b2d33;

        @media (min-width: 768px) {
          padding: 8rem 2rem;
        }
        @media (min-width: 1024px) {
          padding: 6rem 4rem;
        }

        &--light {
          background: #ffffff;
        }
      }

      .showcase-container {
        max-width: 1280px;
        margin: 0 auto;

        @media (min-width: 1600px) {
          max-width: 1520px;
        }
        @media (min-width: 1920px) {
          max-width: 1760px;
        }
      }

      /* ───────── Header ───────── */
      .showcase-header {
        text-align: center;
        margin-bottom: 4rem;
      }

      .showcase-label {
        display: inline-block;
        font-size: 0.875rem;
        font-weight: 600;
        letter-spacing: 0.15em;
        color: #feb913;
        margin-bottom: 1rem;
      }

      .showcase-title {
        font-size: clamp(2rem, 5vw, 3rem);
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: -0.02em;
        margin: 0 0 1rem;
        color: #ffffff;

        .showcase-section--light & {
          color: #111827;
        }
      }

      .showcase-subtitle {
        font-size: clamp(1rem, 2vw, 1.25rem);
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.5);
        margin: 0 auto;
        max-width: 540px;

        .showcase-section--light & {
          color: #6b7280;
        }
      }

      /* ───────── Scroll Layout ───────── */
      .showcase-scroll-layout {
        display: flex;
        gap: 4rem;
        position: relative;

        @media (max-width: 1023px) {
          flex-direction: column;
          gap: 0;
        }
      }

      /* ───────── Left Column ───────── */
      .showcase-scroll-left {
        flex: 0 0 38%;
        min-width: 0;

        @media (min-width: 1600px) {
          flex: 0 0 34%;
        }
      }

      .showcase-scroll-item {
        min-height: 50vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 3rem 0;
        border-top: 1px solid rgba(71, 82, 99, 0.4);
        transition: opacity 0.4s ease;
        opacity: 0.35;

        .showcase-section--light & {
          border-top-color: rgba(0, 0, 0, 0.06);
        }

        &:last-child {
          border-bottom: 1px solid rgba(71, 82, 99, 0.4);

          .showcase-section--light & {
            border-bottom-color: rgba(0, 0, 0, 0.06);
          }
        }

        &.is-active {
          opacity: 1;
        }

        @media (max-width: 1023px) {
          min-height: auto;
          padding: 2.5rem 0;
          opacity: 1;
        }
      }

      .showcase-item-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 0.75rem;
        color: #475263;
        transition: color 0.4s ease;

        .showcase-section--light & {
          color: rgb(200, 200, 200);
        }

        .showcase-scroll-item.is-active & {
          color: #ffffff;
        }

        .showcase-section--light .showcase-scroll-item.is-active & {
          color: #111827;
        }

        @media (max-width: 1023px) {
          color: #ffffff;
          .showcase-section--light & {
            color: #111827;
          }
        }
      }

      .showcase-item-desc {
        font-size: 1.0625rem;
        line-height: 1.7;
        color: #475263;
        margin: 0 0 1.25rem;
        max-width: 440px;
        transition: color 0.4s ease;

        .showcase-scroll-item.is-active & {
          color: rgba(255, 255, 255, 0.6);
        }

        .showcase-section--light & {
          color: rgba(0, 0, 0, 0.12);
        }

        .showcase-section--light .showcase-scroll-item.is-active & {
          color: #4b5563;
        }

        @media (max-width: 1023px) {
          color: rgba(255, 255, 255, 0.6);
          .showcase-section--light & {
            color: #4b5563;
          }
        }
      }

      /* ───────── CTA Link ───────── */
      .showcase-item-cta {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        position: relative;
        font-size: 0.9375rem;
        font-weight: 500;
        color: rgba(253, 185, 19, 0.25);
        text-decoration: none;
        transition: color 0.4s ease;
        padding: 0.375rem 1rem;
        border-radius: 999px;

        .showcase-scroll-item.is-active & {
          color: #feb913;
        }

        .showcase-section--light & {
          color: rgba(180, 130, 0, 0.2);
        }

        .showcase-section--light .showcase-scroll-item.is-active & {
          color: #b48200;
        }

        &:hover {
          color: #ffd54f;

          .showcase-section--light & {
            color: #d4a017;
          }
        }

        @media (max-width: 1023px) {
          color: #feb913;
          .showcase-section--light & {
            color: #b48200;
          }
        }
      }

      .showcase-cta-glow {
        position: absolute;
        inset: 0;
        border-radius: 999px;
        background: radial-gradient(
          ellipse at center,
          rgba(253, 185, 19, 0.08) 0%,
          transparent 70%
        );
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;

        .showcase-scroll-item.is-active & {
          opacity: 1;
        }

        @media (max-width: 1023px) {
          opacity: 1;
        }
      }

      /* ───────── Mobile Inline Image ───────── */
      .showcase-mobile-image {
        display: none;

        @media (max-width: 1023px) {
          display: block;
          margin-top: 1.5rem;
        }
      }

      .showcase-mobile-image-card {
        border-radius: 0.75rem;
        overflow: hidden;
        border: 1px solid rgba(71, 82, 99, 0.3);
        background: #2b2d33;
        aspect-ratio: 16 / 9;

        .showcase-section--light & {
          background: #f3f4f6;
          border-color: rgba(0, 0, 0, 0.08);
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top left;
          display: block;
        }
      }

      /* ───────── Right Column ───────── */
      .showcase-scroll-right {
        flex: 1 1 auto;
        min-width: 0;
        position: relative;

        @media (max-width: 1023px) {
          display: none;
        }
      }

      .showcase-image-panel {
        aspect-ratio: 16 / 9;
        border-radius: 1.25rem;
        overflow: hidden;
        isolation: isolate;
        /* position/top/width set via bindings */
      }

      /* ── Panel Background ── */
      .showcase-panel-bg {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          145deg,
          #33363d 0%,
          #2b2d33 40%,
          #262830 100%
        );
        z-index: 0;

        .showcase-section--light & {
          background: linear-gradient(
            145deg,
            #f5f0e8 0%,
            #ede8e0 40%,
            #e8e4de 100%
          );
        }
      }

      .showcase-grid-overlay {
        position: absolute;
        inset: 0;
        background-image: linear-gradient(
            rgba(255, 255, 255, 0.02) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.02) 1px,
            transparent 1px
          );
        background-size: 40px 40px;

        .showcase-section--light & {
          background-image: linear-gradient(
              rgba(0, 0, 0, 0.03) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.03) 1px,
              transparent 1px
            );
        }
      }

      .showcase-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(60px);
        pointer-events: none;

        &--1 {
          width: 220px;
          height: 220px;
          top: -40px;
          right: -30px;
          background: radial-gradient(
            circle,
            rgba(253, 185, 19, 0.18) 0%,
            transparent 70%
          );

          .showcase-section--light & {
            background: radial-gradient(
              circle,
              rgba(253, 185, 19, 0.22) 0%,
              transparent 70%
            );
          }
        }

        &--2 {
          width: 180px;
          height: 180px;
          bottom: 20px;
          left: -20px;
          background: radial-gradient(
            circle,
            rgba(180, 130, 0, 0.12) 0%,
            transparent 70%
          );

          .showcase-section--light & {
            background: radial-gradient(
              circle,
              rgba(180, 130, 0, 0.15) 0%,
              transparent 70%
            );
          }
        }

        &--3 {
          width: 140px;
          height: 140px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(
            circle,
            rgba(120, 80, 200, 0.08) 0%,
            transparent 70%
          );

          .showcase-section--light & {
            background: radial-gradient(
              circle,
              rgba(120, 80, 200, 0.06) 0%,
              transparent 70%
            );
          }
        }
      }

      /* ── Screenshot ── */
      .showcase-screenshot-wrapper {
        position: absolute;
        inset: 24px;
        z-index: 1;
      }

      .showcase-screenshot {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top left;
        aspect-ratio: 16 / 9;
        border-radius: 0.75rem;
        opacity: 0;
        transition: opacity 0.5s ease;
        box-shadow: 0 0 30px rgba(253, 185, 19, 0.06),
          0 8px 32px rgba(0, 0, 0, 0.4);

        .showcase-section--light & {
          box-shadow: 0 0 30px rgba(253, 185, 19, 0.08),
            0 8px 32px rgba(0, 0, 0, 0.12);
        }

        &--active {
          opacity: 1;
        }
      }
    `,
  ],
})
export class ShowcaseSectionComponent implements AfterViewInit {
  @Input() isDarkMode = true

  @ViewChildren('scrollItem') scrollItems!: QueryList<ElementRef>
  @ViewChild('scrollLayout') scrollLayout!: ElementRef
  @ViewChild('scrollRight') scrollRight!: ElementRef

  activeItem = 'dashboard'

  /** Manual sticky positioning (works around overflow:hidden ancestors) */
  panelPosition = 'relative'
  panelTop: number | null = null
  panelWidth: number | null = null

  private get PANEL_HEIGHT(): number {
    if (!this.scrollRight) {return 420}
    const width = this.scrollRight.nativeElement.getBoundingClientRect().width
    return width * 9 / 16
  }
  private readonly DESIRED_TOP_VH = 0.25 // 25vh from top
  private ticking = false

  items: ShowcaseItem[] = [
    {
      id: 'dashboard',
      label: 'Observability',
      imageDark: '/assets/landing/img/observability-dark.png',
      imageLight: '/assets/landing/img/observability-light.png',
      description:
        "Get a bird's eye view of all your AI applications with real-time metrics, cost tracking, and performance insights — all in one dashboard.",
      cta: 'Learn more',
      link: '/ai/dashboard',
    },
    {
      id: 'traces',
      label: 'Tracing',
      imageDark: '/assets/landing/img/traces-dark.png',
      imageLight: '/assets/landing/img/traces-light.png',
      description:
        'Dive deep into individual requests with full trace visibility. See every step of your AI chain with timing and token usage.',
      cta: 'Learn more',
      link: '/ai/traces',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      imageDark: '/assets/landing/img/analytics-dark.png',
      imageLight: '/assets/landing/img/analytics-light.png',
      description:
        'Track trends over time with comprehensive analytics. Monitor costs, latency distributions, and error rates across models.',
      cta: 'Learn more',
      link: '/ai/analytics',
    },
    {
      id: 'evaluation',
      label: 'Evaluation',
      imageDark: '/assets/landing/img/evaluations-dark.png',
      imageLight: '/assets/landing/img/evaluations-light.png',
      description:
        'Run automated evaluations and collect user feedback. Measure quality improvements across model versions.',
      cta: 'Learn more',
      link: '/ai/evaluation',
    },
  ]

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // Initial calculation after render
    setTimeout(() => this.onScroll(), 0)
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.ticking) {
      this.ticking = true
      requestAnimationFrame(() => {
        this.onScroll()
        this.ticking = false
      })
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.onScroll()
  }

  private onScroll(): void {
    this.updateActiveItem()
    this.updatePanelPosition()
  }

  /** Determine which left-column section is closest to the viewport center */
  private updateActiveItem(): void {
    if (!this.scrollItems || this.scrollItems.length === 0) {return}

    const viewportCenter = window.innerHeight / 2
    let closestId: string | null = null
    let closestDist = Infinity

    this.scrollItems.forEach((el) => {
      const rect = el.nativeElement.getBoundingClientRect()
      const itemCenter = rect.top + rect.height / 2
      const dist = Math.abs(itemCenter - viewportCenter)
      if (dist < closestDist) {
        closestDist = dist
        closestId = el.nativeElement.getAttribute('data-item-id')
      }
    })

    if (closestId && closestId !== this.activeItem) {
      this.activeItem = closestId
    }
  }

  /**
   * Manually position the image panel to simulate position:sticky.
   * Three states:
   * 1. Before section enters viewport - relative (top of right column)
   * 2. Section in viewport - fixed at 25vh
   * 3. After section leaves viewport - absolute at bottom of right column
   */
  private updatePanelPosition(): void {
    if (!this.scrollRight || !this.scrollLayout) {return}
    if (window.innerWidth < 1024) {
      this.panelPosition = 'relative'
      this.panelTop = null
      this.panelWidth = null
      return
    }

    const rightRect =
      this.scrollRight.nativeElement.getBoundingClientRect()
    const desiredTop = window.innerHeight * this.DESIRED_TOP_VH
    const rightColWidth = rightRect.width

    // How far from the top of the viewport is the right column?
    const colTop = rightRect.top
    const colBottom = rightRect.bottom

    // The panel should appear fixed when the right column spans the viewport
    const panelFitsAtTop = colTop <= desiredTop
    const panelFitsAtBottom = colBottom >= desiredTop + this.PANEL_HEIGHT

    if (!panelFitsAtTop) {
      // Column hasn't scrolled up enough → panel sits at top of column
      this.panelPosition = 'relative'
      this.panelTop = null
      this.panelWidth = null
    } else if (panelFitsAtTop && panelFitsAtBottom) {
      // Column spans the viewport → fix the panel
      this.panelPosition = 'fixed'
      this.panelTop = desiredTop
      this.panelWidth = rightColWidth
    } else {
      // Column is leaving → pin panel to bottom of column
      this.panelPosition = 'absolute'
      this.panelTop =
        this.scrollRight.nativeElement.offsetHeight - this.PANEL_HEIGHT
      this.panelWidth = null
    }
  }
}
