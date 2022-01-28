import { useState } from 'react'
import { connect } from 'react-redux'
import { fetchBilling } from './slice'
import styles from './styles.module.scss'

function BillingIndex({ licensees, dispatch }) {
  const [filters, setFilters] = useState({
    reportDate: '',
  })

  function handleChange({ target }) {
    setFilters({ ...filters, [target.name]: target.value })
  }

  function handleSubmitSearch(e) {
    e.preventDefault()

    let abortController = new AbortController()

    try {
      dispatch(fetchBilling({ ...filters }))
    } catch (error) {
      if (error.name === 'AbortError') {
        // Handling error thrown by aborting request
      }
    }

    return () => {
      abortController.abort()
    }
  }

  return (
    <>
      <div className='d-flex justify-content-between pb-2'>
        <div className=''>
          <h3 className='pr-3'>Faturamento</h3>
        </div>
      </div>

      <div className='row'>
        <div className='col-3'>
          <div className='form-group'>
            <label htmlFor='reportDate'>Data base do relatório</label>
            <input value={filters.reportDate} onChange={handleChange} className='form-control' type='date' name='reportDate' id='reportDate' />
          </div>
        </div>
      </div>

      <div className='row justify-content-end'>
        <div className='col-1'>
          <button type='button' className='btn btn-primary' onClick={handleSubmitSearch} >Pesquisar</button>
        </div>
      </div>

      <div className='row mt-3'>
        <table className={`${styles.stickyHeader} table table-striped table-hover table table-bordered`} >
          <thead>
            <tr>
              <th scope='col'>Licenciado</th>
            </tr>
          </thead>
          <tbody>
            {licensees.map((licensee) => (
              <tr key={licensee._id.toString()}>
                <td>
                  <div>
                    {licensee.contact?.name}
                  </div>
                  {licensee.error && (
                    <div>
                      <details className='mt-1'>
                        <summary className='text-muted'>Visualizar erro</summary>
                        <p>
                          {licensee.error}
                        </p>
                      </details>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

const mapStateToProps = (state) => {
  return {
    licensees: state.reports.billingIndex.licensees
  }
}

export default connect(mapStateToProps)(BillingIndex)
