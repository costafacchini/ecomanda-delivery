import Repository, { RepositoryMemory } from './repository'
import Trafficlight from '../models/Trafficlight'

class TrafficlightRepositoryDatabase extends Repository {
  model() {
    return Trafficlight
  }
}

class TrafficlightRepositoryMemory extends RepositoryMemory {}

export { TrafficlightRepositoryDatabase, TrafficlightRepositoryMemory }
