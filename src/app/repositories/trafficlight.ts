import Repository, { RepositoryMemory } from './repository'
import Trafficlight from '../models/Trafficlight'
import { ITrafficlight } from '../../types'

class TrafficlightRepositoryDatabase extends Repository<ITrafficlight> {
  model() {
    return Trafficlight
  }
}

class TrafficlightRepositoryMemory extends RepositoryMemory<ITrafficlight> {}

export { TrafficlightRepositoryDatabase, TrafficlightRepositoryMemory }
