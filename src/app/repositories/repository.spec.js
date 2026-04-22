import Repository from '@repositories/repository'

class FakeRepository extends Repository {
  constructor(model) {
    super()
    this._model = model
  }

  model() {
    return this._model
  }
}

describe('repository base class', () => {
  it('returns undefined for model by default', () => {
    const repository = new Repository()

    expect(repository.model()).toBeUndefined()
  })

  it('finds the first record and populates requested relations', async () => {
    const result = { id: 'record-1' }
    const query = Promise.resolve(result)
    query.populate = jest.fn().mockReturnValue(query)

    const model = {
      findOne: jest.fn().mockReturnValue(query),
    }

    const repository = new FakeRepository(model)
    const record = await repository.findFirst(null, ['contact', 'licensee'])

    expect(model.findOne).toHaveBeenCalledWith({})
    expect(query.populate).toHaveBeenNthCalledWith(1, 'contact')
    expect(query.populate).toHaveBeenNthCalledWith(2, 'licensee')
    expect(record).toEqual(result)
  })

  it('creates a record with explicit fields', async () => {
    const created = { id: 'record-2' }
    const model = {
      create: jest.fn().mockResolvedValue(created),
    }

    const repository = new FakeRepository(model)
    const record = await repository.create({ name: 'Acme' })

    expect(model.create).toHaveBeenCalledWith({ name: 'Acme' })
    expect(record).toEqual(created)
  })

  it('creates an empty record when null fields are provided', async () => {
    const created = { id: 'record-2-null' }
    const model = {
      create: jest.fn().mockResolvedValue(created),
    }

    const repository = new FakeRepository(model)
    const record = await repository.create(null)

    expect(model.create).toHaveBeenCalledWith({})
    expect(record).toEqual(created)
  })

  it('updates a record with empty fields when null is provided', async () => {
    const updated = { acknowledged: true }
    const model = {
      updateOne: jest.fn().mockResolvedValue(updated),
    }

    const repository = new FakeRepository(model)
    const status = await repository.update('record-3', null)

    expect(model.updateOne).toHaveBeenCalledWith({ _id: 'record-3' }, { $set: {} }, { runValidators: true })
    expect(status).toEqual(updated)
  })

  it('updates a record with explicit fields', async () => {
    const updated = { acknowledged: true }
    const model = {
      updateOne: jest.fn().mockResolvedValue(updated),
    }

    const repository = new FakeRepository(model)
    const status = await repository.update('record-3', { active: false })

    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: 'record-3' },
      { $set: { active: false } },
      { runValidators: true },
    )
    expect(status).toEqual(updated)
  })

  it('finds records with explicit filters', async () => {
    const found = [{ id: 'record-4' }]
    const model = {
      find: jest.fn().mockResolvedValue(found),
    }

    const repository = new FakeRepository(model)
    const records = await repository.find({ active: true })

    expect(model.find).toHaveBeenCalledWith({ active: true })
    expect(records).toEqual(found)
  })

  it('finds records with empty filters when null is provided', async () => {
    const found = [{ id: 'record-4-null' }]
    const model = {
      find: jest.fn().mockResolvedValue(found),
    }

    const repository = new FakeRepository(model)
    const records = await repository.find(null)

    expect(model.find).toHaveBeenCalledWith({})
    expect(records).toEqual(found)
  })

  it('saves a document through its save method', async () => {
    const saved = { id: 'record-5' }
    const document = {
      save: jest.fn().mockResolvedValue(saved),
    }

    const repository = new FakeRepository({})
    const record = await repository.save(document)

    expect(document.save).toHaveBeenCalledTimes(1)
    expect(record).toEqual(saved)
  })
})
