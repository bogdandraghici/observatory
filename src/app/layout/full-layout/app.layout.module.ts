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
import { TooltipModule } from 'primeng/tooltip'
import { ButtonModule } from 'primeng/button'
import { ToggleButtonModule } from 'primeng/togglebutton'
import { AppMenuComponent } from './app.menu.component'
import { AvatarModule } from 'primeng/avatar'
import { AvatarGroupModule } from 'primeng/avatargroup'
import { AppMenuitemComponent } from './app.menuitem.component'
import { RouterModule } from '@angular/router'
import { AppTopBarComponent } from './app.topbar.component'
import { AppFooterComponent } from './app.footer.component'
import { AppConfigModule } from './config/config.module'
import { AppSidebarComponent } from "./app.sidebar.component"
import { AppLayoutComponent } from "./app.layout.component"
import { AssistantModule } from "../../assistant/assistant.module"

@NgModule({ declarations: [
        AppMenuitemComponent,
        AppTopBarComponent,
        AppFooterComponent,
        AppMenuComponent,
        AppSidebarComponent,
        AppLayoutComponent,
    ],
    exports: [AppLayoutComponent], imports: [BrowserModule,
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
        TooltipModule,
        RouterModule,
        AppConfigModule,
        AssistantModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppLayoutModule { }
