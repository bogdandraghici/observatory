import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import { DashboardService } from '../../../services/dashboard.service'

@Component({
    selector: 'model-performance-widget',
    templateUrl: './model-performance.component.html',
    styleUrl: './model-performance.component.scss',
    standalone: false
})
export class ModelPerformanceComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hours: number = 7 * 24
  @Input() appId: string = null
  models: any[] = []
  totalModels = 0

  constructor(
    private analyticsService: DashboardService,
    public el: ElementRef,
  ) {}

  populateData(appId: any, hours: any): void {
    this.analyticsService.getModelPerformance(appId, hours).then((data) => {
      this.models = Array.isArray(data) ? data : []
      this.totalModels = this.models.length
    })
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['hours']?.currentValue || this.hours) &&
      (changes['appId']?.currentValue || this.appId)
    ) {
      this.populateData(this.appId, this.hours)
    }
  }

  ngOnDestroy(): void {}

  getErrorSeverity(errorRate: number): string {
    if (errorRate >= 0.1) {return 'danger'}
    if (errorRate >= 0.05) {return 'warn'}
    return 'success'
  }

  getErrorLabel(errorRate: number): string {
    return (errorRate * 100).toFixed(1) + '%'
  }

  formatLatency(ms: number | null): string {
    if (ms == null) {return '-'}
    if (ms < 1000) {return Math.round(ms) + 'ms'}
    return (ms / 1000).toFixed(1) + 's'
  }

}
