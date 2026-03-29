import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterModule } from '@angular/router'

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

interface FooterColumn {
  title: string
  links: FooterLink[]
}

@Component({
  selector: 'footer-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer" [class.footer--light]="!isDarkMode">
      <div class="footer-container">
        <!-- Main Footer Content -->
        <div class="footer-grid">
          <!-- Brand Column -->
          <div class="footer-brand">
            <a routerLink="/" class="footer-logo">
              <img
                [src]="isDarkMode ? 'assets/layout/images/observatory-light.svg' : 'assets/layout/images/observatory-dark.svg'"
                alt="FlowX Observatory"
                height="28"
              />
            </a>
            <p class="footer-tagline">
              The complete observability platform for AI applications.
              Debug, monitor, and optimize your LLM apps with confidence.
            </p>
            <div class="footer-social">
              <a href="https://twitter.com/flowx_ai" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <i class="pi pi-twitter"></i>
              </a>
              <a href="https://www.linkedin.com/company/flowxai" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i class="pi pi-linkedin"></i>
              </a>
            </div>
          </div>

          <!-- Link Columns -->
          @for (column of columns; track column.title) {
            <div class="footer-column">
              <h4 class="footer-column__title">{{ column.title }}</h4>
              <ul class="footer-links">
                @for (link of column.links; track link.href) {
                  <li>
                    @if (link.external) {
                      <a
                        [href]="link.href"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ link.label }}
                      </a>
                    } @else {
                      <a [routerLink]="link.href">{{ link.label }}</a>
                    }
                  </li>
                }
              </ul>
            </div>
          }
        </div>

        <!-- Divider -->
        <hr class="footer-divider" />

        <!-- Bottom Row -->
        <div class="footer-bottom">
          <p class="footer-copyright">
            &copy; {{ currentYear }} FlowX.AI. All rights reserved.
          </p>
          <div class="footer-legal">
            <a href="https://www.flowx.ai/privacy-policy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
            <a href="https://www.flowx.ai/terms-of-service" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      padding: 4rem 1.5rem 2rem;
      background: #090909;
      border-top: 1px solid rgba(255, 255, 255, 0.05);

      @media (min-width: 768px) {
        padding: 5rem 2rem 2rem;
      }

      &--light {
        background: #ffffff;
        border-color: rgba(0, 0, 0, 0.05);
      }
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    // Grid Layout
    .footer-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 3rem;

      @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: 2fr repeat(3, 1fr);
        gap: 4rem;
      }
    }

    // Brand Column
    .footer-brand {
      @media (min-width: 640px) {
        grid-column: span 2;
      }

      @media (min-width: 1024px) {
        grid-column: span 1;
      }
    }

    .footer-logo {
      display: inline-block;
      margin-bottom: 1rem;

      img {
        height: 28px;
        width: auto;
      }
    }

    .footer-tagline {
      font-size: 0.9375rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.5);
      margin: 0 0 1.5rem;
      max-width: 300px;

      .footer--light & {
        color: #6b7280;
      }
    }

    .footer-social {
      display: flex;
      gap: 0.75rem;

      a {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.6);
        transition: all 200ms ease;

        .footer--light & {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.08);
          color: #6b7280;
        }

        &:hover {
          border-color: #fdb913;
          color: #fdb913;
        }

        i {
          font-size: 1rem;
        }
      }
    }

    // Link Columns
    .footer-column {
      &__title {
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #ffffff;
        margin: 0 0 1rem;

        .footer--light & {
          color: #111827;
        }
      }
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 0.625rem;
      }

      a {
        font-size: 0.9375rem;
        color: rgba(255, 255, 255, 0.5);
        text-decoration: none;
        transition: color 200ms ease;

        .footer--light & {
          color: #6b7280;
        }

        &:hover {
          color: #fdb913;
        }
      }
    }

    // Divider
    .footer-divider {
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      margin: 3rem 0 1.5rem;

      .footer--light & {
        border-color: rgba(0, 0, 0, 0.06);
      }
    }

    // Bottom Row
    .footer-bottom {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
      text-align: center;

      @media (min-width: 768px) {
        flex-direction: row;
        justify-content: space-between;
        text-align: left;
      }
    }

    .footer-copyright {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.4);
      margin: 0;

      .footer--light & {
        color: #9ca3af;
      }
    }

    .footer-legal {
      display: flex;
      gap: 1.5rem;

      a {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.4);
        text-decoration: none;
        transition: color 200ms ease;

        .footer--light & {
          color: #9ca3af;
        }

        &:hover {
          color: #fdb913;
        }
      }
    }
  `]
})
export class FooterSectionComponent {
  @Input() isDarkMode = true

  currentYear = new Date().getFullYear()

  columns: FooterColumn[] = [
    {
      title: 'Product',
      links: [
        { label: 'Observability', href: '/features/observability', external: false },
        { label: 'Governance', href: '/features/governance', external: false },
        { label: 'Compliance', href: '/features/compliance', external: false },
        { label: 'Changelog', href: 'https://observatory-docs.theta.flowxai.dev/changelog', external: true }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: 'https://observatory-docs.theta.flowxai.dev', external: true },
        { label: 'API Reference', href: 'https://observatory-docs.theta.flowxai.dev/api', external: true },
        { label: 'Academy', href: 'https://academy.flowx.ai', external: true },
        { label: 'Support', href: 'https://flowxai.zendesk.com', external: true }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: 'https://www.flowx.ai', external: true },
        { label: 'Careers', href: 'https://www.flowx.ai/careers', external: true },
        { label: 'Blog', href: 'https://www.flowx.ai/blog', external: true },
        { label: 'Contact', href: 'https://flowxai.zendesk.com', external: true }
      ]
    }
  ]

  constructor(public router: Router) {}
}
