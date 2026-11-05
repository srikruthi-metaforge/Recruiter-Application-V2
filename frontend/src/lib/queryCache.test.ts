import { describe, expect, it } from 'vitest'
import type { Requirement } from '../types'
import { createQueryClient } from './queryClient'
import { WORKSPACE_STALE_MS, queryKeys } from './queryKeys'
import { readWorkspace, updateWorkspace } from './workspaceRefresh'

describe('query keys', () => {
  it('scopes workspace and notification caches by user id', () => {
    expect(queryKeys.workspace('user-a')).not.toEqual(queryKeys.workspace('user-b'))
    expect(queryKeys.notifications('user-a')).not.toEqual(queryKeys.notifications('user-b'))
    expect(queryKeys.workspace('user-a')[0]).toBe('workspace')
  })
})

describe('workspace cache', () => {
  it('applies an optimistic insert and rolls it back without touching another user', () => {
    const client = createQueryClient()
    const inserted = { id: 'REQ-1', title: 'Backend' } as Requirement
    updateWorkspace(client, 'user-a', current => ({
      ...current,
      requirements: [inserted, ...current.requirements],
    }))
    expect(readWorkspace(client, 'user-a')?.requirements.map(row => row.id)).toEqual(['REQ-1'])

    updateWorkspace(client, 'user-a', current => ({
      ...current,
      requirements: current.requirements.filter(row => row.id !== 'REQ-1'),
    }))
    expect(readWorkspace(client, 'user-a')?.requirements).toEqual([])
    expect(readWorkspace(client, 'user-b')).toBeUndefined()
  })

  it('dedupes in-flight reads, skips a fresh cache, and refetches when forced', async () => {
    const client = createQueryClient()
    const queryKey = queryKeys.workspace('user-a')
    let calls = 0
    const queryFn = async () => {
      calls += 1
      await new Promise(resolve => setTimeout(resolve, 15))
      return { version: calls }
    }

    const [first, second] = await Promise.all([
      client.fetchQuery({ queryKey, staleTime: WORKSPACE_STALE_MS, queryFn }),
      client.fetchQuery({ queryKey, staleTime: WORKSPACE_STALE_MS, queryFn }),
    ])
    expect(first).toEqual(second)
    expect(calls).toBe(1)

    await client.fetchQuery({ queryKey, staleTime: WORKSPACE_STALE_MS, queryFn })
    expect(calls).toBe(1)

    await client.cancelQueries({ queryKey })
    const refreshed = await client.fetchQuery({ queryKey, staleTime: 0, queryFn })
    expect(refreshed).toEqual({ version: 2 })
    expect(calls).toBe(2)
  })

  it('drops every user cache on clear', async () => {
    const client = createQueryClient()
    await client.fetchQuery({
      queryKey: queryKeys.workspace('user-a'),
      queryFn: async () => ({ secret: 'a' }),
    })
    await client.fetchQuery({
      queryKey: queryKeys.workspace('user-b'),
      queryFn: async () => ({ secret: 'b' }),
    })
    client.clear()
    expect(client.getQueryData(queryKeys.workspace('user-a'))).toBeUndefined()
    expect(client.getQueryData(queryKeys.workspace('user-b'))).toBeUndefined()
  })
})
