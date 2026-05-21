import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LandingRoutingModule } from './landing-routing.module'
import { LandingComponent } from './landing.component'
import { StyleClassModule } from 'primeng/styleclass'
import { DividerModule } from 'primeng/divider'
import { ChartModule } from 'primeng/chart'
import { PanelModule } from 'primeng/panel'
import { ButtonModule } from 'primeng/button'

// Components
import { AppNewsComponent } from './components/news/app.news.component'
import { AppTopBarComponent } from './components/topbar/app.topbar.component'
import { HeroSectionComponent } from './components/hero.component'
import { FeaturesSectionComponent } from './components/featuressection.component'
import { ShowcaseSectionComponent } from './components/showcase.component'
import { StatsSectionComponent } from './components/stats.component'
import { ArchitectureSectionComponent } from './components/architecture.component'
import { JoinSectionComponent } from './components/join.component'
import { FooterSectionComponent } from './components/footersection.component'
import { FeatureLayoutComponent } from './components/feature-layout/feature-layout.component'
import { FeaturePageComponent } from './components/feature-page/feature-page.component'
import { ObservabilityPageComponent } from './pages/observability-page.component'
import { GovernancePageComponent } from './pages/governance-page.component'
import { CompliancePageComponent } from './pages/compliance-page.component'

// Icons
import { NgIconsModule } from '@ng-icons/core'
import {
  bootstrapStars,
  bootstrapCheckCircleFill,
} from '@ng-icons/bootstrap-icons'

// All landing page standalone components
const landingComponents = [
  AppTopBarComponent,
  AppNewsComponent,
  HeroSectionComponent,
  FeaturesSectionComponent,
  ShowcaseSectionComponent,
  StatsSectionComponent,
  ArchitectureSectionComponent,
  JoinSectionComponent,
  FooterSectionComponent,
  FeatureLayoutComponent,
  FeaturePageComponent,
  ObservabilityPageComponent,
  GovernancePageComponent,
  CompliancePageComponent,
]

@NgModule({
  imports: [
    CommonModule,
    LandingRoutingModule,
    DividerModule,
    StyleClassModule,
    ChartModule,
    PanelModule,
    ButtonModule,
    ...landingComponents,
    NgIconsModule.withIcons({ bootstrapStars, bootstrapCheckCircleFill }),
  ],
  declarations: [LandingComponent],
})
export class LandingModule {}
