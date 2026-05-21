import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Meta, Title } from '@angular/platform-browser'
import { FeaturePageComponent, FeatureShowcaseTab } from '../components/feature-page/feature-page.component'
import { MEGA_MENU_CATEGORIES, MegaMenuCategory } from '../data/megamenu-data'

@Component({
  selector: 'observability-page',
  standalone: true,
  imports: [CommonModule, FeaturePageComponent],
  template: `
    <feature-page
      [category]="category"
      [tagline]="tagline"
      [showcaseTabs]="showcaseTabs"
    ></feature-page>
  `
})
export class ObservabilityPageComponent implements OnInit {
  category: MegaMenuCategory = MEGA_MENU_CATEGORIES.find(c => c.id === 'observability') as MegaMenuCategory

  tagline = 'Real-time logging, analytics, and debugging for your LLM applications. Get complete visibility into every agent call, chain execution, and tool invocation across your entire AI stack.'

  showcaseTabs: FeatureShowcaseTab[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      imageDark: '/assets/landing/img/dashboard-dark.png',
      imageLight: '/assets/landing/img/dashboard-light.png',
      description: 'Get a bird\'s eye view of all your AI applications with real-time metrics, cost tracking, and performance insights.'
    },
    {
      id: 'traces',
      label: 'Traces',
      imageDark: '/assets/landing/img/traces-dark.png',
      imageLight: '/assets/landing/img/traces-light.png',
      description: 'Dive deep into individual requests with full trace visibility. See every step of your AI chain with timing and token usage.'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      imageDark: '/assets/landing/img/analytics-dark.png',
      imageLight: '/assets/landing/img/analytics-light.png',
      description: 'Track trends over time with comprehensive analytics. Monitor costs, latency distributions, and error rates.'
    }
  ]

  constructor(private titleService: Title, private metaService: Meta) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX Observatory - Observability')
    this.metaService.updateTag({
      name: 'description',
      content: 'Real-time tracing, analytics, and monitoring for your AI applications. Debug faster, optimize costs, and detect drift.'
    })
  }
}
