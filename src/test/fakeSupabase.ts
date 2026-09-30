// Query builder palsu untuk menguji services tanpa jaringan: merekam setiap pemanggilan berantai.
export interface FakeResult {
  data?: unknown
  error?: { code?: string; message: string } | null
  count?: number | null
}

export interface Call {
  method: string
  args: unknown[]
}

export function createFakeSupabase() {
  const calls: Call[] = []
  const results: FakeResult[] = []

  function builder(): unknown {
    const target = {
      then(resolve: (r: FakeResult) => unknown, reject?: (e: unknown) => unknown) {
        const r = results.shift() ?? { data: null, error: null }
        return Promise.resolve({ data: r.data ?? null, error: r.error ?? null, count: r.count ?? null }).then(resolve, reject)
      },
    }
    return new Proxy(target, {
      get(obj, prop: string) {
        if (prop === 'then') return obj.then
        return (...args: unknown[]) => {
          calls.push({ method: prop, args })
          return builder()
        }
      },
    })
  }

  const client = {
    from: (table: string) => {
      calls.push({ method: 'from', args: [table] })
      return builder()
    },
    rpc: (fn: string, params: unknown) => {
      calls.push({ method: 'rpc', args: [fn, params] })
      return builder()
    },
  }

  return {
    client,
    calls,
    /** Hasil untuk query berikutnya (urutan FIFO). */
    queue: (...r: FakeResult[]) => results.push(...r),
    methods: () => calls.map((c) => c.method),
    find: (method: string) => calls.find((c) => c.method === method),
  }
}
