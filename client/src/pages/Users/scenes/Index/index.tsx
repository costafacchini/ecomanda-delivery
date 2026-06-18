import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router'
import { getUsers } from '../../../../services/user'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'
import { useSimpleCrud } from '../../../../contexts/SimpleCrud'
import isEmpty from 'lodash/isEmpty'
import type { IUser, IUserFilters } from '../../../../types'

const ROLE_LABELS: Record<string, string> = {
  agent: 'Agente',
  supervisor: 'Supervisor',
  admin: 'Administrador',
  super: 'Super',
}

interface UsersIndexProps {
  currentUser?: IUser | null
}

function UsersIndex({ currentUser }: UsersIndexProps) {
  const { filters, setFilters, cache } = useSimpleCrud()
  const { addPage } = cache
  const userFilters = filters as IUserFilters | undefined
  const [expression, setExpression] = useState(userFilters?.expression || '')
  const [loading, setLoading] = useState(false)

  const onFilter = useCallback(
    async (changedFilters: Partial<IUserFilters>) => {
      const newFilters: IUserFilters = { ...userFilters, ...changedFilters }
      setFilters(newFilters)
      setLoading(true)
      try {
        const { data: users } = await getUsers(newFilters)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        addPage(users as any, newFilters)
      } finally {
        setLoading(false)
      }
    },
    [userFilters, setFilters, addPage]
  )

  useEffect(() => {
    const abortController = new AbortController()

    try {
      if (!isEmpty(userFilters)) return

      onFilter({ page: 1 })
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Handling error thrown by aborting request
      }
    }

    return () => {
      abortController.abort()
    }
  }, [userFilters, onFilter])

  useEffect(() => {
    if (isEmpty(userFilters)) return

    const licenseeObj = currentUser?.licensee as { id?: string } | string | null | undefined
    const licenseId = typeof licenseeObj === 'object' && licenseeObj !== null ? licenseeObj.id : undefined
    if (currentUser && currentUser.role !== 'super' && userFilters?.licensee !== licenseId) {
      const newFilters: IUserFilters = { ...userFilters, licensee: licenseId, page: 1 }
      onFilter(newFilters)
    }
  }, [currentUser, userFilters, onFilter])

  function changeExpression(event: React.ChangeEvent<HTMLInputElement>) {
    setExpression(event.target.value)
  }

  function nextPage() {
    const newFilters: IUserFilters = { ...userFilters, page: (userFilters?.page ?? 1) + 1 }
    onFilter(newFilters)
  }

  return (
    <>
      <div className='row'>
        <div className='d-flex justify-content-between pb-2'>
          <div className=''>
            <h3 className='pe-3'>Usuários</h3>
          </div>
          <div className=''>
            <Link to='/users/new' className='btn btn-primary'>Novo Usuário</Link>
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
                  selectedItem={null}
                  onChange={(e: { value?: string } | null) => {
                    const inputValue = e && e.value ? e.value : ''
                    const newFilters: IUserFilters = { ...userFilters, licensee: inputValue, page: 1 }
                    onFilter(newFilters)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='d-flex justify-content-end pb-2'>
          <div className='input-group w-50'>
            <input
              className='form-control'
              name='expression'
              type='text'
              value={expression}
              placeholder='Digite a expressão'
              onChange={changeExpression}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onFilter({ ...userFilters, expression, page: 1 })
                }
              }}
            />
            <button
              className='btn btn-primary'
              title='Filtre pelo usuário'
              aria-label='Pesquisar usuários'
              onClick={() => {
                onFilter({ ...userFilters, expression, page: 1 })
              }}
            >
              <i className='bi bi-search'></i>
            </button>
          </div>
        </div>
      </div>
      <div className='row'>
        <table className='table'>
          <thead>
            <tr>
              <th scope='col'>Nome</th>
              <th scope='col'>E-mail</th>
              <th scope='col'>Perfil</th>
              <th scope='col'>Ativo</th>
              <th scope='col'></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className='text-center text-muted py-4'>
                  <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true' />
                  Carregando...
                </td>
              </tr>
            ) : (cache.records as unknown as IUser[]).length === 0 ? (
              <tr>
                <td colSpan={5} className='text-center text-muted py-4'>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (cache.records as unknown as IUser[]).map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{ROLE_LABELS[user.role] ?? user.role}</td>
                <td>{user.active ? 'Sim' : 'Não'}</td>
                <td>
                  <Link to={`/users/${user.id}`} aria-label={`Editar ${user.name}`}>
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
                <button
                  type='button'
                  className='btn btn-outline-primary d-print-none'
                  onClick={nextPage}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true' />
                      Carregando...
                    </>
                  ) : 'Carregar mais'}
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
