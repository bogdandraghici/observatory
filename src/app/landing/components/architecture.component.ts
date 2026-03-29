import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'architecture-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      id="architecture"
      class="architecture-section"
      [class.architecture-section--light]="!isDarkMode"
    >
      <div class="architecture-container">
        <!-- Header -->
        <div class="architecture-header">
          <span class="architecture-label">ARCHITECTURE</span>
          <h2 class="architecture-title">
            How it <span class="text-gold">works</span>
          </h2>
          <p class="architecture-subtitle">
            A simple integration that gives you complete visibility into your AI applications
          </p>
        </div>

        <!-- Diagram -->
        <div class="architecture-diagram">
          <!-- Flow Steps -->
          <div class="architecture-flow">
            <!-- Step 1: Your App -->
            <div class="flow-step">
              <div class="flow-step__icon">
                <i class="pi pi-code"></i>
              </div>
              <div class="flow-step__content">
                <h3 class="flow-step__title">Your AI App</h3>
                <p class="flow-step__description">
                  Integrate with a single line of code using our Python SDK decorators
                </p>
              </div>
            </div>

            <!-- Connector -->
            <div class="flow-connector">
              <div class="flow-connector__line"></div>
              <div class="flow-connector__arrow">
                <i class="pi pi-arrow-right"></i>
              </div>
            </div>

            <!-- Step 2: Observatory API -->
            <div class="flow-step flow-step--highlight">
              <div class="flow-step__icon flow-step__icon--gold">
                <i class="pi pi-eye"></i>
              </div>
              <div class="flow-step__content">
                <h3 class="flow-step__title">Observatory API</h3>
                <p class="flow-step__description">
                  Captures traces, metrics, and logs in real-time
                </p>
              </div>
            </div>

            <!-- Connector -->
            <div class="flow-connector">
              <div class="flow-connector__line"></div>
              <div class="flow-connector__arrow">
                <i class="pi pi-arrow-right"></i>
              </div>
            </div>

            <!-- Step 3: Dashboard -->
            <div class="flow-step">
              <div class="flow-step__icon">
                <i class="pi pi-chart-line"></i>
              </div>
              <div class="flow-step__content">
                <h3 class="flow-step__title">Dashboard</h3>
                <p class="flow-step__description">
                  Visualize, debug, and optimize your LLM applications
                </p>
              </div>
            </div>
          </div>

          <!-- Code Example -->
          <div class="architecture-code">
            <div class="code-header">
              <span class="code-dot code-dot--red"></span>
              <span class="code-dot code-dot--yellow"></span>
              <span class="code-dot code-dot--green"></span>
              <span class="code-filename">agent.py</span>
            </div>
            <pre class="code-content"><code><span class="code-keyword">from</span> observatory <span class="code-keyword">import</span> agent

<span class="code-decorator">&#64;agent</span>
<span class="code-keyword">async def</span> <span class="code-function">my_ai_agent</span>(query: <span class="code-type">str</span>):
    <span class="code-comment"># Your existing code works as-is</span>
    response = <span class="code-keyword">await</span> llm.chat(query)
    <span class="code-keyword">return</span> response</code></pre>
          </div>
        </div>

        <!-- Benefits -->
        <div class="architecture-benefits">
          <div class="benefit-item">
            <i class="pi pi-bolt"></i>
            <span>Zero-config setup</span>
          </div>
          <div class="benefit-item">
            <i class="pi pi-lock"></i>
            <span>Enterprise security</span>
          </div>
          <div class="benefit-item">
            <i class="pi pi-clock"></i>
            <span>Real-time insights</span>
          </div>
          <div class="benefit-item">
            <i class="pi pi-expand"></i>
            <span>Auto-scaling</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .architecture-section {
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

    .architecture-container {
      max-width: 1100px;
      margin: 0 auto;
    }

    // Header
    .architecture-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .architecture-label {
      display: inline-block;
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      color: #fdb913;
      margin-bottom: 1rem;
    }

    .architecture-title {
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin: 0 0 1rem;
      color: #ffffff;

      .architecture-section--light & {
        color: #111827;
      }
    }

    .architecture-subtitle {
      font-size: clamp(1rem, 2vw, 1.25rem);
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.6);
      margin: 0;

      .architecture-section--light & {
        color: #4b5563;
      }
    }

    .text-gold {
      color: #fdb913;
    }

    // Diagram
    .architecture-diagram {
      margin-bottom: 4rem;
    }

    // Flow
    .architecture-flow {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      margin-bottom: 3rem;

      @media (min-width: 768px) {
        flex-direction: row;
        justify-content: center;
        gap: 0;
      }
    }

    .flow-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 1rem;
      width: 100%;
      max-width: 280px;

      .architecture-section--light & {
        background: #ffffff;
        border-color: rgba(0, 0, 0, 0.08);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }

      &--highlight {
        border-color: rgba(253, 185, 19, 0.3);
        background: rgba(253, 185, 19, 0.05);
      }

      &__icon {
        width: 3.5rem;
        height: 3.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        margin-bottom: 1rem;

        .architecture-section--light & {
          background: #f0f1f3;
        }

        i {
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.7);

          .architecture-section--light & {
            color: #4b5563;
          }
        }

        &--gold {
          background: rgba(253, 185, 19, 0.15);

          i {
            color: #fdb913;
          }
        }
      }

      &__title {
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0 0 0.5rem;
        color: #ffffff;

        .architecture-section--light & {
          color: #111827;
        }
      }

      &__description {
        font-size: 0.875rem;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.5);
        margin: 0;

        .architecture-section--light & {
          color: #6b7280;
        }
      }
    }

    .flow-connector {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;

      @media (min-width: 768px) {
        padding: 0 1rem;
      }

      &__line {
        display: none;

        @media (min-width: 768px) {
          display: block;
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, rgba(253, 185, 19, 0.1), rgba(253, 185, 19, 0.5));
        }
      }

      &__arrow {
        i {
          font-size: 1rem;
          color: #fdb913;
          transform: rotate(90deg);

          @media (min-width: 768px) {
            transform: rotate(0);
          }
        }
      }
    }

    // Code Example
    .architecture-code {
      max-width: 500px;
      margin: 0 auto;
      background: #1a1721;
      border-radius: 0.75rem;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);

      .architecture-section--light & {
        background: #1e1e2e;
      }
    }

    .code-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: rgba(0, 0, 0, 0.3);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .code-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;

      &--red { background: #ff5f56; }
      &--yellow { background: #ffbd2e; }
      &--green { background: #27ca40; }
    }

    .code-filename {
      margin-left: auto;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.4);
    }

    .code-content {
      padding: 1.25rem;
      margin: 0;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.875rem;
      line-height: 1.6;
      color: #e0e0e0;
      overflow-x: auto;

      code {
        display: block;
      }
    }

    .code-keyword { color: #c678dd; }
    .code-decorator { color: #fdb913; }
    .code-function { color: #61afef; }
    .code-type { color: #98c379; }
    .code-comment { color: #5c6370; font-style: italic; }

    // Benefits
    .architecture-benefits {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1.5rem;

      @media (min-width: 768px) {
        gap: 3rem;
      }
    }

    .benefit-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9375rem;
      color: rgba(255, 255, 255, 0.6);

      .architecture-section--light & {
        color: #4b5563;
      }

      i {
        color: #fdb913;
        font-size: 1rem;
      }
    }
  `]
})
export class ArchitectureSectionComponent {
  @Input() isDarkMode = true
}
