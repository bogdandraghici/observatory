import { Component, ElementRef, Input } from '@angular/core'
import { LayoutService } from "./service/app.layout.service"

@Component({
    selector: 'app-sidebar',
    templateUrl: './app.sidebar.component.html',
    standalone: false
})
export class AppSidebarComponent {
    @Input() section!: any
    constructor(public layoutService: LayoutService, public el: ElementRef) { }
}

