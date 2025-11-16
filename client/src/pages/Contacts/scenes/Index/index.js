import { useEffect, useState, useCallback, useContext } from 'react'
import { Link } from 'react-router'
import { getContacts } from '../../../../services/contact'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'
import { SimpleCrudContext } from '../../../../contexts/SimpleCrud'
import isEmpty from 'lodash/isEmpty'

function ContactsIndex({ currentUser }) {
  const { filters, setFilters, cache } = useContext(SimpleCrudContext)
  const { addPage } = cache
  const [expression, setExpression] = useState(filters?.expression || '')

  const onFilter = useCallback(
    async (changedFilters) => {
      const newFilters = { ...filters, ...changedFilters }
      setFilters(newFilters)
      const { data: users } = await getContacts(newFilters)
      addPage(users, newFilters)
    },
    [filters, setFilters, addPage]
  )

  useEffect(() => {
    let abortController = new AbortController()

    try {
      if (!isEmpty(filters)) return

      onFilter({ page: 1 })
    } catch (error) {
      if (error.name === 'AbortError') {
        // Handling error thrown by aborting request
      }
    }

    return () => {
      abortController.abort()
    }
  }, [filters, onFilter])

  useEffect(() => {
    if (isEmpty(filters)) return

    if (currentUser && !currentUser.isSuper && filters?.licensee !== currentUser.licensee) {
      const newFilters = { ...filters, licensee: currentUser.licensee, page: 1 }
      onFilter(newFilters)
    }
  }, [currentUser, filters, onFilter])

  function changeExpression(event) {
    setExpression(event.target.value)
  }

  function nextPage() {
    const newFilters = { ...filters, page: filters.page + 1 }
    onFilter(newFilters)
  }

  return (
    <>
      <div className='row'>
        <div className='d-flex justify-content-between pb-2'>
          <div className=''>
            <h3 className='pr-3'>Contatos</h3>
          </div>
          <div className=''>
            <Link to='/contacts/new' className='btn btn-primary'>Criar +</Link>
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='d-flex flex-row justify-content-end pb-2'>
          <div className='flex-column w-50'>
            {currentUser && currentUser.isSuper && (
              <div className='form-group'>
                <label htmlFor='licensee' id='licensee'>Licenciado</label>
                <SelectLicenseesWithFilter
                  name='licensee'
                  aria-labelledby='licensee'
                  selectedItem={filters?.licensee}
                  onChange={(e) => {
                    const inputValue = e && e.value ? e.value : ''
                    const newFilters = { ...filters, licensee: inputValue, page: 1 }
                    onFilter(newFilters)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='d-flex justify-content-between pb-2'>
          <div className=''>
          </div>
          <div className=''>
            <div className='input-group'>
              <input
                className='form-control'
                name='expression'
                type='text'
                value={expression}
                placeholder='Digite a expressão'
                onChange={changeExpression}
              />
              <div className='input-group-append'>
                <button className='btn btn-primary' title='Filtre pelo contato' onClick={() => {
                  const newFilters = { ...filters, expression: expression, page: 1 }
                  onFilter(newFilters)
                }}>
                  <i className='bi bi-search'></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='row'>
        <table className='table'>
          <thead>
            <tr>
              <th scope='col'>Nome</th>
              <th scope='col'>Número</th>
              <th scope='col'>Tipo</th>
              <th scope='col'>E-mail</th>
              <th scope='col'></th>
            </tr>
          </thead>
          <tbody>
            {cache.records.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.name}</td>
                <td>{contact.number}</td>
                <td>{contact.type}</td>
                <td>{contact.email}</td>
                <td><Link to={`/contacts/${contact.id}`}><i className='bi bi-pencil' /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <div className='container'>
          {!cache.lastPage && (
            <div className='row'>
              <div className='col text-center mt-3'>
                <button
                  type='button'
                  className='btn btn-outline-primary d-print-none'
                  onClick={nextPage}
                >
                  Carregar mais
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default ContactsIndex
