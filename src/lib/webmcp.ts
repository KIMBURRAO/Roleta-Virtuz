import { useEffect } from 'react'

declare global {
  interface Document {
    modelContext?: {
      registerTool(tool: {
        name: string
        title: string
        description: string
        inputSchema: object
        annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }
        execute: () => Promise<object> | object
      }, options?: { signal?: AbortSignal }): void | Promise<void>
    }
  }
}

export function useSpinWebMcp(enabled: boolean, start: () => Promise<void>) {
  useEffect(() => {
    const context = document.modelContext
    if (!context?.registerTool) return
    const lifecycle = new AbortController()
    void Promise.resolve(context.registerTool({
      name: 'start_wheel_spin',
      title: 'Girar a Roleta Virtuz',
      description: 'Inicia um sorteio quando a roleta pública está pronta e atualiza a tela com o resultado.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute() {
        if (!enabled) throw new Error('A roleta não está pronta para girar.')
        await start()
        return { status: 'started' }
      },
    }, { signal: lifecycle.signal })).catch(() => undefined)
    return () => lifecycle.abort()
  }, [enabled, start])
}
