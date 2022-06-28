import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { fetchTemplates } from './slice'
import { useEffect, useState } from 'react'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'

function TemplatesIndex({ templates, dispatch, loggedUser }) {
  const [filters, setFilters] = useState({ expression: '', page: 1, licensee: '' })
  const [expression, setExpression] = useState('')

  useEffect(() => {
    let abortController = new AbortController()

    try {
      dispatch(fetchTemplates(filters))
    } catch (error) {
      if (error.name === 'AbortError') {
        // Handling error thrown by aborting request
      }
    }

    return () => {
      abortController.abort()
    }
  }, [dispatch, filters])

  useEffect(() => {
    if (loggedUser && !loggedUser.isSuper && filters.licensee !== loggedUser.licensee) {
      setFilters({ ...filters, licensee: loggedUser.licensee })
    }
  }, [loggedUser, filters])

  function changeExpression(event) {
    setExpression(event.target.value)
  }

  if (!templates) return null

  return (
    <>
      <div className='row'>
        <div className='d-flex justify-content-between pb-2'>
          <div className=''>
            <h3 className='pr-3'>Templates</h3>
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='d-flex flex-row justify-content-end pb-2'>
          <div className='flex-column w-50'>
            {loggedUser && loggedUser.isSuper && (
              <div className='form-group'>
                <label htmlFor='licensee' id='licensee'>Licenciado</label>
                <SelectLicenseesWithFilter
                  name='licensee'
                  aria-labelledby='licensee'
                  selectedItem={filters.licensee}
                  onChange={(e) => {
                    const inputValue = e && e.value ? e.value : ''
                    setFilters({ ...filters, licensee: inputValue })
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
                <button className='btn btn-primary' title='Filtre pelo template' onClick={() => {
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
        <table className='table'>
          <thead>
            <tr>
              <th scope='col'>Nome</th>
              <th scope='col'>Namespace</th>
              <th scope='col'></th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template._id}>
                <td>{template.name}</td>
                <td>{template.namespace}</td>
                <td>
                  <Link to={`/templates/${template._id}`}><i className='bi bi-pencil' /></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <div className='container'>
          {expression === '' && (templates.length > 29) && (
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
    templates: state.templatesIndex.templates
  }
}

export default connect(mapStateToProps)(TemplatesIndex)
