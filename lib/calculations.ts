/** Start address of the last fixture in the group */
export function getLastAddress(startingAddress: number, channelCount: number, amount: number): number {
  return startingAddress + (amount - 1) * channelCount
}

/** Highest channel address actually used by the group */
export function getLastUsedAddress(startingAddress: number, channelCount: number, amount: number): number {
  return getLastAddress(startingAddress, channelCount, amount) + channelCount - 1
}

export function exceedsUniverse(startingAddress: number, channelCount: number, amount: number): boolean {
  return getLastUsedAddress(startingAddress, channelCount, amount) > 512
}

/**
 * Returns a set of "start addresses" that have at least one overlap with another group in the same universe.
 *
 * Overlap rule: [start,end] intersects another [start,end].
 */
export function getOverlappingStartAddresses(
  groups: Array<{ universe: string; startingAddress: number; mode: { channelCount: number }; amount: number }>
): Set<string> {
  type Range = { key: string; start: number; end: number }

  const byUniverse: Record<string, Range[]> = {}
  for (const g of groups) {
    const u = (g.universe || '').toUpperCase()
    if (!u) continue
    const start = g.startingAddress
    const end = getLastUsedAddress(g.startingAddress, g.mode.channelCount, g.amount)
    const key = `${u}:${start}`
    if (!byUniverse[u]) byUniverse[u] = []
    byUniverse[u].push({ key, start, end })
  }

  const overlaps = new Set<string>()
  for (const ranges of Object.values(byUniverse)) {
    for (let i = 0; i < ranges.length; i++) {
      for (let j = i + 1; j < ranges.length; j++) {
        const a = ranges[i], b = ranges[j]
        if (a.start <= b.end && b.start <= a.end) {
          overlaps.add(a.key)
          overlaps.add(b.key)
        }
      }
    }
  }

  return overlaps
}

export function hasAddressConflict(
  groups: Array<{ universe: string; startingAddress: number; mode: { channelCount: number }; amount: number }>
): boolean {
  const byUniverse: Record<string, Array<{ start: number; end: number }>> = {}
  for (const g of groups) {
    const end = getLastUsedAddress(g.startingAddress, g.mode.channelCount, g.amount)
    if (!byUniverse[g.universe]) byUniverse[g.universe] = []
    byUniverse[g.universe].push({ start: g.startingAddress, end })
  }
  for (const ranges of Object.values(byUniverse)) {
    for (let i = 0; i < ranges.length; i++) {
      for (let j = i + 1; j < ranges.length; j++) {
        const a = ranges[i], b = ranges[j]
        if (a.start <= b.end && b.start <= a.end) return true
      }
    }
  }
  return false
}

export function getGroupPhases(groupPower: number): number {
  return Math.ceil(groupPower / 3680)
}

export const DMX_UNIVERSE_SIZE = 512

export function clampAddress(addr: number): number {
  if (Number.isNaN(addr)) return 1
  return Math.min(DMX_UNIVERSE_SIZE, Math.max(1, addr))
}

export function getUsedRangesByUniverse(
  groups: Array<{ universe: string; startingAddress: number; mode: { channelCount: number }; amount: number }>
): Record<string, Array<{ start: number; end: number }>> {
  const byUniverse: Record<string, Array<{ start: number; end: number }>> = {}
  for (const g of groups) {
    const u = (g.universe || '').toUpperCase()
    if (!u) continue
    const start = clampAddress(g.startingAddress)
    const end = clampAddress(getLastUsedAddress(g.startingAddress, g.mode.channelCount, g.amount))
    if (!byUniverse[u]) byUniverse[u] = []
    byUniverse[u].push({ start, end })
  }
  // normalize (merge overlapping ranges)
  for (const u of Object.keys(byUniverse)) {
    const ranges = byUniverse[u].sort((a, b) => a.start - b.start)
    const merged: Array<{ start: number; end: number }> = []
    for (const r of ranges) {
      const last = merged[merged.length - 1]
      if (!last || r.start > last.end + 1) merged.push({ ...r })
      else last.end = Math.max(last.end, r.end)
    }
    byUniverse[u] = merged
  }
  return byUniverse
}

export function getUniverseUsedCount(ranges: Array<{ start: number; end: number }>): number {
  return ranges.reduce((s, r) => s + (r.end - r.start + 1), 0)
}

export function getUniverseCoveragePercent(ranges: Array<{ start: number; end: number }>): number {
  return (getUniverseUsedCount(ranges) / DMX_UNIVERSE_SIZE) * 100
}

export function buildUniverseAddressBitmap(ranges: Array<{ start: number; end: number }>): boolean[] {
  // index 0 => address 1
  const used = Array.from({ length: DMX_UNIVERSE_SIZE }, () => false)
  for (const r of ranges) {
    for (let a = r.start; a <= r.end; a++) used[a - 1] = true
  }
  return used
}
