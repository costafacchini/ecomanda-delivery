import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router'
import { getLicensees } from '../../../../services/licensee'
import { useSimpleCrud } from '../../../../contexts/SimpleCrud'
import isEmpty from 'lodash/isEmpty'
import type { ILicensee, IUser } from '../../../../types'

interface LicenseeFilters {
  page: number
  expression?: string
  pedidos10_active?: boolean
  [key: string]: unknown
}

interface LicenseesIndexProps {
  currentUser?: IUser | null
}

function LicenseesIndex({ currentUser }: LicenseesIndexProps) {
  const { filters, setFilters, cache } = useSimpleCrud()
  const { addPage } = cache
  const licenseeFilters = filters as LicenseeFilters | undefined
  const [expression, setExpression] = useState<string>(licenseeFilters?.expression || '')

  const onFilter = useCallback(
    async (changedFilters: LicenseeFilters) => {
      const newFilters: LicenseeFilters = { ...licenseeFilters, ...changedFilters }
      setFilters(newFilters)
      const { data: licensees } = await getLicensees(newFilters)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addPage(licensees as any, newFilters)
    },
    [licenseeFilters, setFilters, addPage],
  )

  useEffect(() => {
    let abortController = new AbortController()

    try {
      if (!isEmpty(licenseeFilters)) return

      onFilter({ page: 1, pedidos10_active: false })
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Handling error thrown by aborting request
      }
    }

    return () => {
      abortController.abort()
    }
  }, [licenseeFilters, onFilter])

  function changeExpression(event: React.ChangeEvent<HTMLInputElement>) {
    setExpression(event.target.value)
  }

  function nextPage() {
    const newFilters: LicenseeFilters = { ...licenseeFilters, page: (licenseeFilters?.page ?? 1) + 1 }
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
              <button
                className='btn btn-primary'
                title='Filtre pelo licenciado'
                aria-label='Pesquisar licenciados'
                onClick={() => {
                  const newFilters: LicenseeFilters = { ...licenseeFilters, expression: expression, page: 1 }
                  onFilter(newFilters)
                }}
              >
                <i className='bi bi-search'></i>
              </button>
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
            {(cache.records as unknown as ILicensee[]).length === 0 ? (
              <tr>
                <td colSpan={6} className='text-center text-muted py-4'>
                  Nenhum licenciado encontrado.
                </td>
              </tr>
            ) : (cache.records as unknown as ILicensee[]).map((licensee) => (
              <tr key={licensee.id}>
                <td>{licensee.name}</td>
                <td>{licensee.email}</td>
                <td>{licensee.licenseKind}</td>
                <td>{licensee.phone}</td>
                <td>{licensee.apiToken}</td>
                <td>
                  <Link to={`/licensees/${licensee.id}`} aria-label={`Editar ${licensee.name}`}>
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
