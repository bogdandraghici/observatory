import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Meta, Title } from '@angular/platform-browser'
import { FeaturePageComponent, FeatureShowcaseTab } from '../components/feature-page/feature-page.component'
import { MEGA_MENU_CATEGORIES, MegaMenuCategory } from '../data/megamenu-data'

@Component({
  selector: 'governance-page',
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
export class GovernancePageComponent implements OnInit {
  category: MegaMenuCategory = MEGA_MENU_CATEGORIES.find(c => c.id === 'governance') as MegaMenuCategory

  tagline = 'Enforce policies, assess risks, and manage your AI portfolio with a comprehensive governance framework. From policy definition to evidence collection, keep your AI systems accountable.'

  showcaseTabs: FeatureShowcaseTab[] = [
    {
      id: 'policies',
      label: 'Policies',
      imageDark: '/assets/landing/img/policies-dark.png',
      imageLight: '/assets/landing/img/policies-light.png',
      description: 'Define and enforce governance policies across your AI applications. Assign policy packs and track compliance automatically.'
    },
    {
      id: 'risk',
      label: 'Risk Dashboard',
      imageDark: '/assets/landing/img/risk-dark.png',
      imageLight: '/assets/landing/img/risk-light.png',
      description: 'Assess and monitor risk across 6 dimensions. Get a comprehensive view of your AI risk posture with actionable insights.'
    },
    {
      id: 'evidence',
      label: 'Evidence',
      imageDark: '/assets/landing/img/evidence-dark.png',
      imageLight: '/assets/landing/img/evidence-light.png',
      description: 'Collect, review, and approve evidence for governance requirements. Automated collection and gap analysis streamline compliance.'
    }
  ]

  constructor(private titleService: Title, private metaService: Meta) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX Observatory - Governance')
    this.metaService.updateTag({
      name: 'description',
      content: 'AI governance with policy engine, risk assessment, evidence collection, and audit trails. Manage your AI systems responsibly.'
    })
  }
}
