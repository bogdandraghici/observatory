import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked, OnInit, OnDestroy } from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { marked } from 'marked'
import { AssistantService } from './assistant.service'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

@Component({
  selector: 'app-chat-window',
  standalone: false,
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
})
export class ChatWindowComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() isOpen = false
  @Output() toggleOpen = new EventEmitter<void>()
  @ViewChild('messagesContainer') messagesContainer!: ElementRef

  messages: ChatMessage[] = []
  inputText = ''
  isStreaming = false
  streamingContent = ''
  sessionId: string | null = null

  private shouldScroll = false
  private abortController: AbortController | null = null
  private readonly STORAGE_KEY = 'observatory_assistant_session'

  private mdCache = new Map<string, SafeHtml>()

  constructor(
    private assistantService: AssistantService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    marked.setOptions({ breaks: true, gfm: true })
  }

  ngOnInit(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY)
    if (saved) {
      this.sessionId = saved
      this.loadHistory()
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom()
      this.shouldScroll = false
    }
  }

  ngOnDestroy(): void {
    this.abortController?.abort()
  }

  async loadHistory(): Promise<any> {
    if (!this.sessionId) {return}
    const history = await this.assistantService.getSessionHistory(this.sessionId)
    this.messages = (Array.isArray(history) ? history : []).map((m: any) => ({
      id: m.id || crypto.randomUUID(),
      role: m.role,
      content: m.content,
    }))
    this.shouldScroll = true
  }

  sendMessage(text?: string): void {
    const query = (text || this.inputText).trim()
    if (!query || this.isStreaming) {return}

    this.inputText = ''
    this.messages.push({ id: crypto.randomUUID(), role: 'user', content: query })
    this.isStreaming = true
    this.streamingContent = ''
    this.shouldScroll = true

    const context = {
      route: this.router.url,
      page_summary: this.getPageSummary(),
    }

    this.abortController = this.assistantService.streamChat(
      query,
      this.sessionId,
      context,
      (chunk) => {
        this.streamingContent += chunk
        this.shouldScroll = true
      },
      () => {
        if (this.streamingContent) {
          this.messages.push({
            id: crypto.randomUUID(),
            role: 'assistant',
            content: this.streamingContent,
          })
        }
        this.streamingContent = ''
        this.isStreaming = false
        this.shouldScroll = true
      },
      (err) => {
        this.messages.push({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Sorry, something went wrong: ${err}`,
        })
        this.streamingContent = ''
        this.isStreaming = false
        this.shouldScroll = true
      },
      (sid) => {
        this.sessionId = sid
        localStorage.setItem(this.STORAGE_KEY, sid)
      }
    )
  }

  onEnter(event: Event): void {
    event.preventDefault()
    this.sendMessage()
  }

  newConversation(): void {
    this.abortController?.abort()
    this.messages = []
    this.sessionId = null
    this.streamingContent = ''
    this.isStreaming = false
    localStorage.removeItem(this.STORAGE_KEY)
  }

  stopStreaming(): void {
    this.abortController?.abort()
    if (this.streamingContent) {
      this.messages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: this.streamingContent,
      })
    }
    this.streamingContent = ''
    this.isStreaming = false
  }

  clearHistory(): void {
    this.abortController?.abort()
    this.messages = []
    this.streamingContent = ''
    this.isStreaming = false
    // Keep sessionId — just clear local messages
  }

  async startTour(): Promise<any> {
    const mainEl = document.querySelector('.layout-main')
    if (!mainEl) {return}

    const html = mainEl.innerHTML
    const data = await this.assistantService.getScreenHelp(html)
    const steps = Array.isArray(data?.steps) ? data.steps : []
    if (steps.length === 0) {return}

    // Dynamic import of shepherd.js
    const Shepherd = (await import('shepherd.js')).default

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'observatory-shepherd-theme',
        scrollTo: true,
      },
    })

    for (const step of steps) {
      const buttons: any[] = (step.buttons || []).map((btn: any) => {
        if (btn.type === 'back') {
          return { text: btn.text || 'Back', action: tour.back, classes: btn.classes || '' }
        }
        return { text: btn.text || 'Next', action: tour.next, classes: btn.classes || '' }
      })

      tour.addStep({
        id: step.id,
        text: step.text,
        attachTo: step.attachTo?.element
          ? { element: step.attachTo.element, on: step.attachTo.on || 'bottom' }
          : undefined,
        buttons,
        classes: step.classes || 'observatory-shepherd-theme',
      })
    }

    tour.start()
  }

  getPageSummary(): string {
    const headings = Array.from(document.querySelectorAll('.layout-main h1, .layout-main h2, .layout-main h3'))
      .map((el) => el.textContent?.trim())
      .filter(Boolean)
    const cards = Array.from(document.querySelectorAll('.layout-main .p-card-title, .layout-main .stat-card__title'))
      .map((el) => el.textContent?.trim())
      .filter(Boolean)
    return [...headings, ...cards].join(', ')
  }

  renderMarkdown(content: string): SafeHtml {
    const cached = this.mdCache.get(content)
    if (cached) {return cached}
    const html = marked.parse(content) as string
    const safe = this.sanitizer.bypassSecurityTrustHtml(html)
    this.mdCache.set(content, safe)
    return safe
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    } catch {}
  }
}
