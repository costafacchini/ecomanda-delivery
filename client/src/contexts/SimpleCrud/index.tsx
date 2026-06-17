import { createContext, useCallback, useContext, useState } from 'react'
import isEmpty from 'lodash/isEmpty'

interface ISimpleCrudFilters {
  page?: number
  [key: string]: unknown
}

interface ISimpleCrudRecord {
  id: string | number
  [key: string]: unknown
}

interface ISimpleCrudCache {
  records: ISimpleCrudRecord[]
  addRecord: (record: ISimpleCrudRecord) => void
  updateRecord: (record: ISimpleCrudRecord) => void
  removeRecord: (record: ISimpleCrudRecord) => void
  addPage: (records: ISimpleCrudRecord[], filters: ISimpleCrudFilters) => void
  lastPage: boolean
}

interface ISimpleCrudContext {
  cache: ISimpleCrudCache
  filters: ISimpleCrudFilters | undefined
  setFilters: (filters: ISimpleCrudFilters | undefined) => void
}

const SimpleCrudContext = createContext<ISimpleCrudContext | null>(null)

export function useSimpleCrud(): ISimpleCrudContext {
  const ctx = useContext(SimpleCrudContext)
  if (!ctx) throw new Error('useSimpleCrud must be used within SimpleCrudContextProvider')
  return ctx
}

const SimpleCrudContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [records, setRecords] = useState<ISimpleCrudRecord[]>([])
  const [filters, setFilters] = useState<ISimpleCrudFilters | undefined>()
  const [lastPage, setLastPage] = useState(false)

  function addRecord(record: ISimpleCrudRecord) {
    const newRecords = [record, ...records]
    setRecords(newRecords)
  }

  function updateRecord(record: ISimpleCrudRecord) {
    const newRecords = records.map((cachedRecord) => (cachedRecord.id === record.id ? record : cachedRecord))
    setRecords(newRecords)
  }

  function removeRecord(record: ISimpleCrudRecord) {
    const newRecords = records.filter((cachedRecord) => cachedRecord.id !== record.id)
    setRecords(newRecords)
  }

  const addPage = useCallback(
    (records: ISimpleCrudRecord[], filters: ISimpleCrudFilters) => {
      if (filters?.page === 1) {
        setRecords(records)
      } else {
        setRecords((prevRecords) => [...prevRecords, ...records])
      }

      setLastPage(isEmpty(records))
    },
    [setRecords]
  )

  const cache: ISimpleCrudCache = {
    records,
    addRecord,
    updateRecord,
    removeRecord,
    addPage,
    lastPage,
  }

  return <SimpleCrudContext.Provider value={{ cache, filters, setFilters }}>{children}</SimpleCrudContext.Provider>
}

export { SimpleCrudContextProvider, SimpleCrudContext }
