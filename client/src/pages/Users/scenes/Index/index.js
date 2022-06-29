import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { fetchUsers } from './slice'
import { useEffect, useState } from 'react'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'

function UsersIndex({ users, dispatch, loggedUser }) {
  const [filters, setFilters] = useState({ expression: '', page: 1, licensee: '' })
  const [expression, setExpression] = useState('')

  useEffect(() => {
    let abortController = new AbortController()

    try {
      dispatch(fetchUsers(filters))
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

  if (!users) return null

  return (
    <>
      <div className='row'>
        <div className='d-flex justify-content-between pb-2'>
          <div className=''>
            <h3 className='pr-3'>Usuários</h3>
          </div>
          <div className=''>
            <Link to='/users/new' className='btn btn-primary'>Criar +</Link>
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
                <button className='btn btn-primary' title='Filtre pelo usuário' onClick={() => {
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
              <th scope="col">Ativo</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.active}</td>
                <td><Link to={`/users/${user.id}`}><i className="bi bi-pencil" /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <div className='container'>
          {expression === '' && (users.length > 29) && (
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
    users: state.usersIndex.users
  }
}

export default connect(mapStateToProps)(UsersIndex)
