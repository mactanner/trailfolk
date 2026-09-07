export {}

declare global {
  type WebMCPTool<Input> = {
    name: string
    description: string
    inputSchema: {
      type: 'object'
      properties: Record<string, unknown>
      required?: string[]
    }
    annotations?: {
      readOnlyHint?: boolean
    }
    execute: (input: Input, context: { signal: AbortSignal }) => Promise<unknown>
  }

  interface ModelContext {
    registerTool<Input>(
      tool: WebMCPTool<Input>,
      options?: { signal?: AbortSignal; exposedTo?: string[] },
    ): Promise<void>
  }

  interface Document {
    modelContext?: ModelContext
  }
}
