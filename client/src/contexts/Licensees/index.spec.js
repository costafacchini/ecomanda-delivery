import { fireEvent, render, screen } from '@testing-library/react'
import isEmpty from 'lodash/isEmpty'
import { useContext, useEffect } from 'react'
import { licenseeFactory } from '../../factories/licensee'
import { LicenseeContext, LicenseeContextProvider } from '.'

describe('<LicenseeContextProvider />', () => {
  describe('#updateRecord', () => {
    it("finds and updates the record in the page's records cache", () => {
      const record1 = licenseeFactory.build({ name: 'Licensee 1' })
      const record2 = licenseeFactory.build({ name: 'Licensee 2' })
      const record3 = licenseeFactory.build({ name: 'Licensee 3' })

      function Sandbox() {
        const { cache } = useContext(LicenseeContext)
        const { addPage } = cache

        useEffect(() => {
          // Initializes the cache with some records to be edited later.
          if (isEmpty(cache.records)) addPage([record1, record2, record3], { page: 1 })
        }, [addPage, cache])

        return (
          <>
            <button onClick={() => cache.updateRecord({ ...record2, name: 'changed' })}>Action</button>

            {/* List all the cached items only to check if one of them was updated . */}
            {cache.records.map((record) => (
              <span key={record.id}>{record.name}</span>
            ))}
          </>
        )
      }

      render(
        <LicenseeContextProvider>
          <Sandbox />
        </LicenseeContextProvider>
      )

      expect(screen.getByText(record1.name)).toBeInTheDocument()
      expect(screen.getByText(record2.name)).toBeInTheDocument()
      expect(screen.getByText(record3.name)).toBeInTheDocument()

      fireEvent.click(screen.getByText('Action'))

      expect(screen.getByText(record1.name)).toBeInTheDocument()
      expect(screen.getByText('changed')).toBeInTheDocument()
      expect(screen.getByText(record3.name)).toBeInTheDocument()
    })
  })

  describe('#addRecord', () => {
    it("adds the record on the top of page's records cache", () => {
      const record1 = licenseeFactory.build()
      const record2 = licenseeFactory.build()

      function Sandbox() {
        const { cache } = useContext(LicenseeContext)
        const { addPage } = cache

        useEffect(() => {
          // Initializes the cache with some records.
          if (isEmpty(cache.records)) addPage([record1], { page: 1 })
        }, [addPage, cache])

        return (
          <>
            <button onClick={() => cache.addRecord(record2)}>Action</button>

            {/* List all the cached items only to check if one of them was updated . */}
            {cache.records.map((record) => (
              <span key={record.id}>{`Record ${record.id}`}</span>
            ))}
          </>
        )
      }

      const { container } = render(
        <LicenseeContextProvider>
          <Sandbox />
        </LicenseeContextProvider>
      )

      expect(screen.getByText(`Record ${record1.id}`)).toBeInTheDocument()
      expect(screen.queryByText(`Record ${record2.id}`)).not.toBeInTheDocument()

      fireEvent.click(screen.getByText('Action'))

      expect(container.querySelectorAll('span')[0]).toHaveTextContent(`Record ${record2.id}`)
      expect(container.querySelectorAll('span')[1]).toHaveTextContent(`Record ${record1.id}`)
    })
  })

  describe('#removeRecord', () => {
    it("finds and removes the record in the page's records cache", () => {
      const record1 = licenseeFactory.build()
      const record2 = licenseeFactory.build()
      const record3 = licenseeFactory.build()

      function Sandbox() {
        const { cache } = useContext(LicenseeContext)
        const { addPage } = cache

        useEffect(() => {
          // Initializes the cache with some records to be removed later.
          if (isEmpty(cache.records)) addPage([record1, record2, record3], { page: 1 })
        }, [addPage, cache])

        return (
          <>
            <button onClick={() => cache.removeRecord(record2)}>Action</button>

            {/* List all the cached items only to check if one of them was removed . */}
            {cache.records.map((record) => (
              <span key={record.id}>{`Record ${record.id}`}</span>
            ))}
          </>
        )
      }

      render(
        <LicenseeContextProvider>
          <Sandbox />
        </LicenseeContextProvider>
      )

      expect(screen.getByText(`Record ${record1.id}`)).toBeInTheDocument()
      expect(screen.getByText(`Record ${record2.id}`)).toBeInTheDocument()
      expect(screen.getByText(`Record ${record3.id}`)).toBeInTheDocument()

      fireEvent.click(screen.getByText('Action'))

      expect(screen.getByText(`Record ${record1.id}`)).toBeInTheDocument()
      expect(screen.queryByText(`Record ${record2.id}`)).not.toBeInTheDocument()
      expect(screen.getByText(`Record ${record3.id}`)).toBeInTheDocument()
    })
  })

  describe('#addPage', () => {
    describe('when the filters page is 1', () => {
      it('replaces the old cached records with the new ones', () => {
        const record1 = licenseeFactory.build()
        const record2 = licenseeFactory.build()
        const record3 = licenseeFactory.build()
        const record4 = licenseeFactory.build()

        function Sandbox() {
          const { cache, setFilters, filters } = useContext(LicenseeContext)
          const { addPage } = cache

          useEffect(() => {
            // Initializes the cache with some records to be removed later.
            if (isEmpty(filters)) {
              addPage([record1, record2], { page: 1 })
            }
          }, [addPage, filters, setFilters])

          return (
            <>
              <button onClick={() => cache.addPage([record3, record4], { page: 1 })}>Action</button>

              {/* List all the cached items only to check if one of them was updated . */}
              {cache.records.map((record) => (
                <span key={record.id}>{`Record ${record.id}`}</span>
              ))}
            </>
          )
        }

        render(
          <LicenseeContextProvider>
            <Sandbox />
          </LicenseeContextProvider>
        )

        expect(screen.getByText(`Record ${record1.id}`)).toBeInTheDocument()
        expect(screen.getByText(`Record ${record2.id}`)).toBeInTheDocument()

        expect(screen.queryByText(`Record ${record3.id}`)).not.toBeInTheDocument()
        expect(screen.queryByText(`Record ${record4.id}`)).not.toBeInTheDocument()

        fireEvent.click(screen.getByText('Action'))

        expect(screen.queryByText(`Record ${record1.id}`)).not.toBeInTheDocument()
        expect(screen.queryByText(`Record ${record2.id}`)).not.toBeInTheDocument()

        expect(screen.getByText(`Record ${record3.id}`)).toBeInTheDocument()
        expect(screen.getByText(`Record ${record4.id}`)).toBeInTheDocument()
      })
    })

    describe('when the filters page is not 1', () => {
      it('merges the new records with the cached ones', () => {
        const record1 = licenseeFactory.build()
        const record2 = licenseeFactory.build()
        const record3 = licenseeFactory.build()
        const record4 = licenseeFactory.build()

        function Sandbox() {
          const { cache, filters, setFilters } = useContext(LicenseeContext)
          const { addPage } = cache

          useEffect(() => {
            // Initializes the cache with some records to be removed later.
            if (isEmpty(filters)) {
              setFilters({ page: 1 })
              addPage([record1, record2], { page: 1 })
            }
          }, [addPage, filters, setFilters])

          return (
            <>
              <button onClick={() => cache.addPage([record3, record4], { page: 2 })}>Action</button>

              {/* List all the cached items only to check if one of them was updated . */}
              {cache.records.map((record) => (
                <span key={record.id}>{`Record ${record.id}`}</span>
              ))}
            </>
          )
        }

        render(
          <LicenseeContextProvider>
            <Sandbox />
          </LicenseeContextProvider>
        )

        expect(screen.getByText(`Record ${record1.id}`)).toBeInTheDocument()
        expect(screen.getByText(`Record ${record2.id}`)).toBeInTheDocument()

        expect(screen.queryByText(`Record ${record3.id}`)).not.toBeInTheDocument()
        expect(screen.queryByText(`Record ${record4.id}`)).not.toBeInTheDocument()

        fireEvent.click(screen.getByText('Action'))

        expect(screen.getByText(`Record ${record1.id}`)).toBeInTheDocument()
        expect(screen.getByText(`Record ${record2.id}`)).toBeInTheDocument()

        expect(screen.getByText(`Record ${record3.id}`)).toBeInTheDocument()
        expect(screen.getByText(`Record ${record4.id}`)).toBeInTheDocument()
      })
    })
  })

  describe('filters', () => {
    it('updates the context filters', () => {
      const callback = jest.fn()

      function Sandbox() {
        const { filters, setFilters } = useContext(LicenseeContext)

        callback(filters)

        // Updates the filters and triggers a new render.
        useEffect(() => setFilters({ page: 1 }), [setFilters])

        return <></>
      }

      render(
        <LicenseeContextProvider>
          <Sandbox />
        </LicenseeContextProvider>
      )

      expect(callback).toHaveBeenNthCalledWith(1, undefined)
      expect(callback).toHaveBeenNthCalledWith(2, { page: 1 })
    })
  })

  describe('lastPage', () => {
    it('is false by default', () => {
      const callback = jest.fn()

      function Sandbox() {
        const { cache } = useContext(LicenseeContext)

        callback(cache.lastPage)

        return <></>
      }

      render(
        <LicenseeContextProvider>
          <Sandbox />
        </LicenseeContextProvider>
      )

      expect(callback).toHaveBeenCalledWith(false)
    })

    it('is true when the addPage is called with an empty array', () => {
      const callback = jest.fn()

      function Sandbox() {
        const { cache } = useContext(LicenseeContext)
        const { addPage } = cache

        callback(cache.lastPage)

        return (
          <>
            <button onClick={() => addPage([], { page: 1 })}>Empty array</button>
            <button onClick={() => addPage([licenseeFactory.build()], { page: 1 })}>Non empty array</button>
          </>
        )
      }

      render(
        <LicenseeContextProvider>
          <Sandbox />
        </LicenseeContextProvider>
      )

      expect(callback).toHaveBeenNthCalledWith(1, false)

      fireEvent.click(screen.getByText('Empty array'))
      expect(callback).toHaveBeenNthCalledWith(2, true)

      fireEvent.click(screen.getByText('Non empty array'))
      expect(callback).toHaveBeenNthCalledWith(3, false)
    })
  })
})
