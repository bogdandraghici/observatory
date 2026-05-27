import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core'
import { CommonModule, JsonPipe } from '@angular/common'
import { DrawerModule } from 'primeng/drawer'
import { TagModule } from 'primeng/tag'
import { TabsModule } from 'primeng/tabs'
import { ButtonModule } from 'primeng/button'
import { TooltipModule } from 'primeng/tooltip'
import { MessageModule } from 'primeng/message'

import { formatTime } from 'src/app/ai/utils/time'

/**
 * Side-drawer detail for a single audit event row. Same drawer chrome as
 * the Agent Executions detail; the body is tab-organised:
 *   • Findings — markdown response from the auditor + severity / counts.
 *   • Context  — the input prompt + the artifact under audit (process /
 *                UI definition) rendered as pretty JSON.
 *   • Metadata — correlation IDs, tenancy chain, tags, full output JSON.
 */
@Component({
  selector: 'audit-detail',
  templateUrl: './audit-detail.component.html',
  styleUrls: ['./audit-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    JsonPipe,
    DrawerModule,
    TagModule,
    TabsModule,
    ButtonModule,
    TooltipModule,
    MessageModule,
  ],
})
export class AuditDetailComponent implements OnChanges {
  @Input() detailVisible = false
  @Input() selectedAudit: any
  @Output() detailVisibleChange = new EventEmitter<boolean>()

  formatTime = formatTime
  activeTab = 'findings'

  // Friendly kind labels — same vocabulary as the list widget.
  private readonly _kindLabels: Record<string, string> = {
    auditor_check_ui: 'UI audit',
    auditor_check_process: 'Process audit',
    auditor_extract_compliance: 'Extract compliance',
    regulatory_verdict: 'Regulatory verdict',
    regulatory_drift: 'Regulatory drift',
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.selectedAudit) {
      // Always start on the findings tab — that's the headline answer.
      this.activeTab = 'findings'
    }
  }

  close(): void {
    this.detailVisible = false
    this.detailVisibleChange.emit(false)
  }

  kindLabel(rt: string | null | undefined): string {
    if (!rt) {
      return '—'
    }
    return this._kindLabels[rt] || rt
  }

  /** PrimeNG tag severity for the run-level overall severity field. */
  severityClass(s: string | null | undefined): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (s) {
      case 'compliant':
      case 'low':
        return 'success'
      case 'caution':
      case 'medium':
        return 'warn'
      case 'likely_violation':
      case 'high':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  fmtDuration(ms: number | null | undefined): string {
    if (ms == null || ms < 0) {
      return '—'
    }
    if (ms < 1000) {
      return `${ms} ms`
    }
    return `${(ms / 1000).toFixed(2)} s`
  }

  /** Pull the chat-style audit response text (markdown) out of the row's
   * output JSON. The emit functions stash it under
   * `output.response_preview`; longer responses also have full text in
   * `output.chat` / `output.response` depending on the emitter. */
  responseText(audit: any): string {
    const out = audit?.output ?? {}
    return (
      out.response ||
      out.response_preview ||
      out.chat ||
      out.message ||
      ''
    )
  }

  reasoningText(audit: any): string {
    const out = audit?.output ?? {}
    return out.reasoning || out.reasoning_preview || ''
  }

  severityBreakdown(audit: any): { high: number; medium: number; low: number } {
    const sev = audit?.output?.severity
    if (sev && typeof sev === 'object') {
      return {
        high: Number(sev.high || 0),
        medium: Number(sev.medium || 0),
        low: Number(sev.low || 0),
      }
    }
    return { high: 0, medium: 0, low: 0 }
  }

  copyToClipboard(value: string | null | undefined): void {
    if (!value) {
      return
    }
    void navigator.clipboard.writeText(value).catch(() => {})
  }
}
