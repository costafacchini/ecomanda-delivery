import { useEffect, useState, useContext, useCallback } from 'react'
import { Link } from 'react-router'
import { getLicensees } from '../../../../services/licensee'
import { SimpleCrudContext } from '../../../../contexts/SimpleCrud'
import isEmpty from 'lodash/isEmpty'

function LicenseesIndex({ currentUser }) {
  const { filters, setFilters, cache } = useContext(SimpleCrudContext)
  const { addPage } = cache
  const [expression, setExpression] = useState(filters?.expression || '')

  const onFilter = useCallback(
    async (changedFilters) => {
      const newFilters = { ...filters, ...changedFilters }
      setFilters(newFilters)
      const { data: licensees } = await getLicensees(newFilters)
      addPage(licensees, newFilters)
    },
    [filters, setFilters, addPage],
  )

  useEffect(() => {
    let abortController = new AbortController()

    try {
      if (!isEmpty(filters)) return

      onFilter({ page: 1, pedidos10_active: false })
    } catch (error) {
      if (error.name === 'AbortError') {
        // Handling error thrown by aborting request
      }
    }

    return () => {
      abortController.abort()
    }
  }, [filters, onFilter])

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
            <h3 className='pr-3'>Licenciados</h3>
          </div>
          <div className=''>
            <Link to='/licensees/new' className='btn btn-primary'>
              Criar +
            </Link>
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='d-flex justify-content-between pb-2'>
          <div className=''></div>
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
                <button
                  className='btn btn-primary'
                  title='Filtre pelo licenciado'
                  onClick={() => {
                    const newFilters = { ...filters, expression: expression, page: 1 }
                    onFilter(newFilters)
                  }}
                >
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
              <th scope='col'>E-mail</th>
              <th scope='col'>Licença</th>
              <th scope='col'>Telefone</th>
              <th scope='col'>API Token</th>
              <th scope='col'></th>
            </tr>
          </thead>
          <tbody>
            {cache.records.map((licensee) => (
              <tr key={licensee.id}>
                <td>{licensee.name}</td>
                <td>{licensee.email}</td>
                <td>{licensee.licenseKind}</td>
                <td>{licensee.phone}</td>
                <td>{licensee.apiToken}</td>
                <td>
                  <Link to={`/licensees/${licensee.id}`}>
                    <i className='bi bi-pencil' />
                  </Link>
                </td>
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
                <button type='button' className='btn btn-outline-primary d-print-none' onClick={nextPage}>
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

export default LicenseesIndex
