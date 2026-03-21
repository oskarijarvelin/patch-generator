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
