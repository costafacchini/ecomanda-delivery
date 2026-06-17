import Repository, { RepositoryMemory } from './repository'
import Room from '../models/Room'

class RoomRepositoryDatabase extends Repository {
  model() {
    return Room
  }

  async findFirst(params = {}, relations = ['contact']) {
    return await super.findFirst(params, relations)
  }

  findOpenForContact(contactId: any) {
    return this.findFirst({ contact: contactId, closed: false })
  }

  findForAgent(_userId: any, _licenseeId: any, sectorIds: any[] = []) {
    const query: any = {}
    if (sectorIds.length > 0) {
      query.sector = { $in: sectorIds }
    }
    return this.model().find(query)
  }

  async findForLicensee(
    licenseeId: any,
    { sectorIds = [], page = 1, limit = 20 }: { sectorIds?: any[]; page?: number; limit?: number } = {},
  ) {
    const contacts = await this.model().db.model('Contact').find({ licensee: licenseeId }).select('_id').lean()
    const contactIds = contacts.map((c: any) => c._id)

    const filter: any = { contact: { $in: contactIds }, closed: false }

    if (sectorIds.length > 0) {
      filter.sector = { $in: sectorIds }
    }

    return this.model()
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit + 1)
      .populate('contact', 'name number')
      .lean()
  }
}

class RoomRepositoryMemory extends RepositoryMemory {
  async create(fields: any = {}) {
    return await super.create({
      closed: false,
      ...(fields ?? {}),
    })
  }
}

export { RoomRepositoryDatabase, RoomRepositoryMemory }
