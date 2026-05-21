import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment'

@Injectable({ providedIn: 'root' })
export class AssistantService {
  private baseUrl = environment.baseUrl

  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  streamChat(
    query: string,
    sessionId: string | null,
    context: { route: string; page_summary?: string } | null,
    onChunk: (content: string) => void,
    onDone: () => void,
    onError: (err: string) => void,
    onSessionId: (id: string) => void
  ): AbortController {
    const controller = new AbortController()

    const body: any = { query }
    if (sessionId) {body.session_id = sessionId}
    if (context) {body.context = context}

    fetch(`${this.baseUrl}/api/assistant/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          onError(`HTTP ${response.status}`)
          return
        }

        const reader = response.body?.getReader()
        if (!reader) {
          onError('No response stream')
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        for (;;) {
          const { done, value } = await reader.read()
          if (done) {break}

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'session') {
                  onSessionId(data.session_id)
                } else if (data.type === 'chunk') {
                  onChunk(data.content)
                } else if (data.type === 'done') {
                  onDone()
                } else if (data.type === 'error') {
                  onError(data.content)
                }
              } catch {
                // skip unparseable lines
              }
            }
          }
        }

        onDone()
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          onError(err.message)
        }
      })

    return controller
  }

  async getSessionHistory(sessionId: string): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/api/assistant/sessions/${sessionId}`, {
      headers: this.getHeaders(),
    })
    if (!res.ok) {return []}
    return res.json()
  }

  async getScreenHelp(htmlContent: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/assistant/screen-help`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ html_content: htmlContent }),
    })
    if (!res.ok) {return { steps: [] }}
    return res.json()
  }
}
