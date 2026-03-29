import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Meta, Title } from '@angular/platform-browser'
import { FeaturePageComponent, FeatureShowcaseTab } from '../components/feature-page/feature-page.component'
import { MEGA_MENU_CATEGORIES, MegaMenuCategory } from '../data/megamenu-data'

@Component({
  selector: 'roi-page',
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
export class RoiPageComponent implements OnInit {
  category: MegaMenuCategory = MEGA_MENU_CATEGORIES.find(c => c.id === 'roi') as MegaMenuCategory

  tagline = 'Justify AI spend with risk-adjusted ROI, compliance audit trail savings, alternative cost comparisons, and Monte Carlo sensitivity analysis. Group agents by Value Outcome Units to translate technical metrics into board-level business language.'

  showcaseTabs: FeatureShowcaseTab[] = [
    {
      id: 'value-outcomes',
      label: 'Value Outcomes',
      imageDark: '/assets/landing/img/roi-value-outcomes-dark.png',
      imageLight: '/assets/landing/img/roi-value-outcomes-light.png',
      description: 'Group agents by Value Outcome Unit — Customer Onboarding, Fraud Detection, Claims Processing — to show ROI aligned to business objectives. Compare labor saved vs LLM cost vs net contribution per outcome with per-agent breakdowns.'
    },
    {
      id: 'financial',
      label: 'Financial ROI',
      imageDark: '/assets/landing/img/roi-financial-dark.png',
      imageLight: '/assets/landing/img/roi-financial-light.png',
      description: 'Per-agent and per-project financial ROI with monthly savings, payback period, annual ROI %, and 5-year NPV. Group results by Value Outcome Units to show combined business impact.'
    },
    {
      id: 'compliance',
      label: 'Compliance ROI',
      imageDark: '/assets/landing/img/roi-compliance-dark.png',
      imageLight: '/assets/landing/img/roi-compliance-light.png',
      description: 'Quantify the financial value of automated governance — audit labor savings, regulatory response time reduction, and risk mitigation from evidence collection and policy enforcement.'
    },
    {
      id: 'sensitivity',
      label: 'Sensitivity',
      imageDark: '/assets/landing/img/roi-sensitivity-dark.png',
      imageLight: '/assets/landing/img/roi-sensitivity-light.png',
      description: 'Monte Carlo simulations across your ROI inputs showing conservative, base, and optimistic scenarios. Present confidence ranges to executives instead of single-point estimates.'
    }
  ]

  constructor(private titleService: Title, private metaService: Meta) {}

  ngOnInit(): void {
    this.titleService.setTitle('FlowX Observatory - ROI & Value Outcomes')
    this.metaService.updateTag({
      name: 'description',
      content: 'Prove AI investment value with risk-adjusted ROI, Value Outcome Units, compliance savings, alternative comparisons, and sensitivity analysis.'
    })
  }
}
