import { Component } from '@angular/core'

@Component({
    selector: 'app-notfound',
    templateUrl: './notfound.component.html',
    standalone: false,
    styles: [`
      .notfound-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        overflow: hidden;
        background: #090909;
        font-family: 'Inter var', 'Inter', sans-serif;
      }

      .notfound-bg {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .notfound-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
        background-size: 40px 40px;
      }

      .notfound-glow {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
      }

      .notfound-glow--1 {
        width: 500px;
        height: 500px;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: radial-gradient(circle, rgba(0, 107, 216, 0.08) 0%, transparent 70%);
      }

      .notfound-glow--2 {
        width: 300px;
        height: 300px;
        bottom: 10%;
        right: 20%;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
      }

      .notfound-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 2rem;
        max-width: 480px;
      }

      .notfound-logo {
        width: auto;
        height: 3rem;
        margin-bottom: 2.5rem;
        opacity: 0.6;
      }

      .notfound-code {
        font-size: 8rem;
        font-weight: 700;
        line-height: 1;
        letter-spacing: -0.04em;
        background: linear-gradient(135deg, #006bd8 0%, rgba(0, 107, 216, 0.4) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 0.5rem;
      }

      .notfound-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #ffffff;
        margin: 0 0 0.75rem 0;
        letter-spacing: -0.01em;
      }

      .notfound-subtitle {
        font-size: 1.0625rem;
        color: rgba(255,255,255,0.5);
        line-height: 1.6;
        margin: 0 0 2.5rem 0;
      }

      .notfound-actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 2.5rem;
      }

      .notfound-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        font-size: 0.9375rem;
        font-weight: 600;
        border-radius: 0.75rem;
        text-decoration: none;
        transition: all 0.2s ease;
        cursor: pointer;
      }

      .notfound-btn--primary {
        background: linear-gradient(135deg, #006bd8 0%, #004c99 100%);
        color: #1a1a1a;
        box-shadow: 0 4px 14px rgba(0, 107, 216, 0.3);
      }

      .notfound-btn--primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 107, 216, 0.4);
      }

      .notfound-btn--secondary {
        background: transparent;
        color: #ffffff;
        border: 1px solid rgba(255,255,255,0.15);
      }

      .notfound-btn--secondary:hover {
        border-color: rgba(0, 107, 216, 0.5);
        color: #006bd8;
      }

      .notfound-links {
        display: flex;
        align-items: center;
        gap: 1.25rem;
      }

      .notfound-links__divider {
        width: 1px;
        height: 1rem;
        background: rgba(255,255,255,0.1);
      }

      .notfound-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: rgba(255,255,255,0.4);
        font-size: 0.875rem;
        text-decoration: none;
        transition: color 0.2s ease;
      }

      .notfound-link:hover {
        color: rgba(0, 107, 216, 0.8);
      }

      .notfound-link__external {
        font-size: 0.7rem;
        opacity: 0.6;
      }

      @media (max-width: 480px) {
        .notfound-code {
          font-size: 5rem;
        }

        .notfound-actions {
          flex-direction: column;
          width: 100%;
        }

        .notfound-btn {
          justify-content: center;
        }
      }
    `]
})
export class NotfoundComponent { }
