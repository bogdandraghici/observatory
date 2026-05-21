import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'

@Component({
  selector: 'join-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="cta-section">
      <!-- Pattern overlay -->
      <div class="cta-pattern"></div>

      <div class="cta-container">
        <div class="cta-content">
          <!-- Badge -->
          <div class="cta-badge">
            <i class="pi pi-star-fill"></i>
            <span>FlowX.AI Platform</span>
          </div>

          <!-- Headline -->
          <h2 class="cta-title">
            Start observing your<br />
            AI applications today
          </h2>

          <!-- Subtitle -->
          <p class="cta-subtitle">
            Get complete visibility into your LLM applications in minutes.
            Observability, governance, and compliance in one platform.
          </p>

          <!-- Actions -->
          <div class="cta-actions">
            <button class="cta-btn cta-btn--primary" (click)="router.navigate(['/ai/'])">
              Open Observatory
              <i class="pi pi-arrow-right"></i>
            </button>
          </div>

          <!-- Trust note -->
          <p class="cta-trust">
            <i class="pi pi-verified"></i>
            Enterprise-grade security and privacy
          </p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .cta-section {
      position: relative;
      padding: 6rem 1.5rem;
      background: linear-gradient(135deg, #feb913 0%, #e5a810 50%, #b4830d 100%);
      overflow: hidden;

      @media (min-width: 768px) {
        padding: 8rem 2rem;
      }
    }

    .cta-pattern {
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      pointer-events: none;
    }

    .cta-container {
      position: relative;
      z-index: 1;
      max-width: 800px;
      margin: 0 auto;
    }

    .cta-content {
      text-align: center;
    }

    .cta-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 2rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 1.5rem;

      i {
        font-size: 0.875rem;
      }
    }

    .cta-title {
      font-size: clamp(2rem, 6vw, 3.5rem);
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: -0.02em;
      color: #1a1a1a;
      margin: 0 0 1.25rem;
    }

    .cta-subtitle {
      font-size: clamp(1rem, 2vw, 1.25rem);
      line-height: 1.6;
      color: rgba(0, 0, 0, 0.7);
      margin: 0 0 2rem;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 2rem;

      @media (max-width: 480px) {
        flex-direction: column;
        align-items: center;
      }
    }

    .cta-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      font-size: 1.0625rem;
      font-weight: 600;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 200ms ease;

      &--primary {
        background: #1a1a1a;
        color: #ffffff;
        border: none;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);

        &:hover {
          background: #2a2a2a;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }
      }

      &--secondary {
        background: transparent;
        color: #1a1a1a;
        border: 2px solid rgba(0, 0, 0, 0.2);

        &:hover {
          background: rgba(0, 0, 0, 0.1);
          border-color: rgba(0, 0, 0, 0.3);
        }
      }

      @media (max-width: 480px) {
        width: 100%;
        max-width: 280px;
      }
    }

    .cta-trust {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      margin: 0;

      i {
        color: rgba(0, 0, 0, 0.7);
      }
    }
  `]
})
export class JoinSectionComponent {
  constructor(public router: Router) {}

  openDiscord(): void {
    window.open('https://discord.gg/Gm3Dv7YjbW', '_blank')
  }
}
