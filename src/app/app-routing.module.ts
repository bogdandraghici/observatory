import { RouterModule } from '@angular/router'
import { NgModule } from '@angular/core'
import { NotfoundComponent } from './notfound/notfound.component'
import { AppLayoutComponent } from './layout/full-layout/app.layout.component'
import { AuthGuard } from './auth/auth.guard'



@NgModule({
  imports: [
    RouterModule.forRoot(
      [
        {
          path: '',
          loadChildren: () =>
            import('./landing/landing.module').then((m) => m.LandingModule),
        },

        {
          path: 'ai',
          component: AppLayoutComponent,
          canActivate: [AuthGuard],
          data: { ai: true },
          children: [
            {
              path: '',
              loadChildren: () =>
                import('./ai/ai.module').then((m) => m.AIModule),
            },
          ],
        },
        {
          path: 'status',
          loadChildren: () =>
            import('./status/status.module').then((m) => m.StatusModule),
        },
        { path: 'notfound', component: NotfoundComponent },
        { path: '**', redirectTo: '/notfound' },
      ],
      {
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
        onSameUrlNavigation: 'reload',
        useHash: false,
      },
    ),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
