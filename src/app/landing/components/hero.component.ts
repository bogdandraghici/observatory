import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { ButtonModule } from 'primeng/button'

@Component({
  selector: 'hero-section',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <section class="hero" [class.hero--light]="!isDarkMode">
      <!-- Animated gradient background -->
      <div class="hero__bg"></div>

      <!-- Floating particles -->
      <div class="hero__particles">
        @for (particle of particles; track $index) {
          <span class="particle"></span>
        }
      </div>

      <!-- Content -->
      <div class="hero__content">
        <div class="hero__container">
          <!-- Label -->
          <div class="hero__label animate-fade-up">
            <span class="hero__label-icon">&#9733;</span>
            FLOWX OBSERVATORY 2.0
          </div>

          <!-- Main Headline -->
          <h1 class="hero__title animate-fade-up animate-delay-1">
            <span class="hero__title-light">Observe Your</span>
            <br />
            <span class="hero__title-accent">
              <span class="hero__star">&#10022;</span> AI Agents
            </span>
          </h1>

          <!-- Subheadline -->
          <p class="hero__subtitle animate-fade-up animate-delay-2">
            Complete observability, governance, and compliance for your AI applications.
            <br class="hide-mobile" />
            From real-time tracing to regulatory readiness — all in one platform.
          </p>

          <!-- CTA Buttons -->
          <div class="hero__actions animate-fade-up animate-delay-3">
            <button
              class="landing-btn landing-btn--primary landing-btn--lg"
              (click)="router.navigate(['/ai/'])"
            >
              Get Started
              <i class="pi pi-arrow-right"></i>
            </button>
            <button
              class="landing-btn landing-btn--secondary landing-btn--lg"
              (click)="scrollToSection('showcase')"
            >
              View Demo
              <i class="pi pi-play"></i>
            </button>
          </div>

          <!-- Trust indicators -->
          <div class="hero__trust animate-fade-up animate-delay-4">
            <div class="hero__trust-item">
              <i class="pi pi-check-circle"></i>
              <span>Enterprise ready</span>
            </div>
            <div class="hero__trust-item">
              <i class="pi pi-check-circle"></i>
              <span>EU AI Act & NIST compliant</span>
            </div>
            <div class="hero__trust-item">
              <i class="pi pi-check-circle"></i>
              <span>Self-hosted or cloud</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="hero__scroll">
        <div class="hero__scroll-line"></div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 6rem 1.5rem 4rem;

      @media (min-width: 768px) {
        padding: 8rem 2rem 4rem;
      }
    }

    // Animated gradient background
    .hero__bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        #090909 0%,
        #141517 20%,
        #1a1721 40%,
        rgba(253, 185, 19, 0.03) 60%,
        #1a1721 80%,
        #090909 100%
      );
      background-size: 400% 400%;
      animation: gradientShift 20s ease infinite;

      .hero--light & {
        background: linear-gradient(
          135deg,
          #ffffff 0%,
          #f8f9fa 20%,
          #f0f1f3 40%,
          rgba(253, 185, 19, 0.05) 60%,
          #f0f1f3 80%,
          #ffffff 100%
        );
        background-size: 400% 400%;
      }
    }

    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    // Floating particles
    .hero__particles {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;

      .particle {
        position: absolute;
        border-radius: 50%;
        background: #feb913;
        animation: twinkle 4s ease-in-out infinite;

        // Large bright stars
        &:nth-child(1) { width: 6px; height: 6px; top: 12%; left: 22%; animation-delay: 0s; animation-duration: 3.5s; box-shadow: 0 0 8px 2px rgba(253, 185, 19, 0.4); }
        &:nth-child(2) { width: 5px; height: 5px; top: 18%; left: 78%; animation-delay: 0.7s; animation-duration: 4.2s; box-shadow: 0 0 6px 2px rgba(253, 185, 19, 0.3); }
        &:nth-child(3) { width: 6px; height: 6px; top: 62%; left: 8%; animation-delay: 1.2s; animation-duration: 3.8s; box-shadow: 0 0 8px 2px rgba(253, 185, 19, 0.4); }
        &:nth-child(4) { width: 4px; height: 4px; top: 28%; left: 52%; animation-delay: 1.8s; animation-duration: 4.5s; box-shadow: 0 0 6px 1px rgba(253, 185, 19, 0.3); }
        &:nth-child(5) { width: 5px; height: 5px; top: 72%; left: 68%; animation-delay: 2.2s; animation-duration: 3.6s; box-shadow: 0 0 6px 2px rgba(253, 185, 19, 0.3); }

        // Medium stars
        &:nth-child(6) { width: 4px; height: 4px; top: 82%; left: 32%; animation-delay: 0.3s; animation-duration: 5s; box-shadow: 0 0 5px 1px rgba(253, 185, 19, 0.25); }
        &:nth-child(7) { width: 4px; height: 4px; top: 8%; left: 42%; animation-delay: 1s; animation-duration: 4s; box-shadow: 0 0 5px 1px rgba(253, 185, 19, 0.25); }
        &:nth-child(8) { width: 3px; height: 3px; top: 48%; left: 88%; animation-delay: 0.5s; animation-duration: 4.8s; box-shadow: 0 0 4px 1px rgba(253, 185, 19, 0.2); }
        &:nth-child(9) { width: 4px; height: 4px; top: 88%; left: 58%; animation-delay: 1.5s; animation-duration: 3.4s; box-shadow: 0 0 5px 1px rgba(253, 185, 19, 0.25); }
        &:nth-child(10) { width: 3px; height: 3px; top: 38%; left: 12%; animation-delay: 2s; animation-duration: 5.2s; box-shadow: 0 0 4px 1px rgba(253, 185, 19, 0.2); }

        // Small accent stars
        &:nth-child(11) { width: 3px; height: 3px; top: 22%; left: 33%; animation-delay: 0.4s; animation-duration: 4.6s; box-shadow: 0 0 4px 1px rgba(253, 185, 19, 0.2); }
        &:nth-child(12) { width: 3px; height: 3px; top: 55%; left: 62%; animation-delay: 1.1s; animation-duration: 3.9s; box-shadow: 0 0 4px 1px rgba(253, 185, 19, 0.2); }
        &:nth-child(13) { width: 5px; height: 5px; top: 76%; left: 18%; animation-delay: 0.8s; animation-duration: 4.3s; box-shadow: 0 0 6px 2px rgba(253, 185, 19, 0.3); }
        &:nth-child(14) { width: 3px; height: 3px; top: 33%; left: 73%; animation-delay: 1.6s; animation-duration: 5.1s; box-shadow: 0 0 4px 1px rgba(253, 185, 19, 0.2); }
        &:nth-child(15) { width: 4px; height: 4px; top: 92%; left: 42%; animation-delay: 2.4s; animation-duration: 3.7s; box-shadow: 0 0 5px 1px rgba(253, 185, 19, 0.25); }

        // Extra stars for density
        &:nth-child(16) { width: 5px; height: 5px; top: 5%; left: 65%; animation-delay: 0.2s; animation-duration: 4.1s; box-shadow: 0 0 6px 2px rgba(253, 185, 19, 0.3); }
        &:nth-child(17) { width: 3px; height: 3px; top: 45%; left: 38%; animation-delay: 1.4s; animation-duration: 4.7s; box-shadow: 0 0 4px 1px rgba(253, 185, 19, 0.2); }
        &:nth-child(18) { width: 6px; height: 6px; top: 68%; left: 92%; animation-delay: 0.6s; animation-duration: 3.3s; box-shadow: 0 0 8px 2px rgba(253, 185, 19, 0.4); }
        &:nth-child(19) { width: 3px; height: 3px; top: 15%; left: 5%; animation-delay: 1.9s; animation-duration: 5.3s; box-shadow: 0 0 4px 1px rgba(253, 185, 19, 0.2); }
        &:nth-child(20) { width: 4px; height: 4px; top: 52%; left: 48%; animation-delay: 2.1s; animation-duration: 4.4s; box-shadow: 0 0 5px 1px rgba(253, 185, 19, 0.25); }
      }
    }

    @keyframes twinkle {
      0%, 100% { opacity: 0.15; transform: scale(0.8); }
      50% { opacity: 0.8; transform: scale(1.3); }
    }

    // Content
    .hero__content {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 1100px;
      text-align: center;
    }

    .hero__container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    // Label
    .hero__label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      color: #feb913;
      margin-bottom: 1.5rem;
      padding: 0.5rem 1rem;
      background: rgba(253, 185, 19, 0.1);
      border-radius: 2rem;
      border: 1px solid rgba(253, 185, 19, 0.2);
    }

    .hero__label-icon {
      font-size: 1rem;
    }

    // Title
    .hero__title {
      font-size: clamp(2.5rem, 10vw, 5.5rem);
      font-weight: 700;
      line-height: 1.05;
      letter-spacing: -0.03em;
      margin: 0 0 1.5rem;
      color: #ffffff;

      .hero--light & {
        color: #111827;
      }
    }

    .hero__title-light {
      font-weight: 400;
      opacity: 0.9;
    }

    .hero__title-accent {
      display: inline-flex;
      align-items: center;
      gap: 0.25em;
    }

    .hero__star {
      color: #feb913;
      font-size: 0.8em;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    // Subtitle
    .hero__subtitle {
      font-size: clamp(1.125rem, 2.5vw, 1.5rem);
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 2.5rem;
      max-width: 700px;

      .hero--light & {
        color: #4b5563;
      }
    }

    // Actions
    .hero__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 3rem;

      @media (max-width: 480px) {
        flex-direction: column;
        width: 100%;
        max-width: 300px;

        .landing-btn {
          width: 100%;
        }
      }
    }

    // Trust indicators
    .hero__trust {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      justify-content: center;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.875rem;

      .hero--light & {
        color: #6b7280;
      }
    }

    .hero__trust-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      i {
        color: #feb913;
        font-size: 1rem;
      }
    }

    // Scroll indicator
    .hero__scroll {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.3);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;

      .hero--light & {
        color: rgba(0, 0, 0, 0.3);
      }
    }

    .hero__scroll-line {
      width: 1px;
      height: 40px;
      background: linear-gradient(to bottom, #feb913, transparent);
      animation: scrollPulse 2s ease-in-out infinite;
    }

    @keyframes scrollPulse {
      0%, 100% { opacity: 0.5; height: 40px; }
      50% { opacity: 1; height: 50px; }
    }

    // Animation utilities
    .animate-fade-up {
      animation: fadeUp 0.8s ease-out forwards;
      opacity: 0;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-delay-1 { animation-delay: 0.1s; }
    .animate-delay-2 { animation-delay: 0.2s; }
    .animate-delay-3 { animation-delay: 0.3s; }
    .animate-delay-4 { animation-delay: 0.4s; }

    .hide-mobile {
      @media (max-width: 767px) {
        display: none;
      }
    }

    // Button styles (from global, but scoped here for standalone)
    .landing-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1.75rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 0.75rem;
      border: none;
      cursor: pointer;
      transition: all 150ms ease;
      text-decoration: none;

      &--primary {
        background: linear-gradient(135deg, #feb913 0%, #b4830d 100%);
        color: #1a1a1a;
        box-shadow: 0 4px 14px rgba(253, 185, 19, 0.3);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(253, 185, 19, 0.4);
        }
      }

      &--secondary {
        background: transparent;
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.2);

        .hero--light & {
          color: #111827;
          border-color: rgba(0, 0, 0, 0.15);
        }

        &:hover {
          border-color: #feb913;
          color: #feb913;
        }
      }

      &--lg {
        padding: 1rem 2rem;
        font-size: 1.125rem;
      }
    }
  `]
})
export class HeroSectionComponent {
  @Input() isDarkMode = true

  particles = Array(20).fill(0)

  constructor(public router: Router) {}

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
}
