import { NgModule } from '@angular/core'
import { PathLocationStrategy, LocationStrategy } from '@angular/common'
import { AppComponent } from './app.component'
import { AppRoutingModule } from './app-routing.module'
import { AppLayoutModule } from './layout/full-layout/app.layout.module'
import { MinimalLayoutModule } from './layout/minimal-layout/minimal.layout.module'
import { AuthConfigModule } from './auth/auth.module'
import { NotfoundComponent } from './notfound/notfound.component'
import { ClipboardModule } from '@angular/cdk/clipboard'

@NgModule({
  declarations: [AppComponent, NotfoundComponent],
  imports: [
    AppRoutingModule,
    AppLayoutModule,
    MinimalLayoutModule,
    AuthConfigModule,
    ClipboardModule,
  ],
  providers: [{ provide: LocationStrategy, useClass: PathLocationStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
