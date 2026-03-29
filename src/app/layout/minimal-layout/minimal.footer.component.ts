import { Component } from '@angular/core'
import { MinimalLayoutService } from "./service/minimal.layout.service"

@Component({
    selector: 'minimal-footer',
    templateUrl: './minimal.footer.component.html',
    standalone: false
})
export class MinimalFooterComponent {
    constructor(public layoutService: MinimalLayoutService) { }
}
