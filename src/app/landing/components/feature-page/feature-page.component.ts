import {
  Component,
  Input,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  QueryList,
  ViewChildren,
  ViewChild,
  HostListener,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MegaMenuCategory } from '../../data/megamenu-data'
import { AppConfigService } from '../../../app.config'

export interface FeatureShowcaseTab {
  id: string
  label: string
  imageDark: string
  imageLight: string
  description: string
}

@Component({
  selector: 'feature-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Page Hero -->
    <section class="page-hero" [class.page-hero--light]="!isDarkMode">
      <div class="page-hero__glow"></div>
      <div class="page-hero__container">
        <div class="page-hero__icon-wrapper">
          <i [class]="category.icon"></i>
        </div>
        <h1 class="page-hero__title">{{ category.label }}</h1>
        <p class="page-hero__tagline">{{ tagline }}</p>
      </div>
    </section>

    <!-- Features Grid -->
    <section
      class="features-grid-section"
      [class.features-grid-section--light]="!isDarkMode"
    >
      <div class="features-grid-container">
        @for (column of category.columns; track column.title) {
        <div class="feature-group">
          <h3 class="feature-group__title">{{ column.title }}</h3>
          <div class="feature-group__cards">
            @for (feature of column.features; track feature.name) {
            <div
              class="feature-card"
              [class.feature-card--light]="!isDarkMode"
            >
              <div class="feature-card__icon">
                <i [class]="feature.icon"></i>
              </div>
              <div>
                <h4 class="feature-card__name">{{ feature.name }}</h4>
                <p class="feature-card__desc">{{ feature.description }}</p>
              </div>
            </div>
            }
          </div>
        </div>
        }
      </div>
    </section>

    <!-- Showcase (scroll-sticky layout) -->
    @if (showcaseTabs.length > 0) {
    <section
      class="showcase-section"
      [class.showcase-section--light]="!isDarkMode"
    >
      <div class="showcase-container">
        <div class="showcase-scroll-layout" #scrollLayout>
          <!-- LEFT: Stacked text sections -->
          <div class="showcase-scroll-left">
            @for (tab of showcaseTabs; track tab.id) {
            <div
              #scrollItem
              class="showcase-scroll-item"
              [attr.data-item-id]="tab.id"
              [class.is-active]="activeTab === tab.id"
            >
              <h3 class="showcase-item-title">{{ tab.label }}</h3>
              <p class="showcase-item-desc">{{ tab.description }}</p>

              <!-- Mobile-only inline image -->
              <div class="showcase-mobile-image">
                <div class="showcase-mobile-image-card">
                  <img
                    [src]="isDarkMode ? tab.imageDark : tab.imageLight"
                    [alt]="tab.label"
                  />
                </div>
              </div>
            </div>
            }
          </div>

          <!-- RIGHT: Sticky image panel (desktop) -->
          <div class="showcase-scroll-right" #scrollRight>
            <div
              class="showcase-image-panel"
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
                @for (tab of showcaseTabs; track tab.id) {
                <img
                  class="showcase-screenshot"
                  [class.showcase-screenshot--active]="activeTab === tab.id"
                  [src]="isDarkMode ? tab.imageDark : tab.imageLight"
                  [alt]="tab.label"
                />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    }

    <!-- CTA -->
    <section class="cta-section" [class.cta-section--light]="!isDarkMode">
      <div class="cta-container">
        <h2 class="cta-title">Ready to get started?</h2>
        <p class="cta-subtitle">
          See how FlowX Observatory can help your team build
          {{ category.label | lowercase }} into every AI application.
        </p>
        <a class="cta-btn" routerLink="/ai/">
          Open Observatory
          <i class="pi pi-arrow-right"></i>
        </a>
      </div>
    </section>
  `,
  styles: [
    `
      // Page Hero
      .page-hero {
        position: relative;
        padding: 10rem 1.5rem 5rem;
        background: #2b2d33;
        text-align: center;
        overflow: hidden;

        @media (min-width: 768px) {
          padding: 12rem 2rem 6rem;
        }

        &--light {
          background: #ffffff;
        }
      }

      .page-hero__glow {
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 600px;
        height: 400px;
        background: radial-gradient(
          ellipse at center,
          rgba(253, 185, 19, 0.08) 0%,
          transparent 70%
        );
        pointer-events: none;
      }

      .page-hero__container {
        position: relative;
        z-index: 1;
        max-width: 800px;
        margin: 0 auto;
      }

      .page-hero__icon-wrapper {
        width: 5rem;
        height: 5rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 1.25rem;
        background: rgba(253, 185, 19, 0.1);
        margin-bottom: 2rem;

        i {
          font-size: 2.25rem;
          color: #feb913;
        }
      }

      .page-hero__title {
        font-size: clamp(2.5rem, 6vw, 4rem);
        font-weight: 700;
        line-height: 1.1;
        letter-spacing: -0.03em;
        color: #ffffff;
        margin: 0 0 1.25rem;

        .page-hero--light & {
          color: #111827;
        }
      }

      .page-hero__tagline {
        font-size: clamp(1.0625rem, 2vw, 1.25rem);
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.6);
        margin: 0 auto;
        max-width: 600px;

        .page-hero--light & {
          color: #4b5563;
        }
      }

      // Features Grid Section
      .features-grid-section {
        padding: 5rem 1.5rem;
        background: #33363d;

        @media (min-width: 768px) {
          padding: 6rem 2rem;
        }

        @media (min-width: 1024px) {
          padding: 8rem 4rem;
        }

        &--light {
          background: #f8f9fa;
        }
      }

      .features-grid-container {
        max-width: 1200px;
        margin: 0 auto;

        @media (min-width: 1600px) {
          max-width: 1520px;
        }
        @media (min-width: 1920px) {
          max-width: 1760px;
        }
        display: grid;
        grid-template-columns: 1fr;
        gap: 3rem;

        @media (min-width: 768px) {
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 3rem;
        }
      }

      .feature-group__title {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #feb913;
        margin: 0 0 1.25rem;
      }

      .feature-group__cards {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .feature-card {
        display: flex;
        gap: 1rem;
        padding: 1.25rem;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(71, 82, 99, 0.4);
        border-radius: 0.75rem;
        transition: all 250ms ease;

        &--light {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.06);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        &:hover {
          border-color: rgba(253, 185, 19, 0.25);
          transform: translateY(-2px);
        }
      }

      .feature-card__icon {
        width: 2.5rem;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.5rem;
        background: rgba(253, 185, 19, 0.08);
        flex-shrink: 0;

        i {
          font-size: 1.125rem;
          color: #feb913;
        }
      }

      .feature-card__name {
        font-size: 1rem;
        font-weight: 600;
        color: #ffffff;
        margin: 0 0 0.25rem;

        .feature-card--light & {
          color: #111827;
        }
      }

      .feature-card__desc {
        font-size: 0.875rem;
        line-height: 1.5;
        color: #8b95a5;
        margin: 0;

        .feature-card--light & {
          color: #6b7280;
        }
      }

      /* ───────── Showcase (Scroll-Sticky) ───────── */
      .showcase-section {
        padding: 5rem 1.5rem;
        background: #2b2d33;

        @media (min-width: 768px) {
          padding: 6rem 2rem;
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

      .showcase-scroll-layout {
        display: flex;
        gap: 4rem;
        position: relative;

        @media (max-width: 1023px) {
          flex-direction: column;
          gap: 0;
        }
      }

      /* ── Left Column ── */
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
        margin: 0;
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

      /* ── Mobile Inline Image ── */
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

      /* ── Right Column ── */
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

      // CTA
      .cta-section {
        padding: 6rem 1.5rem;
        background: #33363d;
        text-align: center;

        @media (min-width: 768px) {
          padding: 8rem 2rem;
        }

        &--light {
          background: #f0f0f0;
        }
      }

      .cta-container {
        max-width: 600px;
        margin: 0 auto;
      }

      .cta-title {
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 1rem;

        .cta-section--light & {
          color: #111827;
        }
      }

      .cta-subtitle {
        font-size: 1.0625rem;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.6);
        margin: 0 0 2rem;

        .cta-section--light & {
          color: #4b5563;
        }
      }

      .cta-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 2rem;
        font-size: 1.0625rem;
        font-weight: 600;
        background: linear-gradient(135deg, #feb913 0%, #b4830d 100%);
        color: #1a1a1a;
        border: none;
        border-radius: 0.75rem;
        text-decoration: none;
        cursor: pointer;
        transition: all 200ms ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(253, 185, 19, 0.3);
        }

        i {
          font-size: 0.875rem;
        }
      }
    `,
  ],
})
export class FeaturePageComponent implements AfterViewInit, OnChanges {
  @Input() category!: MegaMenuCategory
  @Input() tagline = ''
  @Input() showcaseTabs: FeatureShowcaseTab[] = []

  @ViewChildren('scrollItem') scrollItems!: QueryList<ElementRef>
  @ViewChild('scrollLayout') scrollLayout!: ElementRef
  @ViewChild('scrollRight') scrollRight!: ElementRef

  activeTab = ''

  /** Manual sticky positioning */
  panelPosition = 'relative'
  panelTop: number | null = null
  panelWidth: number | null = null

  private get PANEL_HEIGHT(): number {
    if (!this.scrollRight) {return 420}
    const width = this.scrollRight.nativeElement.getBoundingClientRect().width
    return width * 9 / 16
  }
  private readonly DESIRED_TOP_VH = 0.25
  private ticking = false

  get isDarkMode(): boolean {
    return this.configService.config().darkMode
  }

  constructor(private configService: AppConfigService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showcaseTabs'] && this.showcaseTabs.length > 0 && !this.activeTab) {
      this.activeTab = this.showcaseTabs[0].id
    }
  }

  ngAfterViewInit(): void {
    if (this.showcaseTabs.length > 0) {
      if (!this.activeTab) {
        this.activeTab = this.showcaseTabs[0].id
      }
      setTimeout(() => this.onScroll(), 0)
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.showcaseTabs.length === 0) {return}
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
    if (this.showcaseTabs.length > 0) {
      this.onScroll()
    }
  }

  private onScroll(): void {
    this.updateActiveItem()
    this.updatePanelPosition()
  }

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

    if (closestId && closestId !== this.activeTab) {
      this.activeTab = closestId
    }
  }

  private updatePanelPosition(): void {
    if (!this.scrollRight || !this.scrollLayout) {return}
    if (window.innerWidth < 1024) {
      this.panelPosition = 'relative'
      this.panelTop = null
      this.panelWidth = null
      return
    }

    const rightRect = this.scrollRight.nativeElement.getBoundingClientRect()
    const desiredTop = window.innerHeight * this.DESIRED_TOP_VH
    const rightColWidth = rightRect.width

    const colTop = rightRect.top
    const colBottom = rightRect.bottom

    const panelFitsAtTop = colTop <= desiredTop
    const panelFitsAtBottom = colBottom >= desiredTop + this.PANEL_HEIGHT

    if (!panelFitsAtTop) {
      this.panelPosition = 'relative'
      this.panelTop = null
      this.panelWidth = null
    } else if (panelFitsAtTop && panelFitsAtBottom) {
      this.panelPosition = 'fixed'
      this.panelTop = desiredTop
      this.panelWidth = rightColWidth
    } else {
      this.panelPosition = 'absolute'
      this.panelTop =
        this.scrollRight.nativeElement.offsetHeight - this.PANEL_HEIGHT
      this.panelWidth = null
    }
  }
}
