import { Inject, Injectable, PLATFORM_ID, effect, signal } from '@angular/core'
import { Subject } from 'rxjs'
import { BehaviorSubject } from 'rxjs'
import { AppConfig } from './domain/appconfig'
import { AppState } from './domain/appstate'
import { isPlatformBrowser } from '@angular/common'

/** localStorage key for the user's explicit theme override. When set,
 *  beats `prefers-color-scheme` at startup. Cleared = follow system. */
export const THEME_STORAGE_KEY = 'flowx-observatory.theme'
export type StoredTheme = 'dark' | 'light'

/*
 * The way how you enforce a specific theme depends upon
 * the possibilities of your application.
 * The `AppConfigService` is just a kind of placeholder
 * for any application specific logic.
 */
@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private _forcedTheme$ = new BehaviorSubject<string | undefined>(undefined)
  public forcedTheme$ = this._forcedTheme$.asObservable()
  _config: AppConfig = {
    theme: 'aura-light-blue',
    darkMode: false,
    inputStyle: 'outlined',
    ripple: true,
    scale: 13,
    tableTheme: 'lara-light-blue',
  }

  state: AppState = {
    configActive: false,
    menuActive: false,
    newsActive: false,
  }

  config = signal<AppConfig>(this._config)

  private configUpdate = new Subject<AppConfig>()

  configUpdate$ = this.configUpdate.asObservable()

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    effect(() => {
      const config = this.config()
      if (isPlatformBrowser(this.platformId)) {
        if (this.updateStyle(config)) {
          this.changeTheme()
          const newTableTheme = !config.darkMode
            ? config.tableTheme.replace('dark', 'light')
            : config.tableTheme.replace('light', 'dark')
          this.replaceTableTheme(newTableTheme)
        }
        this.changeScale(config.scale)
        this.onConfigUpdate()
      }
    })
  }
  updateStyle(config: AppConfig): any {
    return (
      config.theme !== this._config.theme ||
      config.darkMode !== this._config.darkMode ||
      config.tableTheme !== this._config.tableTheme
    )
  }

  onConfigUpdate(): void {
    const config = this.config()
    config.tableTheme = !config.darkMode
      ? config.tableTheme.replace('light', 'dark')
      : config.tableTheme.replace('dark', 'light')
    this._config = { ...config }
    this.configUpdate.next(this.config())
  }

  public forceTheme(theme?: string): void {
    this._forcedTheme$.next(theme)
  }

  // ─── Persistence ──────────────────────────────────────────────────────
  // Theme toggle in the topbar persists the explicit choice here so
  // subsequent reloads honour it (instead of always re-applying the
  // OS-level `prefers-color-scheme`).

  /** Return the user's persisted theme override, or `null` if none. */
  public getStoredTheme(): StoredTheme | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null
    }
    try {
      const v = window.localStorage?.getItem(THEME_STORAGE_KEY)
      return v === 'dark' || v === 'light' ? v : null
    } catch {
      // Private mode / disabled storage — fall through to system preference.
      return null
    }
  }

  /** Persist (or clear) the user's theme override. Pass `null` to revert
   *  to following the OS preference on next load. */
  public setStoredTheme(theme: StoredTheme | null): void {
    if (!isPlatformBrowser(this.platformId)) {
      return
    }
    try {
      if (theme === null) {
        window.localStorage?.removeItem(THEME_STORAGE_KEY)
      } else {
        window.localStorage?.setItem(THEME_STORAGE_KEY, theme)
      }
    } catch {
      // Storage unavailable — silently degrade; the in-memory toggle
      // still works for this session.
    }
  }

  showMenu(): void {
    this.state.menuActive = true
  }

  hideMenu(): void {
    this.state.menuActive = false
  }

  showConfig(): void {
    this.state.configActive = true
  }

  hideConfig(): void {
    this.state.configActive = false
  }

  showNews(): void {
    this.state.newsActive = true
  }

  hideNews(): void {
    this.state.newsActive = false
  }

  changeTheme(): void {
    const config = this.config()
    const themeLink = document.getElementById('theme-link') as HTMLLinkElement
    if (!themeLink) {return}
    const themeLinkHref = themeLink.getAttribute('href') ?? ''
    const newHref = themeLinkHref
      .split('/')
      .map((el) =>
        el === this._config.theme
          ? (el = config.theme)
          : el === `theme-${this._config.darkMode}`
            ? (el = `theme-${config.darkMode}`)
            : el,
      )
      .join('/')

    this.replaceThemeLink(newHref)
  }

  replaceThemeLink(href: string): void {
    const id = 'theme-link'
    const themeLink = document.getElementById(id) as HTMLLinkElement
    if (!themeLink) {return}
    const cloneLinkElement = themeLink.cloneNode(true) as HTMLLinkElement

    cloneLinkElement.setAttribute('href', href)
    cloneLinkElement.setAttribute('id', id + '-clone')

    themeLink.parentNode?.insertBefore(cloneLinkElement, themeLink.nextSibling)
    cloneLinkElement.addEventListener('load', () => {
      themeLink.remove()
      cloneLinkElement.setAttribute('id', id)
    })
  }

  replaceTableTheme(newTheme: string): void {
    const elementId = 'home-table-link'
    const linkElement = document.getElementById(elementId) as HTMLLinkElement
    const tableThemeTokens =
      linkElement?.getAttribute('href').split('/') || null
    const currentTableTheme = tableThemeTokens
      ? tableThemeTokens[tableThemeTokens.length - 2]
      : null
    if (currentTableTheme !== newTheme && tableThemeTokens) {
      const newThemeUrl = linkElement
        .getAttribute('href')
        .replace(currentTableTheme, newTheme)

      const cloneLinkElement = linkElement.cloneNode(true) as HTMLLinkElement

      cloneLinkElement.setAttribute('id', elementId + '-clone')
      cloneLinkElement.setAttribute('href', newThemeUrl)
      cloneLinkElement.addEventListener('load', () => {
        linkElement.remove()
        cloneLinkElement.setAttribute('id', elementId)
      })
      linkElement.parentNode?.insertBefore(
        cloneLinkElement,
        linkElement.nextSibling,
      )
    }
  }

  changeScale(value: number): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.style.fontSize = `${value}px`
    }
  }
}
