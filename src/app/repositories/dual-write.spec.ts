import { RepositoryMemory, PrismaRepository, DualWriteRepository } from './repository'

// Minimal PrismaRepository stub backed by a RepositoryMemory for test assertions
class PrismaRepositoryMemory<T> extends PrismaRepository<T> {
  store: RepositoryMemory<T>

  constructor() {
    super()
    this.store = new RepositoryMemory<T>()
  }

  delegate() {
    return {
      findFirst: (args: any) => this.store.findFirst(args?.where ?? {}),
      findMany: (args: any) => this.store.find(args?.where ?? {}),
      create: (args: any) => this.store.create(args?.data ?? {}),
      updateMany: async (args: any) => {
        await this.store.updateMany(args?.where ?? {}, args?.data ?? {})
        return { acknowledged: true }
      },
      deleteMany: async (args: any) => {
        await this.store.delete(args?.where ?? {})
        return { acknowledged: true }
      },
      upsert: (args: any) => this.store.save(args?.create ?? {}),
    }
  }
}

describe('DualWriteRepository', () => {
  let primary: RepositoryMemory<any>
  let secondary: PrismaRepositoryMemory<any>
  let repo: DualWriteRepository<any>

  beforeEach(() => {
    primary = new RepositoryMemory()
    secondary = new PrismaRepositoryMemory()
    repo = new DualWriteRepository(primary, secondary, { asyncSecondary: false })
  })

  describe('reads', () => {
    it('findFirst reads only from primary', async () => {
      await primary.create({ name: 'Alice' })
      const result = await repo.findFirst({ name: 'Alice' })
      expect(result).toMatchObject({ name: 'Alice' })
      expect(secondary.store.items).toHaveLength(0)
    })

    it('find reads only from primary', async () => {
      await primary.create({ name: 'Alice' })
      await primary.create({ name: 'Bob' })
      const results = await repo.find({})
      expect(results).toHaveLength(2)
      expect(secondary.store.items).toHaveLength(0)
    })
  })

  describe('create', () => {
    it('writes to both primary and secondary', async () => {
      const result = await repo.create({ name: 'Alice' })
      expect(result).toMatchObject({ name: 'Alice' })
      expect(primary.items).toHaveLength(1)
      expect(secondary.store.items).toHaveLength(1)
    })

    it('returns the primary result', async () => {
      const result = await repo.create({ name: 'Alice' })
      const fromPrimary = await primary.findFirst({ name: 'Alice' })
      expect(result._id?.toString()).toEqual(fromPrimary?._id?.toString())
    })
  })

  describe('update', () => {
    it('writes to both stores', async () => {
      const record = await repo.create({ name: 'Alice' })
      await repo.update(record._id.toString(), { name: 'Alice Updated' })
      const fromPrimary = await primary.findFirst({ _id: record._id })
      expect(fromPrimary).toMatchObject({ name: 'Alice Updated' })
    })
  })

  describe('updateMany', () => {
    it('writes to both stores', async () => {
      await repo.create({ active: true })
      await repo.create({ active: true })
      await repo.updateMany({ active: true }, { active: false })
      const active = await primary.find({ active: true })
      expect(active).toHaveLength(0)
    })
  })

  describe('delete', () => {
    it('deletes from both stores', async () => {
      const record = await repo.create({ name: 'Alice' })
      await repo.delete({ _id: record._id })
      expect(primary.items).toHaveLength(0)
    })
  })

  describe('save', () => {
    it('saves to both stores', async () => {
      const record = await repo.create({ name: 'Alice' })
      record.name = 'Alice Updated'
      await repo.save(record)
      const fromPrimary = await primary.findFirst({ _id: record._id })
      expect(fromPrimary).toMatchObject({ name: 'Alice Updated' })
    })
  })

  describe('asyncSecondary (fire-and-forget)', () => {
    it('does not throw when secondary write fails', async () => {
      const failingSecondary = new PrismaRepositoryMemory()
      jest.spyOn(failingSecondary, 'save').mockRejectedValue(new Error('PG down'))

      const asyncRepo = new DualWriteRepository(primary, failingSecondary, { asyncSecondary: true })

      await expect(asyncRepo.create({ name: 'Alice' })).resolves.toMatchObject({ name: 'Alice' })
    })
  })
})
