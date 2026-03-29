import { CommonModule } from '@angular/common'
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  afterNextRender,
  DOCUMENT
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { DomHandler } from 'primeng/dom'
import { StyleClassModule } from 'primeng/styleclass'

import { AppConfigService } from '../../../app.config'
import { LayoutService } from 'src/app/layout/full-layout/service/app.layout.service'
import { ButtonModule } from 'primeng/button'
import { MEGA_MENU_CATEGORIES, MegaMenuCategory } from '../../data/megamenu-data'

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, StyleClassModule, RouterModule, ButtonModule],
  styles: [`
    :host {
      display: contents;
    }

    .layout-topbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      background: transparent;
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 300ms ease;

      @media (min-width: 768px) {
        padding: 1rem 2rem;
      }

      // Dark mode
      &--dark {
        background: rgba(9, 9, 9, 0.8);
        border-color: rgba(255, 255, 255, 0.05);

        .nav-link {
          color: rgba(255, 255, 255, 0.8);
          &:hover { color: #fdb913; }
        }
      }

      // Light mode
      &--light {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(0, 0, 0, 0.05);

        .nav-link {
          color: #1e293b;
          &:hover { color: #fdb913; }
        }
      }

      &--dark.layout-topbar--sticky {
        background: rgba(9, 9, 9, 0.95);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }

      &--light.layout-topbar--sticky {
        background: rgba(255, 255, 255, 0.98);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
    }

    .layout-topbar-logo {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      z-index: 2;

      img {
        height: 20px;
        width: auto;

        @media (min-width: 768px) {
          height: 22px;
        }
      }
    }

    // ── Mobile menu toggle ──
    .mobile-menu-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      border-radius: 0.5rem;
      background: transparent;
      cursor: pointer;
      transition: all 200ms ease;
      margin-left: auto;
      z-index: 2;

      @media (min-width: 1024px) {
        display: none;
      }

      &--dark {
        color: rgba(255, 255, 255, 0.8);
        &:hover { background: rgba(255, 255, 255, 0.1); }
      }

      &--light {
        color: #1e293b;
        &:hover { background: rgba(0, 0, 0, 0.05); }
      }

      i { font-size: 1.5rem; }
    }

    // ── Center nav (desktop only) ──
    .topbar-center {
      display: none;

      @media (min-width: 1024px) {
        display: flex;
        flex: 1;
        justify-content: center;
        align-items: center;
      }
    }

    .topbar-center__links {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
      flex-direction: row;
    }

    // ── Right actions ──
    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;

      &--desktop {
        @media (max-width: 1023px) {
          display: none;
        }
      }

      &--mobile {
        justify-content: center;
        padding-top: 1rem;
        margin-top: 0.75rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
    }

    .topbar-actions__icons {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 0.5rem;
      align-items: center;
    }

    // ── Mobile nav dropdown ──
    .topbar-mobile-nav {
      position: absolute;
      top: 70px;
      left: 1rem;
      right: 1rem;
      z-index: 10;
      padding: 0.75rem;

      &--dark {
        background: #141517;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.75rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      }

      &--light {
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 0.75rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      }
    }

    .topbar-mobile-nav__links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    // ── Nav link ──
    .nav-link {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      margin: 0 0.125rem;
      font-size: 0.9375rem;
      font-weight: 500;
      text-decoration: none;
      transition: color 200ms ease;
      cursor: pointer;
      white-space: nowrap;

      .external-icon {
        margin-left: 0.375rem;
        font-size: 0.75rem;
        opacity: 0.7;
      }

      &--has-dropdown {
        gap: 0.375rem;
      }
    }

    .nav-link__chevron {
      font-size: 0.625rem;
      opacity: 0.6;
      transition: transform 200ms ease;

      &--open {
        transform: rotate(180deg);
      }
    }

    .nav-item-wrapper {
      position: relative;
    }

    // ── Mega Dropdown ──
    .mega-dropdown {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      min-width: 680px;
      padding-top: 0.75rem;
      z-index: 1001;
      animation: megaFadeIn 200ms ease forwards;
    }

    .mega-dropdown__bridge {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 0.75rem;
    }

    .mega-dropdown__inner {
      background: rgba(20, 21, 23, 0.98);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);

      &--light {
        background: rgba(255, 255, 255, 0.98);
        border-color: rgba(0, 0, 0, 0.08);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
      }
    }

    .mega-dropdown__header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .mega-dropdown__header-icon {
      width: 2.5rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.625rem;
      background: rgba(253, 185, 19, 0.1);

      i { font-size: 1.125rem; color: #fdb913; }
    }

    .mega-dropdown__header-title {
      font-size: 1rem;
      font-weight: 600;
      color: #ffffff;

      .mega-dropdown__inner--light & { color: #111827; }
    }

    .mega-dropdown__header-tagline {
      font-size: 0.8125rem;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 0.125rem;

      .mega-dropdown__inner--light & { color: #6b7280; }
    }

    .mega-dropdown__divider {
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      margin: 0 0 1rem;

      &--light { border-color: rgba(0, 0, 0, 0.06); }
    }

    .mega-dropdown__columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.5rem;
    }

    .mega-dropdown__column-title {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 0.75rem;

      &--light { color: #9ca3af; }
    }

    .mega-feature {
      display: flex;
      gap: 0.625rem;
      padding: 0.5rem;
      border-radius: 0.5rem;
      transition: background 150ms ease;
      cursor: default;

      &:hover { background: rgba(255, 255, 255, 0.05); }
      &--light:hover { background: rgba(0, 0, 0, 0.03); }
      & + .mega-feature { margin-top: 0.25rem; }
    }

    .mega-feature__icon {
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      background: rgba(253, 185, 19, 0.08);
      flex-shrink: 0;

      i { font-size: 0.875rem; color: #fdb913; }
    }

    .mega-feature__name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #ffffff;

      &--light { color: #111827; }
    }

    .mega-feature__desc {
      font-size: 0.75rem;
      line-height: 1.4;
      color: rgba(255, 255, 255, 0.45);
      margin-top: 0.125rem;

      &--light { color: #6b7280; }
    }

    .mega-dropdown__footer {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);

      .mega-dropdown__inner--light & { border-color: rgba(0, 0, 0, 0.06); }
    }

    .mega-dropdown__footer-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #fdb913;
      text-decoration: none;
      transition: gap 200ms ease;

      &:hover { gap: 0.75rem; }
      i { font-size: 0.75rem; }
    }

    @keyframes megaFadeIn {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    // ── Mobile submenu ──
    .mobile-submenu {
      padding: 0.5rem 1rem 1rem 1.5rem;
    }

    .mobile-submenu__group {
      margin-bottom: 1rem;
      &:last-of-type { margin-bottom: 0.75rem; }
    }

    .mobile-submenu__title {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 0.5rem;

      &--light { color: #9ca3af; }
    }

    .mobile-submenu__item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);

      &--light { color: #4b5563; }
    }

    .mobile-submenu__icon {
      font-size: 0.75rem;
      color: #fdb913;
    }

    .mobile-submenu__explore {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: #fdb913;
      text-decoration: none;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      width: 100%;

      i { font-size: 0.625rem; }
    }

    // ── Icon links & CTA ──
    .topbar-icon-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.5rem;
      background: transparent;
      cursor: pointer;
      transition: all 200ms ease;

      i { font-size: 1rem; }

      &--dark {
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.7);
        &:hover { border-color: #fdb913; color: #fdb913; }
      }

      &--light {
        border: 1px solid rgba(0, 0, 0, 0.1);
        color: #4b5563;
        &:hover { border-color: #fdb913; color: #fdb913; }
      }
    }

    .topbar-cta-btn {
      margin-left: 0.5rem;
      padding: 0.625rem 1.25rem;
      font-size: 0.9375rem;
      font-weight: 600;
      border: none;
      border-radius: 0.5rem;
      background: linear-gradient(135deg, #fdb913 0%, #cc950f 100%);
      color: #1a1a1a;
      cursor: pointer;
      transition: all 200ms ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(253, 185, 19, 0.3);
      }
    }
  `]
})
export class AppTopBarComponent implements OnDestroy {
  @Input() showConfigurator = true
  @Input() showMenuButton = true
  @Output() darkModeSwitch = new EventEmitter<any>()

  scrollListener: VoidFunction | null = null
  isSticky = false
  private window: Window

  categories: MegaMenuCategory[] = MEGA_MENU_CATEGORIES
  activeDropdown: string | null = null
  mobileExpandedCategory: string | null = null
  mobileMenuOpen = false
  private closeTimeout: any = null

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public router: Router,
    public layoutService: LayoutService,
    private configService: AppConfigService,
  ) {
    this.window = this.document.defaultView as Window

    afterNextRender(() => {
      this.bindScrollListener()
    })
  }

  get isDarkMode(): any {
    return this.configService.config().darkMode
  }

  toggleMenu(): void {
    if (this.configService.state.menuActive) {
      this.configService.hideMenu()
      DomHandler.unblockBodyScroll('blocked-scroll')
    } else {
      this.configService.showMenu()
      DomHandler.blockBodyScroll('blocked-scroll')
    }
  }

  showConfig(): void {
    this.configService.showConfig()
  }

  toggleDarkMode(): void {
    this.darkModeSwitch.emit(null)
  }

  // Mega menu hover management
  onNavItemEnter(categoryId: string): void {
    this.clearCloseTimeout()
    this.activeDropdown = categoryId
  }

  onNavItemLeave(): void {
    this.startCloseTimeout()
  }

  onDropdownEnter(): void {
    this.clearCloseTimeout()
  }

  onDropdownLeave(): void {
    this.startCloseTimeout()
  }

  navigateToCategory(route: string): void {
    this.activeDropdown = null
    this.mobileMenuOpen = false
    this.router.navigate([route])
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen
    if (!this.mobileMenuOpen) {
      this.mobileExpandedCategory = null
    }
  }

  toggleMobileCategory(categoryId: string): void {
    this.mobileExpandedCategory =
      this.mobileExpandedCategory === categoryId ? null : categoryId
  }

  private startCloseTimeout(): void {
    this.closeTimeout = setTimeout(() => {
      this.activeDropdown = null
    }, 150)
  }

  private clearCloseTimeout(): void {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout)
      this.closeTimeout = null
    }
  }

  scrollToSection(sectionId: string): void {
    const element = this.document.getElementById(sectionId)
    if (element) {
      const topbarHeight = 80 // Account for fixed topbar
      const elementPosition = element.getBoundingClientRect().top + this.window.scrollY
      this.window.scrollTo({
        top: elementPosition - topbarHeight,
        behavior: 'smooth'
      })
    }
  }

  bindScrollListener(): void {
    if (!this.scrollListener) {
      this.scrollListener = this.renderer.listen(this.window, 'scroll', () => {
        this.isSticky = this.window.scrollY > 0
      })
    }
  }

  unbindScrollListener(): void {
    if (this.scrollListener) {
      this.scrollListener()
      this.scrollListener = null
    }
  }

  ngOnDestroy(): void {
    this.unbindScrollListener()
    this.clearCloseTimeout()
  }
}
