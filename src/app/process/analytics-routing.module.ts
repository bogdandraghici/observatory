import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'site', loadChildren: () => import('./site/site.module').then(m => m.SiteModule) },
        { path: '_empty', loadChildren: () => import('./_empty/emptydemo.module').then(m => m.EmptyDemoModule) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class AnalyticsRoutingModule { }
