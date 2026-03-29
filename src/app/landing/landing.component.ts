import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import {

  LayoutService,
} from 'src/app/layout/full-layout/service/app.layout.service'
import { StarsService } from './utils/stars.service'
import { AppConfigService } from '../app.config'
import { Subscription } from 'rxjs'
import { Meta, Title } from '@angular/platform-browser'

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss',
    standalone: false
})
export class LandingComponent implements OnInit {
  get tableTheme(): any {
    return this.configService.config().tableTheme
  }

  isDarkMode = true
  subscription!: Subscription

  constructor(
    private configService: AppConfigService,
    private metaService: Meta,
    private titleService: Title,
    public layoutService: LayoutService,
    public router: Router,
    private starsService: StarsService,
    private readonly appConfigService: AppConfigService,
  ) {}
  get landingClass(): any {
    return {
      'layout-dark': this.isDarkMode,
      'layout-light': !this.isDarkMode,
      'layout-news-active': this.isNewsActive,
    }
  }

  get isNewsActive(): any {
    return this.configService.state.newsActive
  }

  ngOnInit(): void {
    this.isDarkMode = true
    this.appConfigService.config.update(c => ({ ...c, darkMode: true }))
    this.starsService.initGraph()
    this.titleService.setTitle('FlowX.AI Observatory - Home')
    this.metaService.updateTag({
      name: 'description',
      content:
        'The ultimate LLM observatory for AI Agents.',
    })
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode
    this.appConfigService.config.update(c => ({ ...c, darkMode: this.isDarkMode }))
  }
}
