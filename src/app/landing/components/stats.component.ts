import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core'
import { CommonModule } from '@angular/common'

interface Stat {
  value: string
  numericValue: number
  suffix: string
  label: string
}

@Component({
  selector: 'stats-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      #statsSection
      class="stats-section"
      [class.stats-section--light]="!isDarkMode"
    >
      <div class="stats-container">
        <div class="stats-grid">
          @for (stat of stats; track stat.label; let i = $index) {
          <div
            class="stat-item"
            [class.stat-item--visible]="isVisible"
          >
            <div class="stat-item__value">
              <span class="stat-number">{{ animatedValues[i] }}</span>{{ stat.suffix }}
            </div>
            <div class="stat-item__label">{{ stat.label }}</div>
          </div>
          }
        </div>

        <!-- Optional tagline -->
        <div class="stats-tagline">
          <p>Trusted by teams building the next generation of AI applications</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .stats-section {
      padding: 5rem 1.5rem;
      background: #0d0d0f;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);

      @media (min-width: 768px) {
        padding: 6rem 2rem;
      }

      &--light {
        background: #f0f1f3;
        border-color: rgba(0, 0, 0, 0.05);
      }
    }

    .stats-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;

      @media (min-width: 768px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 3rem;
      }
    }

    .stat-item {
      text-align: center;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease, transform 0.6s ease;

      &--visible {
        opacity: 1;
        transform: translateY(0);
      }

      // Stagger animation delays
      &:nth-child(1) { transition-delay: 0s; }
      &:nth-child(2) { transition-delay: 0.1s; }
      &:nth-child(3) { transition-delay: 0.2s; }
      &:nth-child(4) { transition-delay: 0.3s; }

      &__value {
        font-size: clamp(2rem, 6vw, 3rem);
        font-weight: 700;
        color: #feb913;
        line-height: 1;
        margin-bottom: 0.5rem;

        .stat-number {
          font-variant-numeric: tabular-nums;
        }
      }

      &__label {
        font-size: 0.9375rem;
        color: rgba(255, 255, 255, 0.6);
        line-height: 1.4;

        .stats-section--light & {
          color: #4b5563;
        }
      }
    }

    .stats-tagline {
      text-align: center;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);

      .stats-section--light & {
        border-color: rgba(0, 0, 0, 0.05);
      }

      p {
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.4);
        margin: 0;

        .stats-section--light & {
          color: #6b7280;
        }
      }
    }
  `]
})
export class StatsSectionComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() isDarkMode = true
  @ViewChild('statsSection') statsSection!: ElementRef

  isVisible = false
  animatedValues: string[] = []
  private observer?: IntersectionObserver
  private animationFrameId?: number

  stats: Stat[] = [
    {
      value: '10K+',
      numericValue: 10,
      suffix: 'K+',
      label: 'LLM Calls Tracked'
    },
    {
      value: '50+',
      numericValue: 50,
      suffix: '+',
      label: 'Active Teams'
    },
    {
      value: '99.9%',
      numericValue: 99.9,
      suffix: '%',
      label: 'Uptime'
    },
    {
      value: '<100',
      numericValue: 100,
      suffix: 'ms',
      label: 'Avg Latency'
    }
  ]

  ngOnInit(): void {
    // Initialize with zeros
    this.animatedValues = this.stats.map(() => '0')
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver()
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect()
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.isVisible) {
            this.isVisible = true
            this.animateCounters()
          }
        })
      },
      { threshold: 0.3 }
    )

    this.observer.observe(this.statsSection.nativeElement)
  }

  private animateCounters(): void {
    const duration = 2000 // 2 seconds
    const startTime = performance.now()

    const animate = (currentTime: number): void => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      this.animatedValues = this.stats.map((stat, index) => {
        if (index === 3) {
          // Special case for "<100ms"
          const value = Math.round(easeOut * stat.numericValue)
          return `<${value}`
        } else if (stat.suffix === '%') {
          const value = (easeOut * stat.numericValue).toFixed(1)
          return value
        } else {
          const value = Math.round(easeOut * stat.numericValue)
          return value.toString()
        }
      })

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate)
      } else {
        // Set final values
        this.animatedValues = this.stats.map((stat, index) => {
          if (index === 3) {return '<100'}
          if (stat.suffix === '%') {return stat.numericValue.toFixed(1)}
          return stat.numericValue.toString()
        })
      }
    }

    this.animationFrameId = requestAnimationFrame(animate)
  }
}
