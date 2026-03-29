import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

interface CategoryCard {
  id: string
  icon: string
  title: string
  description: string
  highlights: string[]
  route: string
}

@Component({
  selector: 'features-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="features-section" [class.features-section--light]="!isDarkMode">
      <div class="features-container">
        <!-- Header -->
        <div class="features-header">
          <span class="features-label">PLATFORM</span>
          <h2 class="features-title">
            Everything you need to build<br class="hide-mobile" />
            <span class="text-gold">responsible AI</span>
          </h2>
          <p class="features-subtitle">
            From real-time observability to governance and regulatory compliance &mdash;
            a unified platform for your entire AI lifecycle.
          </p>
        </div>

        <!-- Category Cards Grid -->
        <div class="categories-grid">
          @for (card of categories; track card.id) {
            <div class="category-card">
              <div class="category-card__icon-wrapper">
                <i [class]="card.icon"></i>
              </div>
              <h3 class="category-card__title">{{ card.title }}</h3>
              <p class="category-card__description">{{ card.description }}</p>
              <ul class="category-card__highlights">
                @for (highlight of card.highlights; track highlight) {
                  <li>
                    <i class="pi pi-check"></i>
                    <span>{{ highlight }}</span>
                  </li>
                }
              </ul>
              <a class="category-card__link" [routerLink]="card.route">
                Learn more
                <i class="pi pi-arrow-right"></i>
              </a>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .features-section {
      padding: 6rem 1.5rem;
      background: #090909;

      @media (min-width: 768px) {
        padding: 8rem 2rem;
      }

      @media (min-width: 1024px) {
        padding: 10rem 4rem;
      }

      &--light {
        background: #f8f9fa;
      }
    }

    .features-container {
      max-width: 1200px;
      margin: 0 auto;

      @media (min-width: 1600px) {
        max-width: 1520px;
      }
      @media (min-width: 1920px) {
        max-width: 1760px;
      }
    }

    // Header
    .features-header {
      text-align: center;
      margin-bottom: 4rem;

      @media (min-width: 768px) {
        margin-bottom: 5rem;
      }
    }

    .features-label {
      display: inline-block;
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      color: #fdb913;
      margin-bottom: 1rem;
    }

    .features-title {
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin: 0 0 1.25rem;
      color: #ffffff;

      .features-section--light & {
        color: #111827;
      }
    }

    .features-subtitle {
      font-size: clamp(1rem, 2vw, 1.25rem);
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.6);
      margin: 0 auto;
      max-width: 640px;

      .features-section--light & {
        color: #4b5563;
      }
    }

    .text-gold {
      color: #fdb913;
    }

    // Categories Grid
    .categories-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;

      @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
      }
    }

    // Category Card
    .category-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 1rem;
      padding: 2rem;
      transition: all 300ms ease;
      display: flex;
      flex-direction: column;

      .features-section--light & {
        background: #ffffff;
        border-color: rgba(0, 0, 0, 0.06);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      &:hover {
        transform: translateY(-6px);
        border-color: rgba(253, 185, 19, 0.3);
        box-shadow: 0 0 40px rgba(253, 185, 19, 0.1);

        .features-section--light & {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }
      }

      &__icon-wrapper {
        width: 4rem;
        height: 4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
        background: rgba(253, 185, 19, 0.1);
        margin-bottom: 1.5rem;

        i {
          font-size: 1.75rem;
          color: #fdb913;
        }
      }

      &__title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 0.75rem;
        color: #ffffff;

        .features-section--light & {
          color: #111827;
        }
      }

      &__description {
        font-size: 0.9375rem;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.6);
        margin: 0 0 1.5rem;

        .features-section--light & {
          color: #4b5563;
        }
      }

      &__highlights {
        list-style: none;
        padding: 0;
        margin: 0 0 1.5rem;
        flex: 1;

        li {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.375rem 0;
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.8);

          .features-section--light & {
            color: #374151;
          }

          i {
            font-size: 0.75rem;
            color: #fdb913;
            flex-shrink: 0;
          }
        }
      }

      &__link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9375rem;
        font-weight: 600;
        color: #fdb913;
        text-decoration: none;
        transition: gap 200ms ease;

        &:hover {
          gap: 0.75rem;
        }

        i {
          font-size: 0.75rem;
          transition: transform 200ms ease;
        }
      }
    }

    .hide-mobile {
      @media (max-width: 767px) {
        display: none;
      }
    }
  `]
})
export class FeaturesSectionComponent {
  @Input() isDarkMode = true

  categories: CategoryCard[] = [
    {
      id: 'observability',
      icon: 'pi pi-eye',
      title: 'Observability',
      description: 'Complete visibility into your AI applications. Real-time tracing, cost analytics, and production monitoring to debug faster and optimize spending.',
      highlights: [
        'Real-time tracing & agent debugging',
        'Cost & performance analytics',
        'Production monitoring with alerting',
        'Model drift detection'
      ],
      route: '/features/observability'
    },
    {
      id: 'governance',
      icon: 'pi pi-briefcase',
      title: 'Governance',
      description: 'Manage and govern your AI systems responsibly. Enforce policies, assess risks, and maintain a comprehensive registry of all AI assets.',
      highlights: [
        'Policy engine with auto-evaluation',
        'Risk assessment across 6 dimensions',
        'Evidence collection & review workflow',
        'AI model registry & RBAC'
      ],
      route: '/features/governance'
    },
    {
      id: 'compliance',
      icon: 'pi pi-verified',
      title: 'Compliance',
      description: 'Meet regulatory requirements with confidence. Map controls across EU AI Act, NIST AI RMF, and ISO 42001 with automated evidence collection.',
      highlights: [
        'EU AI Act, NIST AI RMF, ISO 42001',
        'Cross-framework compliance mapping',
        'Automated gap analysis',
        'Compliance heatmap & reporting'
      ],
      route: '/features/compliance'
    },
    {
      id: 'roi',
      icon: 'pi pi-dollar',
      title: 'ROI & Value',
      description: 'Prove AI investment value to the board. Risk-adjusted financial ROI, Value Outcome Units, and Monte Carlo sensitivity analysis for honest forecasting.',
      highlights: [
        'Risk-adjusted financial ROI per agent',
        'Value Outcome Units for business grouping',
        'Alternative comparison (RPA, hire, outsource)',
        'Sensitivity analysis with confidence ranges'
      ],
      route: '/features/roi'
    }
  ]
}
