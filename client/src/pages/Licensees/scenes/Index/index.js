import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { fetchLicensees } from './slice'
import { useEffect, useState } from 'react'

function LicenseesIndex({ licensees, dispatch }) {
  const [filters, setFilters] = useState({ expression: '', page: 1 })
  const [expression, setExpression] = useState('')

  useEffect(() => {
    let abortController = new AbortController()

    try {
      dispatch(fetchLicensees(filters))
    } catch (error) {
      if (error.name === 'AbortError') {
        // Handling error thrown by aborting request
      }
    }

    return () => {
      abortController.abort()
    }
  }, [dispatch, filters])

  function changeExpression(event) {
    setExpression(event.target.value)
  }

  return (
    <>
      <div className='row'>
        <div className='d-flex justify-content-between pb-2'>
          <div className=''>
            <h3 className='pr-3'>Licenciados</h3>
          </div>
          <div className=''>
            <Link to='/licensees/new' className='btn btn-primary'>Criar +</Link>
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
                <button className='btn btn-primary' title='Filtre pelo licenciado' onClick={() => {
                  setFilters({ ...filters, expression })
                }}>
                  <i className='bi bi-search'></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='row'>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">E-mail</th>
              <th scope="col">Licença</th>
              <th scope="col">Telefone</th>
              <th scope="col">API Token</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {licensees.map((licensee) => (
              <tr key={licensee.id}>
                <td>{licensee.name}</td>
                <td>{licensee.email}</td>
                <td>{licensee.licenseKind}</td>
                <td>{licensee.phone}</td>
                <td>{licensee.apiToken}</td>
                <td><Link to={`/licensees/${licensee.id}`}><i className="bi bi-pencil" /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <div className='container'>
          {expression === '' && (licensees.length > 29) && (
            <div className='row'>
              <div className='col text-center mt-3'>
                <button
                  type='button'
                  className='btn btn-outline-primary d-print-none'
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
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

const mapStateToProps = (state) => {
  return {
    licensees: state.licenseesIndex.licensees
  }
}

export default connect(mapStateToProps)(LicenseesIndex)
