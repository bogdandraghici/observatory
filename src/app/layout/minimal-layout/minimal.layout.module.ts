import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { InputTextModule } from 'primeng/inputtext'
import { DrawerModule } from 'primeng/drawer'
import { BadgeModule } from 'primeng/badge'
import { RadioButtonModule } from 'primeng/radiobutton'
import { ToggleSwitchModule } from 'primeng/toggleswitch'
import { RippleModule } from 'primeng/ripple'
import { ButtonModule } from 'primeng/button'
import { ToggleButtonModule } from 'primeng/togglebutton'
import { AvatarModule } from 'primeng/avatar'
import { AvatarGroupModule } from 'primeng/avatargroup'
import { RouterModule } from '@angular/router'
import { MinimalTopBarComponent } from './minimal.topbar.component'
import { MinimalFooterComponent } from './minimal.footer.component'
import { MinimalLayoutComponent } from "./minimal.layout.component"

@NgModule({ declarations: [
        MinimalTopBarComponent,
        MinimalFooterComponent,
        MinimalLayoutComponent,
    ],
    exports: [MinimalLayoutComponent], imports: [BrowserModule,
        FormsModule,
        BrowserAnimationsModule,
        InputTextModule,
        DrawerModule,
        BadgeModule,
        AvatarModule,
        AvatarGroupModule,
        ButtonModule,
        RadioButtonModule,
        ToggleSwitchModule,
        ToggleButtonModule,
        RippleModule,
        RouterModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class MinimalLayoutModule { }
