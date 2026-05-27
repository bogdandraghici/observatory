import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('./projects/projects.module').then((m) => m.ProjectsModule),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'analytics',
        loadChildren: () =>
          import('./analytics/analytics.module').then((m) => m.AnalyticsModule),
      },
      {
        path: 'llm-calls',
        loadChildren: () =>
          import('./llm-calls/llm-calls.module').then((m) => m.LLMCallsModule),
      },
      {
        path: 'traces',
        loadChildren: () =>
          import('./traces/traces.module').then((m) => m.TracesModule),
      },
{
        path: 'datasets',
        loadChildren: () =>
          import('./datasets/dataset.module').then((m) => m.DatasetModule),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./users/users.module').then((m) => m.UsersModule),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.module').then((m) => m.SettingsModule),
      },
      {
        path: 'executions',
        loadChildren: () =>
          import('./executions/executions.module').then((m) => m.ExecutionsModule),
      },
      {
        path: 'audits',
        loadChildren: () =>
          import('./audits/audits.module').then((m) => m.AuditsModule),
      },
      {
        path: 'developer-executions',
        loadChildren: () =>
          import('./developer-executions/developer-executions.module').then(
            (m) => m.DeveloperExecutionsModule
          ),
      },
      {
        path: 'audit',
        loadChildren: () =>
          import('./audit-trail/audit-trail.module').then((m) => m.AuditTrailModule),
      },
      {
        path: 'access',
        loadChildren: () =>
          import('./access-control/access-control.module').then((m) => m.AccessControlModule),
      },
      {
        path: 'webhooks',
        loadChildren: () =>
          import('./webhooks/webhooks.module').then((m) => m.WebhooksModule),
      },
      {
        path: 'registry',
        loadChildren: () =>
          import('./registry/registry.module').then((m) => m.RegistryModule),
      },
      {
        path: 'risk',
        loadChildren: () =>
          import('./risk-dashboard/risk-dashboard.module').then((m) => m.RiskDashboardModule),
      },
      {
        path: 'insights',
        loadChildren: () =>
          import('./insights-dashboard/insights.module').then((m) => m.InsightsModule),
      },
      {
        path: 'alerts',
        loadChildren: () =>
          import('./alerts/alerts.module').then((m) => m.AlertsModule),
      },
      {
        path: 'drift',
        loadChildren: () =>
          import('./drift/drift.module').then((m) => m.DriftModule),
      },
      {
        path: 'rsi',
        loadChildren: () =>
          import('./rsi/rsi.module').then((m) => m.RsiModule),
      },
      {
        path: 'tests',
        loadChildren: () =>
          import('./tests/tests.module').then((m) => m.TestsModule),
      },
      {
        path: 'policies',
        loadChildren: () =>
          import('./policies/policies.module').then((m) => m.PoliciesModule),
      },
      {
        path: 'evidence',
        loadChildren: () =>
          import('./evidence/evidence.module').then((m) => m.EvidenceModule),
      },
      {
        path: 'assessments',
        loadChildren: () =>
          import('./assessments/assessments.module').then((m) => m.AssessmentsModule),
      },
      {
        path: 'regulatory',
        loadChildren: () =>
          import('./regulatory/regulatory.module').then((m) => m.RegulatoryModule),
      },
      {
        path: 'experiments',
        loadChildren: () =>
          import('./experiments/experiments.module').then((m) => m.ExperimentsModule),
      },
      {
        path: 'roi',
        loadChildren: () =>
          import('./roi/roi.module').then((m) => m.RoiModule),
      },
      {
        path: 'prompts',
        loadChildren: () =>
          import('./prompts/prompts.module').then((m) => m.PromptsModule),
      },
      {
        path: 'platform',
        loadChildren: () =>
          import('./platform/platform.module').then((m) => m.PlatformModule),
      },
      {
        path: '_empty',
        loadChildren: () =>
          import('./_empty/emptydemo.module').then((m) => m.EmptyDemoModule),
      },
      { path: '**', redirectTo: '/notfound' },
    ]),
  ],
  exports: [RouterModule],
})
export class AIRoutingModule {}
