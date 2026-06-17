import { useEffect, useState, useContext, useCallback } from 'react'
import { Link } from 'react-router'
import { getUsers } from '../../../../services/user'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'
import { SimpleCrudContext } from '../../../../contexts/SimpleCrud'
import isEmpty from 'lodash/isEmpty'
import type { IUser } from '../../../../types'

interface UsersIndexProps {
  currentUser?: IUser | null
}

function UsersIndex({ currentUser }: UsersIndexProps) {
  const { filters, setFilters, cache } = useContext(SimpleCrudContext)
  const { addPage } = cache
  const [expression, setExpression] = useState(filters?.expression || '')

  const onFilter = useCallback(
    async (changedFilters: any) => {
      const newFilters = { ...filters, ...changedFilters }
      setFilters(newFilters)
      const { data: users } = await getUsers(newFilters)
      addPage(users, newFilters)
    },
    [filters, setFilters, addPage]
  )

  useEffect(() => {
    let abortController = new AbortController()

    try {
      if (!isEmpty(filters)) return

      onFilter({ page: 1 })
    } catch (error: any) {
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

    const licenseeObj = currentUser?.licensee as { _id?: string } | string | null | undefined
    const licenseId = typeof licenseeObj === 'object' && licenseeObj !== null ? licenseeObj._id : undefined
    if (currentUser && currentUser.role !== 'super' && filters?.licensee !== licenseId) {
      const newFilters = { ...filters, licensee: licenseId, page: 1 }
      onFilter(newFilters)
    }
  }, [currentUser, filters, onFilter])

  function changeExpression(event: React.ChangeEvent<HTMLInputElement>) {
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
            {currentUser && currentUser.role === 'super' && (
              <div className='form-group'>
                <label htmlFor='licensee' id='licensee'>Licenciado</label>
                <SelectLicenseesWithFilter
                  name='licensee'
                  aria-labelledby='licensee'
                  selectedItem={filters?.licensee}
                  onChange={(e: any) => {
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
                <button className='btn btn-primary' title='Filtre pelo usuário' onClick={() => {
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
            {cache.records.map((user: any) => (
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

export default UsersIndex
