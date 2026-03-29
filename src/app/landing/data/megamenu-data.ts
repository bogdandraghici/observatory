export interface MegaMenuFeature {
  icon: string
  name: string
  description: string
}

export interface MegaMenuColumn {
  title: string
  features: MegaMenuFeature[]
}

export interface MegaMenuCategory {
  id: string
  label: string
  tagline: string
  icon: string
  route: string
  columns: MegaMenuColumn[]
}

export const MEGA_MENU_CATEGORIES: MegaMenuCategory[] = [
  {
    id: 'observability',
    label: 'Observability',
    tagline: 'Complete visibility into your AI applications',
    icon: 'pi pi-eye',
    route: '/features/observability',
    columns: [
      {
        title: 'Tracing & Debugging',
        features: [
          {
            icon: 'pi pi-align-left',
            name: 'Real-time Tracing',
            description: 'Full chain-of-calls with inputs, outputs, and timings'
          },
          {
            icon: 'pi pi-sitemap',
            name: 'Agent Behavior Monitoring',
            description: 'Track agent decisions, tool calls, and reasoning paths'
          },
          {
            icon: 'pi pi-comments',
            name: 'User Feedback',
            description: 'Collect and analyze user feedback on AI responses'
          }
        ]
      },
      {
        title: 'Analytics & Monitoring',
        features: [
          {
            icon: 'pi pi-chart-bar',
            name: 'Cost & Performance Analytics',
            description: 'Track cost, latency, and token usage across all models'
          },
          {
            icon: 'pi pi-bell',
            name: 'Production Monitoring',
            description: 'Threshold alerting across 8 metrics with SLA tracking'
          },
          {
            icon: 'pi pi-chart-line',
            name: 'Model Drift Detection',
            description: 'Detect distribution changes across 5 key metrics'
          }
        ]
      },
      {
        title: 'Security',
        features: [
          {
            icon: 'pi pi-shield',
            name: 'Security Monitoring',
            description: 'Detect anomalies and protect your AI pipelines'
          },
          {
            icon: 'pi pi-exclamation-triangle',
            name: 'Threshold Alerting',
            description: 'Configurable alerts with cooldown and escalation'
          }
        ]
      }
    ]
  },
  {
    id: 'governance',
    label: 'Governance',
    tagline: 'Manage and govern your AI systems responsibly',
    icon: 'pi pi-briefcase',
    route: '/features/governance',
    columns: [
      {
        title: 'Policy & Compliance',
        features: [
          {
            icon: 'pi pi-file-edit',
            name: 'Policy Engine',
            description: 'Define, assign, and enforce AI governance policies'
          },
          {
            icon: 'pi pi-check-square',
            name: 'Assessment Engine',
            description: 'Dynamic questionnaires with weighted scoring'
          },
          {
            icon: 'pi pi-folder-open',
            name: 'Evidence Collection',
            description: 'Automated and manual evidence with review workflow'
          }
        ]
      },
      {
        title: 'Risk & Registry',
        features: [
          {
            icon: 'pi pi-exclamation-circle',
            name: 'Risk Assessment',
            description: '6-dimensional risk scoring for AI applications'
          },
          {
            icon: 'pi pi-server',
            name: 'AI Registry',
            description: 'Catalog and manage 100+ AI models and deployments'
          },
          {
            icon: 'pi pi-lock',
            name: 'RBAC & Audit Trail',
            description: 'Role-based access control with full audit logging'
          }
        ]
      }
    ]
  },
  {
    id: 'compliance',
    label: 'Compliance',
    tagline: 'Meet regulatory requirements with confidence',
    icon: 'pi pi-verified',
    route: '/features/compliance',
    columns: [
      {
        title: 'Regulatory Frameworks',
        features: [
          {
            icon: 'pi pi-building',
            name: 'EU AI Act',
            description: '18 requirements mapped with automated evidence collection'
          },
          {
            icon: 'pi pi-flag',
            name: 'NIST AI RMF',
            description: '16 requirements covering Govern, Map, Measure, Manage'
          },
          {
            icon: 'pi pi-globe',
            name: 'ISO 42001',
            description: '12 requirements for AI management systems'
          }
        ]
      },
      {
        title: 'Compliance Tools',
        features: [
          {
            icon: 'pi pi-map',
            name: 'Compliance Mapping Engine',
            description: 'Map controls across multiple frameworks simultaneously'
          },
          {
            icon: 'pi pi-search',
            name: 'Gap Analysis',
            description: 'Identify compliance gaps with prioritized remediation'
          },
          {
            icon: 'pi pi-th-large',
            name: 'Compliance Heatmap',
            description: 'Visual compliance status across all frameworks'
          }
        ]
      }
    ]
  },
  {
    id: 'roi',
    label: 'ROI & Value',
    tagline: 'Prove AI investment value with financial rigor',
    icon: 'pi pi-dollar',
    route: '/features/roi',
    columns: [
      {
        title: 'Financial Analysis',
        features: [
          {
            icon: 'pi pi-chart-line',
            name: 'Risk-Adjusted Financial ROI',
            description: 'Per-agent and per-project ROI with compliance risk factored in, not just optimistic projections'
          },
          {
            icon: 'pi pi-wallet',
            name: 'Agent Baselines',
            description: 'Configure manual effort equivalent per agent — hours, rate, volume — for automated ROI calculation'
          },
          {
            icon: 'pi pi-calculator',
            name: 'Payback & NPV',
            description: 'Monthly savings, payback period, annual ROI %, and 5-year Net Present Value per project'
          }
        ]
      },
      {
        title: 'Value Outcomes',
        features: [
          {
            icon: 'pi pi-objects-column',
            name: 'Value Outcome Units',
            description: 'Group agents by business outcome — translate technical metrics into board-level language'
          },
          {
            icon: 'pi pi-verified',
            name: 'Compliance Audit ROI',
            description: 'Quantify audit labor savings and risk reduction from automated governance and evidence collection'
          },
          {
            icon: 'pi pi-arrows-h',
            name: 'Alternative Comparison',
            description: 'Benchmark AI investment against RPA, outsourcing, or hiring with 5-year TCO analysis'
          }
        ]
      },
      {
        title: 'Confidence & Planning',
        features: [
          {
            icon: 'pi pi-sliders-h',
            name: 'Sensitivity Analysis',
            description: 'Monte Carlo simulations showing confidence ranges instead of single-point estimates'
          },
          {
            icon: 'pi pi-th-large',
            name: 'Project Comparison',
            description: 'Compare ROI across all AI projects in your portfolio for strategic investment decisions'
          }
        ]
      }
    ]
  }
]
