import Repository, { RepositoryMemory } from './repository.js'
import Trafficlight from '../models/Trafficlight.js'

class TrafficlightRepositoryDatabase extends Repository {
  model() {
    return Trafficlight
  }
}

class TrafficlightRepositoryMemory extends RepositoryMemory {}

export { TrafficlightRepositoryDatabase, TrafficlightRepositoryMemory }
