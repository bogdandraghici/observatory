

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ChartModule } from 'primeng/chart'
import { MenuModule } from 'primeng/menu'
import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { StyleClassModule } from 'primeng/styleclass'
import { PanelMenuModule } from 'primeng/panelmenu'
import { SiteRoutingModule } from './site-routing.module'
import { SiteComponent } from './site.component'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ChartModule,
        MenuModule,
        TableModule,
        StyleClassModule,
        PanelMenuModule,
        ButtonModule,
        SiteRoutingModule,

    ],
    declarations: [SiteComponent]
})
export class SiteModule { }
