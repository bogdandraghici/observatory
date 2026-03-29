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
    selector: 'correctness-overview-widget',
    templateUrl: './correctness-overview.component.html',
    styleUrl: './correctness-overview.component.scss',
    standalone: false
})
export class CorrectnessOverviewComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hours: number = 7 * 24
  @Input() appId: string = null
  goodCount = 0
  neutralCount = 0
  badCount = 0
  totalRated = 0
  goodPercent = 0

  constructor(
    private analyticsService: DashboardService,
    public el: ElementRef,
  ) {}

  populateData(appId: any, hours: any): void {
    this.analyticsService.getCorrectnessStats(appId, hours).then((data) => {
      const items = Array.isArray(data) ? data : []
      this.goodCount = 0
      this.neutralCount = 0
      this.badCount = 0

      items.forEach(item => {
        if (item.correctness === 1) {this.goodCount = item.count}
        else if (item.correctness === 0) {this.neutralCount = item.count}
        else if (item.correctness === -1) {this.badCount = item.count}
      })

      this.totalRated = this.goodCount + this.neutralCount + this.badCount
      this.goodPercent = this.totalRated > 0
        ? Math.round((this.goodCount / this.totalRated) * 100)
        : 0
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

}
