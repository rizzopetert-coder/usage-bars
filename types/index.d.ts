export type Window = { percentUsed: number; resetsAt?: string }
export type Limits = { session: Window | null; weekly: Window | null }

declare module 'claude-code' {
  interface PluginState {
    'usage-bars': { limits: Limits }
  }
}
