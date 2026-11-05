import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, SessionRateLimit } from 'claude-code'

import type { Limits, Window } from '../types'

const limits = atom({ plugin: 'usage-bars', key: 'limits' } as const, { session: null, weekly: null } as Limits)

const WIDTH = 20

function pick(list: SessionRateLimit[], kind: string): Window | null {
  const w = list.find((x) => x.kind === kind)
  return w ? { percentUsed: w.percentUsed, resetsAt: w.resetsAt } : null
}

function bar(pct: number): string {
  const p = Math.max(0, Math.min(100, pct))
  const full = Math.round((p / 100) * WIDTH)
  return '█'.repeat(full) + '░'.repeat(WIDTH - full)
}

function color(pct: number): string {
  return pct >= 90 ? 'red' : pct >= 70 ? 'yellow' : 'green'
}

function resets(iso: string | undefined, now: number): string {
  if (!iso) return ''
  const ms = Date.parse(iso) - now
  if (!isFinite(ms) || ms <= 0) return ' · resets soon'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h >= 24) return ` · resets in ${Math.floor(h / 24)}d ${h % 24}h`
  return h > 0 ? ` · resets in ${h}h ${m}m` : ` · resets in ${m}m`
}

async function save($: EngineInterface, list: SessionRateLimit[]): Promise<void> {
  if (!list.length) return
  const fresh: Limits = { session: pick(list, 'five_hour'), weekly: pick(list, 'seven_day') }
  await update($, limits, (old) => ({ session: fresh.session ?? old.session, weekly: fresh.weekly ?? old.weekly }))
}

export const register: Register = (on) => {

  on('session.start', async ($, e, next) => {
    const r = await next(e)
    try { await save($, (await $.session.usage()).rateLimits) } catch {}
    return r
  })

  on('session.measure', async ($, e, next) => {
    await save($, e.rateLimits)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const l = await read($, limits)
    const now = await $.clock.now()
    const row = (label: string, w: Window | null) =>
      w ? (
        <Text key={label}>
          <Text dimColor>{label} </Text>
          <Text color={color(w.percentUsed)}>{bar(w.percentUsed)}</Text>
          <Text> {Math.round(w.percentUsed)}%</Text>
          <Text dimColor>{resets(w.resetsAt, now)}</Text>
        </Text>
      ) : (
        <Text key={label} dimColor>{label} waiting for the first reading</Text>
      )
    return (
      <Box flexDirection="column">
        {row('Session', l.session)}
        {row('Weekly ', l.weekly)}
      </Box>
    )
  })
}
