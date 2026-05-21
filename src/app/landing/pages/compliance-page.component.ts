import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Meta, Title } from '@angular/platform-browser'
import { FeaturePageComponent, FeatureShowcaseTab } from '../components/feature-page/feature-page.component'
import { MEGA_MENU_CATEGORIES, MegaMenuCategory } from '../data/megamenu-data'

@Component({
  selector: 'compliance-page',
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
export class CompliancePageComponent implements OnInit {
  category: MegaMenuCategory = MEGA_MENU_CATEGORIES.find(c => c.id === 'compliance') as MegaMenuCategory

  tagline = 'Meet EU AI Act, NIST AI RMF, and ISO 42001 requirements with automated mapping, gap analysis, and continuous compliance monitoring across all your AI applications.'

  showcaseTabs: FeatureShowcaseTab[] = [
    {
      id: 'dashboard',
      label: 'Compliance Dashboard',
      imageDark: '/assets/landing/img/compliance-dark.png',
      imageLight: '/assets/landing/img/compliance-light.png',
      description: 'See your compliance posture at a glance. Heatmaps and progress indicators across EU AI Act, NIST, and ISO 42001 frameworks.'
    },
    {
      id: 'requirements',
      label: 'Requirements',
      imageDark: '/assets/landing/img/requirements-dark.png',
      imageLight: '/assets/landing/img/requirements-light.png',
      description: 'Browse detailed requirements for each regulatory framework. Track status, assign owners, and link evidence to each requirement.'
    },
    {
      id: 'gaps',
      label: 'Gap Analysis',
      imageDark: '/assets/landing/img/gap-analysis-dark.png',
      imageLight: '/assets/landing/img/gap-analysis-light.png',
      description: 'Identify compliance gaps with prioritized remediation steps. Get actionable recommendations to close gaps across frameworks.'
    }
  ]

  constructor(private titleService: Title, private metaService: Meta) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX Observatory - Compliance')
    this.metaService.updateTag({
      name: 'description',
      content: 'Meet EU AI Act, NIST AI RMF, and ISO 42001 requirements with automated compliance mapping, gap analysis, and heatmaps.'
    })
  }
}
