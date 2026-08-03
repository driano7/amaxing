'use client'

import { useEffect, useLayoutEffect, useDebugValue, useState } from 'react'

/**
 * React 17 / Preact-compatible `useSyncExternalStore` shim.
 *
 * `useSyncExternalStore` is a built-in React 18+ hook, but this project uses
 * React 17.0.2. Importing it directly from `'react'` returns `undefined`, which
 * crashes at runtime with:
 *   TypeError: (0 , react.useSyncExternalStore) is not a function
 *
 * This module provides a drop-in replacement built on hooks that exist in both
 * React 17 and `preact/compat` (which this project aliases `react` to in
 * production client builds via next.config.js).
 *
 * Implementation based on the official `use-sync-external-store/shim` package
 * by the React team.
 */

type Unsubscribe = () => void

export type UseSyncExternalStore = <Snapshot>(
  subscribe: (onStoreChange: () => void) => Unsubscribe,
  getSnapshot: () => Snapshot,
  getServerSnapshot?: () => Snapshot
) => Snapshot

interface StoreInstance<Snapshot> {
  value: Snapshot
  getSnapshot: () => Snapshot
}

interface StoreState<Snapshot> {
  inst: StoreInstance<Snapshot>
}

function is(x: unknown, y: unknown): boolean {
  return (x === y && (x !== 0 || 1 / (x as number) === 1 / (y as number))) || (x !== x && y !== y)
}

const objectIs: (x: unknown, y: unknown) => boolean =
  typeof Object.is === 'function' ? Object.is : is

function checkIfSnapshotChanged<Snapshot>(inst: StoreInstance<Snapshot>): boolean {
  const latestGetSnapshot = inst.getSnapshot
  const prevValue = inst.value
  try {
    const nextValue = latestGetSnapshot()
    return !objectIs(prevValue, nextValue)
  } catch (error) {
    return true
  }
}

let didWarnUncachedGetSnapshot = false

/**
 * Browser (client-side) implementation.
 * Uses standard React 17 hooks to subscribe and re-render on change.
 */
function useSyncExternalStoreClient<Snapshot>(
  subscribe: (onStoreChange: () => void) => Unsubscribe,
  getSnapshot: () => Snapshot
): Snapshot {
  const value = getSnapshot()

  if (!didWarnUncachedGetSnapshot) {
    const cachedValue = getSnapshot()
    if (!objectIs(value, cachedValue)) {
      console.error('The result of getSnapshot should be cached to avoid an infinite loop')
      didWarnUncachedGetSnapshot = true
    }
  }

  const [{ inst }, forceUpdate] = useState<StoreState<Snapshot>>({
    inst: { value, getSnapshot },
  })

  // Keep the mutable instance in sync during render
  inst.value = value
  inst.getSnapshot = getSnapshot

  useLayoutEffect(() => {
    checkIfSnapshotChanged(inst) && forceUpdate({ inst })
  }, [subscribe, value, getSnapshot, inst])

  useEffect(() => {
    checkIfSnapshotChanged(inst) && forceUpdate({ inst })
    return subscribe(() => {
      checkIfSnapshotChanged(inst) && forceUpdate({ inst })
    })
  }, [subscribe, inst])

  useDebugValue(value)

  return value
}

/**
 * Server-side (SSR) implementation.
 * No hooks are needed — just read the current snapshot directly.
 */
function useSyncExternalStoreServer<Snapshot>(
  _subscribe: (onStoreChange: () => void) => Unsubscribe,
  getSnapshot: () => Snapshot,
  getServerSnapshot?: () => Snapshot
): Snapshot {
  return getServerSnapshot ? getServerSnapshot() : getSnapshot()
}

const canUseDOM =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement === 'function'

/**
 * Pick the right implementation at module-load time. Next.js builds separate
 * server and client bundles, so `canUseDOM` is stable within each bundle.
 */
const useSyncExternalStoreImpl: UseSyncExternalStore = canUseDOM
  ? useSyncExternalStoreClient
  : useSyncExternalStoreServer

export const useSyncExternalStore: UseSyncExternalStore = useSyncExternalStoreImpl
