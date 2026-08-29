import { readFile, writeFile, mkdir, rename } from "node:fs/promises"
import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { env } from "@config/env.js"

/**
 * Minimal file-backed repository used in place of a real database for this
 * milestone. Each entity type gets its own JSON file under `DATA_DIR`.
 *
 * Concurrency model: an in-process write queue (per-repository) serializes
 * writes so two concurrent requests can't interleave a read-modify-write and
 * lose an update. Writes are atomic on disk (write to `.tmp`, then rename).
 * This is sufficient for a single-process dev/demo server — a real
 * multi-instance deployment should replace this with an actual database.
 */
export class JsonRepository<T extends { id: string }> {
  private readonly filePath: string
  private writeQueue: Promise<void> = Promise.resolve()
  private cache: T[] | null = null

  constructor(fileName: string) {
    this.filePath = join(env.DATA_DIR, fileName)
  }

  private async ensureFile(): Promise<void> {
    const dir = dirname(this.filePath)
    if (!existsSync(dir)) await mkdir(dir, { recursive: true })
    if (!existsSync(this.filePath)) {
      await writeFile(this.filePath, "[]\n", "utf-8")
    }
  }

  private async load(): Promise<T[]> {
    if (this.cache) return this.cache
    await this.ensureFile()
    const raw = await readFile(this.filePath, "utf-8")
    try {
      this.cache = raw.trim() ? (JSON.parse(raw) as T[]) : []
    } catch {
      this.cache = []
    }
    return this.cache
  }

  private async persist(records: T[]): Promise<void> {
    const tmpPath = `${this.filePath}.tmp`
    await writeFile(tmpPath, JSON.stringify(records, null, 2) + "\n", "utf-8")
    await rename(tmpPath, this.filePath)
    this.cache = records
  }

  private enqueue<R>(task: () => Promise<R>): Promise<R> {
    const result = this.writeQueue.then(task)
    this.writeQueue = result.then(
      () => undefined,
      () => undefined
    )
    return result
  }

  async findAll(): Promise<T[]> {
    return [...(await this.load())]
  }

  async findById(id: string): Promise<T | undefined> {
    const records = await this.load()
    return records.find((r) => r.id === id)
  }

  async findOne(predicate: (record: T) => boolean): Promise<T | undefined> {
    const records = await this.load()
    return records.find(predicate)
  }

  async findMany(predicate: (record: T) => boolean): Promise<T[]> {
    const records = await this.load()
    return records.filter(predicate)
  }

  async create(record: T): Promise<T> {
    return this.enqueue(async () => {
      const records = await this.load()
      records.push(record)
      await this.persist(records)
      return record
    })
  }

  async update(id: string, patch: Partial<T>): Promise<T | undefined> {
    return this.enqueue(async () => {
      const records = await this.load()
      const index = records.findIndex((r) => r.id === id)
      if (index === -1) return undefined
      const existing = records[index]
      if (!existing) return undefined
      const updated = { ...existing, ...patch } as T
      records[index] = updated
      await this.persist(records)
      return updated
    })
  }

  async delete(id: string): Promise<boolean> {
    return this.enqueue(async () => {
      const records = await this.load()
      const next = records.filter((r) => r.id !== id)
      if (next.length === records.length) return false
      await this.persist(next)
      return true
    })
  }
}
