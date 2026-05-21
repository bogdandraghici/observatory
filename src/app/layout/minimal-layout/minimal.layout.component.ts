import { Component, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { filter, Subscription } from 'rxjs'
import { MinimalLayoutService } from "./service/minimal.layout.service"
import { MinimalTopBarComponent } from './minimal.topbar.component'

@Component({
    selector: 'minimal-layout',
    templateUrl: './minimal.layout.component.html',
    standalone: false
})
export class MinimalLayoutComponent implements OnInit,OnDestroy {

    overlayMenuOpenSubscription: Subscription

    menuOutsideClickListener: any


    profileMenuOutsideClickListener: any

    aiSection: any
    sub: any


    @ViewChild(MinimalTopBarComponent) minimalTopbar!: MinimalTopBarComponent

    constructor(public layoutService: MinimalLayoutService, public renderer: Renderer2, public router: Router, public activeRoute: ActivatedRoute) {
        this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {

            if (!this.profileMenuOutsideClickListener) {
                this.profileMenuOutsideClickListener = this.renderer.listen('document', 'click', event => {
                    const isOutsideClicked = !(this.minimalTopbar.menu.nativeElement.isSameNode(event.target) || this.minimalTopbar.menu.nativeElement.contains(event.target)
                        || this.minimalTopbar.topbarMenuButton.nativeElement.isSameNode(event.target) || this.minimalTopbar.topbarMenuButton.nativeElement.contains(event.target))

                    if (isOutsideClicked) {
                        this.hideProfileMenu()
                    }
                })
            }

            if (this.layoutService.state.staticMenuMobileActive) {
                this.blockBodyScroll()
            }
        })

        this.router.events.pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                this.hideMenu()
                this.hideProfileMenu()
            })
    }

    hideMenu(): void {
        this.layoutService.state.overlayMenuActive = false
        this.layoutService.state.staticMenuMobileActive = false
        this.layoutService.state.menuHoverActive = false
        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener()
            this.menuOutsideClickListener = null
        }
        this.unblockBodyScroll()
    }

    hideProfileMenu(): void {
        this.layoutService.state.profileSidebarVisible = false
        if (this.profileMenuOutsideClickListener) {
            this.profileMenuOutsideClickListener()
            this.profileMenuOutsideClickListener = null
        }
    }

    blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll')
        }
        else {
            document.body.className += ' blocked-scroll'
        }
    }

    unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll')
        }
        else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' +
                'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ')
        }
    }

    get containerClass(): any {
        return {
            'layout-theme-light': this.layoutService.config().colorScheme === 'light',
            'layout-theme-dark': this.layoutService.config().colorScheme === 'dark',
            'layout-overlay': true,
            'layout-static-inactive': this.layoutService.state.staticMenuDesktopInactive,
            'layout-overlay-active': this.layoutService.state.overlayMenuActive,
            'layout-mobile-active': this.layoutService.state.staticMenuMobileActive,
            'p-ripple-disabled': !this.layoutService.config().ripple
        }
    }

    ngOnInit(): void {
        this.sub = this.activeRoute
          .data
          .subscribe(v => this.aiSection = v)
    }

    ngOnDestroy(): void {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe()
        }

        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener()
        }
        this.sub.unsubscribe()
    }
}
