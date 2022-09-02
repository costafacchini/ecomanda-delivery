import { createContext, useCallback, useState } from 'react'
import isEmpty from 'lodash/isEmpty'

const LicenseeContext = createContext(null)

const LicenseeContextProvider = ({ children }) => {
  const [records, setRecords] = useState([])
  const [filters, setFilters] = useState()
  const [lastPage, setLastPage] = useState(false)

  function addRecord(record) {
    const newRecords = [record, ...records]
    setRecords(newRecords)
  }

  function updateRecord(record) {
    const newRecords = records.map((cachedRecord) => (cachedRecord.id === record.id ? record : cachedRecord))
    setRecords(newRecords)
  }

  function removeRecord(record) {
    const newRecords = records.filter((cachedRecord) => cachedRecord.id !== record.id)
    setRecords(newRecords)
  }

  const addPage = useCallback(
    (records, filters) => {
      if (filters?.page === 1) {
        setRecords(records)
      } else {
        setRecords((prevRecords) => [...prevRecords, ...records])
      }

      setLastPage(isEmpty(records))
    },
    [setRecords]
  )

  const cache = {
    records,
    addRecord,
    updateRecord,
    removeRecord,
    addPage,
    lastPage,
  }

  return <LicenseeContext.Provider value={{ cache, filters, setFilters }}>{children}</LicenseeContext.Provider>
}

export { LicenseeContextProvider, LicenseeContext }
