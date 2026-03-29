import { Component, OnInit, OnDestroy } from '@angular/core'
import { StatusService, PlatformStatus } from './status.service'

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  standalone: false,
  styles: [`
    .status-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
      background: #090909;
      font-family: 'Inter var', 'Inter', sans-serif;
    }

    .status-bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .status-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    .status-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
    }

    .status-glow--1 {
      width: 500px;
      height: 500px;
      top: 10%;
      left: 50%;
      transform: translateX(-50%);
      background: radial-gradient(circle, rgba(253, 185, 19, 0.08) 0%, transparent 70%);
    }

    .status-glow--2 {
      width: 300px;
      height: 300px;
      bottom: 10%;
      right: 20%;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
    }

    .status-content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2rem;
      max-width: 560px;
      width: 100%;
    }

    .status-logo {
      width: auto;
      height: 3rem;
      margin-bottom: 1.5rem;
      opacity: 0.6;
    }

    .status-heading {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #fdb913 0%, rgba(253, 185, 19, 0.4) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 1.5rem 0;
    }

    /* Loading & Error */
    .status-loading, .status-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }

    .status-loading__text, .status-error__text {
      color: rgba(255,255,255,0.5);
      font-size: 0.9375rem;
      margin: 0;
    }

    /* Overall Banner */
    .status-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 1.5rem;
      width: 100%;
      justify-content: center;
    }

    .status-banner--operational {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #22c55e;
    }

    .status-banner--partial_outage {
      background: rgba(253, 185, 19, 0.1);
      border: 1px solid rgba(253, 185, 19, 0.25);
      color: #fdb913;
    }

    .status-banner--major_outage {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
    }

    /* Service Cards */
    .status-services {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
      margin-bottom: 1.25rem;
    }

    .status-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 1rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 0.625rem;
      transition: border-color 0.2s ease;
    }

    .status-card:hover {
      border-color: rgba(255,255,255,0.12);
    }

    .status-card__left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status-card__name {
      color: #fff;
      font-weight: 500;
      font-size: 0.9375rem;
      text-align: left;
    }

    .status-card__desc {
      color: rgba(255,255,255,0.4);
      font-size: 0.8125rem;
      text-align: left;
    }

    .status-card__right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status-card__latency {
      color: rgba(255,255,255,0.35);
      font-size: 0.8125rem;
      font-variant-numeric: tabular-nums;
    }

    /* Status dot */
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .status-dot--operational {
      background: #22c55e;
      box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
    }

    .status-dot--down {
      background: #ef4444;
      box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
    }

    /* Badge */
    .status-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
    }

    .status-badge--operational {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }

    .status-badge--down {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }

    /* Meta */
    .status-meta {
      color: rgba(255,255,255,0.3);
      font-size: 0.8125rem;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
    }

    /* Auto-refresh toggle */
    .status-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      margin-bottom: 2rem;
    }

    .status-toggle input[type="checkbox"] {
      accent-color: #fdb913;
      width: 1rem;
      height: 1rem;
    }

    .status-toggle__label {
      color: rgba(255,255,255,0.45);
      font-size: 0.8125rem;
    }

    /* Buttons */
    .status-nav {
      display: flex;
      gap: 1rem;
    }

    .status-btn {
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
      border: none;
    }

    .status-btn--primary {
      background: linear-gradient(135deg, #fdb913 0%, #cc950f 100%);
      color: #1a1a1a;
      box-shadow: 0 4px 14px rgba(253, 185, 19, 0.3);
    }

    .status-btn--primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(253, 185, 19, 0.4);
    }

    .status-btn--secondary {
      background: transparent;
      color: #ffffff;
      border: 1px solid rgba(255,255,255,0.15);
    }

    .status-btn--secondary:hover {
      border-color: rgba(253, 185, 19, 0.5);
      color: #fdb913;
    }

    @media (max-width: 480px) {
      .status-heading { font-size: 1.5rem; }
      .status-nav { flex-direction: column; width: 100%; }
      .status-btn { justify-content: center; }
      .status-card { flex-direction: column; gap: 0.5rem; align-items: flex-start; }
      .status-card__right { align-self: flex-end; }
    }
  `]
})
export class StatusComponent implements OnInit, OnDestroy {
  data: PlatformStatus | null = null
  loading = false
  error = false
  autoRefresh = true

  private intervalId: any = null

  constructor(private statusService: StatusService) {}

  ngOnInit(): void {
    this.refresh()
    this.startAutoRefresh()
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh()
  }

  get overallIcon(): string {
    if (!this.data) {return 'pi pi-spinner pi-spin'}
    switch (this.data.overall_status) {
      case 'operational': return 'pi pi-check-circle'
      case 'partial_outage': return 'pi pi-exclamation-triangle'
      case 'major_outage': return 'pi pi-times-circle'
      default: return 'pi pi-question-circle'
    }
  }

  get overallLabel(): string {
    if (!this.data) {return 'Checking...'}
    switch (this.data.overall_status) {
      case 'operational': return 'All Systems Operational'
      case 'partial_outage': return 'Partial Outage'
      case 'major_outage': return 'Major Outage'
      default: return 'Unknown'
    }
  }

  async refresh(): Promise<any> {
    this.loading = true
    this.error = false
    try {
      this.data = await this.statusService.getStatus()
    } catch {
      this.error = true
    } finally {
      this.loading = false
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh
    if (this.autoRefresh) {
      this.startAutoRefresh()
    } else {
      this.stopAutoRefresh()
    }
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh()
    if (this.autoRefresh) {
      this.intervalId = setInterval(() => this.refresh(), 30000)
    }
  }

  private stopAutoRefresh(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
