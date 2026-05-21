import { Injectable, effect, signal } from '@angular/core'
import { Subject } from 'rxjs'

export interface AppConfig {
    inputStyle: string
    colorScheme: string
    theme: string
    ripple: boolean
    menuMode: string
    scale: number
}

interface LayoutState {
    staticMenuDesktopInactive: boolean
    overlayMenuActive: boolean
    profileSidebarVisible: boolean
    configSidebarVisible: boolean
    staticMenuMobileActive: boolean
    menuHoverActive: boolean
}

@Injectable({
    providedIn: 'root',
})
export class LayoutService {
    _config: AppConfig = {
        ripple: true,
        inputStyle: 'outlined',
        menuMode: 'static',
        colorScheme: 'dark',
        theme: 'flowx-light',
        scale: 13,
    }

    config = signal<AppConfig>(this._config)

    state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false,
    }

    private configUpdate = new Subject<AppConfig>()

    private overlayOpen = new Subject<any>()

    configUpdate$ = this.configUpdate.asObservable()

    overlayOpen$ = this.overlayOpen.asObservable()

    constructor() {
        effect(() => {
            const config = this.config()
            if (this.updateStyle(config)) {
                this.changeTheme()
            }
            this.changeScale(config.scale)
            this.onConfigUpdate()
        })
    }

    updateStyle(config: AppConfig): any {
        return (
            config.theme !== this._config.theme ||
            config.colorScheme !== this._config.colorScheme
        )
    }

    onMenuToggle(): void {
        if (this.isOverlay()) {
            this.state.overlayMenuActive = !this.state.overlayMenuActive
            if (this.state.overlayMenuActive) {
                this.overlayOpen.next(null)
            }
        }

        if (this.isDesktop()) {
            this.state.staticMenuDesktopInactive =
                !this.state.staticMenuDesktopInactive
        } else {
            this.state.staticMenuMobileActive =
                !this.state.staticMenuMobileActive

            if (this.state.staticMenuMobileActive) {
                this.overlayOpen.next(null)
            }
        }
    }

    showProfileSidebar(): void {
        this.state.profileSidebarVisible = !this.state.profileSidebarVisible
        if (this.state.profileSidebarVisible) {
            this.overlayOpen.next(null)
        }
    }

    showConfigSidebar(): void {
        this.state.configSidebarVisible = true
    }

    isOverlay(): any {
        return this.config().menuMode === 'overlay'
    }

    isDesktop(): any {
        return window.innerWidth > 991
    }

    isMobile(): any {
        return !this.isDesktop()
    }

    onConfigUpdate(): void {
        this._config = { ...this.config() }
        this.configUpdate.next(this.config())
    }

    changeTheme(): void {
        const config = this.config()
        // PrimeNG 21: Use CSS class toggle for dark mode instead of stylesheet swapping
        this.applyTheme(config.colorScheme as 'light' | 'dark')
    }

    applyTheme(colorScheme: 'light' | 'dark'): void {
        const root = document.documentElement
        if (colorScheme === 'dark') {
            root.classList.add('flowx-dark')
            root.classList.remove('flowx-light')
        } else {
            root.classList.add('flowx-light')
            root.classList.remove('flowx-dark')
        }
    }

    changeScale(value: number): void {
        document.documentElement.style.fontSize = `${value}px`
    }
}
