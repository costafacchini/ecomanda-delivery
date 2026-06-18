import { useEffect, useState, useCallback } from 'react'
import { getMessages, resendMessage } from '../../../../services/message'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'
import SelectContactsWithFilter from '../../../../components/SelectContactsWithFilter'
import CartDescription from './components/cart'
import styles from './styles.module.scss'
import moment from 'moment-timezone'
import isEmpty from 'lodash/isEmpty'
import { toast } from 'react-toastify'
import { useApp } from '../../../../contexts/App'
import type { IMessage, IMessageFilters } from '../../../../types'
import type { IUser } from '../../../../types'

interface MessagesIndexProps {
  currentUser: IUser | null | undefined
}

type RetryStatus = 'idle' | 'loading' | 'success' | 'error'

const KIND_LABELS: Record<string, string> = {
  text: 'Texto',
  file: 'Arquivo',
  location: 'Localização',
  interactive: 'Interativa',
  cart: 'Carrinho',
}

const DESTINATION_LABELS: Record<string, string> = {
  'to-chatbot': 'Chatbot',
  'to-chat': 'Chat',
  'to-messenger': 'WhatsApp',
  'to-transfer': 'Transferência',
}

function getInitialFilters(): IMessageFilters {
  return {
    startDate: moment().subtract(3, 'hours').format('YYYY-MM-DDTHH:mm'),
    endDate: moment().format('YYYY-MM-DDTHH:mm'),
    licensee: '',
    onlyErrors: false,
    contact: '',
    kind: '',
    destination: '',
    page: 1
  }
}

function MessagesIndex({ currentUser }: MessagesIndexProps) {
  const { activeLicensee } = useApp()
  const [filters, setFilters] = useState<IMessageFilters>(getInitialFilters)

  const [records, setRecords] = useState<IMessage[]>([])
  const [lastPage, setLastPage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [retryState, setRetryState] = useState<Record<string, RetryStatus>>({})

  const showLicenseeFilter = currentUser?.role === 'super' && !activeLicensee

  function handleRetry(id: string) {
    setRetryState((prev) => ({ ...prev, [id]: 'loading' }))
    resendMessage(id)
      .then(() => setRetryState((prev) => ({ ...prev, [id]: 'success' })))
      .catch(() => setRetryState((prev) => ({ ...prev, [id]: 'error' })))
  }

  const addPage = useCallback(
    (messages: IMessage[], appliedFilters: IMessageFilters) => {
      if (appliedFilters?.page === 1) {
        setRecords(messages)
      } else {
        setRecords((prevRecords) => [...prevRecords, ...messages])
      }

      setLastPage(isEmpty(messages))
    },
    [setRecords]
  )

  const onFilter = useCallback(
    async (changedFilters: Partial<IMessageFilters>) => {
      const newFilters: IMessageFilters = { ...filters, ...changedFilters }
      setFilters(newFilters)
      setLoading(true)

      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        const apiFilters: IMessageFilters = {
          ...newFilters,
          ...(newFilters.startDate && { startDate: moment.tz(newFilters.startDate, tz).utc().toISOString() }),
          ...(newFilters.endDate && { endDate: moment.tz(newFilters.endDate, tz).utc().toISOString() }),
        }
        const { data: messages } = await getMessages(apiFilters)
        addPage(messages, newFilters)
        setHasSearched(true)
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') return
        toast.error('Erro ao carregar mensagens. Tente novamente.')
      } finally {
        setLoading(false)
      }
    },
    [filters, setFilters, addPage]
  )

  useEffect(() => {
    const licenseeObj = currentUser?.licensee as { id?: string } | string | null | undefined
    const effectiveLicensee = activeLicensee?.id ??
      (typeof licenseeObj === 'object' && licenseeObj !== null
        ? ((licenseeObj as { id?: string; _id?: string }).id ?? (licenseeObj as { id?: string; _id?: string })._id)
        : undefined)
    if (currentUser && effectiveLicensee && filters.licensee !== effectiveLicensee) {
      setFilters({ ...filters, licensee: effectiveLicensee })
    }
  }, [currentUser, activeLicensee, filters, setFilters])

  function handleChange({ target }: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFilters({ ...filters, [target.name]: target.value, page: 1 })
  }

  function handleChangeOnlyErrors({ target }: React.ChangeEvent<HTMLInputElement>) {
    let newFilters: IMessageFilters

    if (target.checked === true) {
      newFilters = { ...filters, sended: false }
    } else {
      const { sended: _removed, ...rest } = filters
      newFilters = rest
    }

    setFilters({ ...newFilters, onlyErrors: target.checked })
  }

  function handleReset() {
    setFilters(getInitialFilters())
    setRecords([])
    setLastPage(false)
    setHasSearched(false)
  }

  function handleSubmitSearch(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()

    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      toast.error('A data inicial não pode ser posterior à data final.')
      return
    }

    const abortController = new AbortController()

    try {
      onFilter(filters)
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
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
          <h3 className='pe-3'>Mensagens</h3>
        </div>
      </div>

      <div className='row mb-3'>
        <div className='col-3'>
          <div className='form-group'>
            <label htmlFor='startDate'>Data inicial</label>
            <input
              value={filters.startDate}
              onChange={handleChange}
              className='form-control'
              type='datetime-local'
              name='startDate'
              id='startDate'
            />
          </div>
        </div>

        <div className='col-3'>
          <div className='form-group'>
            <label htmlFor='endDate'>Data final</label>
            <input
              value={filters.endDate}
              onChange={handleChange}
              className='form-control'
              type='datetime-local'
              name='endDate'
              id='endDate'
            />
          </div>
        </div>

        <div className='form-group col-3'>
          <label htmlFor='kind'>Tipo</label>
          <select value={filters.kind} name='kind' id='kind' className='form-select' onChange={handleChange}>
            <option value=''>Todos</option>
            <option value='text'>Texto</option>
            <option value='file'>Arquivo</option>
            <option value='location'>Localização</option>
            <option value='interactive'>Interativa</option>
            <option value='cart'>Carrinho</option>
          </select>
        </div>

        <div className='form-group col-3'>
          <label htmlFor='destination'>Destino</label>
          <select
            value={filters.destination}
            name='destination'
            id='destination'
            className='form-select'
            onChange={handleChange}
          >
            <option value=''>Todos</option>
            <option value='to-chatbot'>Chatbot</option>
            <option value='to-chat'>Chat</option>
            <option value='to-messenger'>WhatsApp</option>
            <option value='to-transfer'>Transferência</option>
          </select>
        </div>
      </div>

      <div className='row mb-3'>
        {showLicenseeFilter && (
          <div className='col-6'>
            <div className='form-group'>
              <label htmlFor='licensee' id='licensee'>
                Licenciado
              </label>
              <SelectLicenseesWithFilter
                name='licensee'
                aria-labelledby='licensee'
                selectedItem={null}
                onChange={(e: { value?: string } | null) => {
                  const inputValue = e && e.value ? e.value : ''
                  const newFilters: IMessageFilters = { ...filters, licensee: inputValue, page: 1 }
                  setFilters(newFilters)
                }}
              />
            </div>
          </div>
        )}
        {/* TODO: sector filter for admin — deferred */}

        <div className={showLicenseeFilter ? 'col-6' : 'col-12'}>
          <div className='form-group'>
            <label htmlFor='contact' id='contact'>
              Contato
            </label>
            <SelectContactsWithFilter
              name='contact'
              aria-labelledby='contact'
              selectedItem={filters.contact}
              onChange={(e: { value?: string } | null) => {
                const inputValue = e && e.value ? e.value : ''
                const newFilters: IMessageFilters = { ...filters, contact: inputValue, page: 1 }
                setFilters(newFilters)
              }}
              licensee={filters.licensee}
            />
          </div>
        </div>

        <div className='col-12 mt-3'>
          <div className='form-check'>
            <input
              checked={filters.onlyErrors}
              onChange={handleChangeOnlyErrors}
              type='checkbox'
              className='form-check-input'
              name='onlyErrors'
              id='onlyErrors'
            />
            <label className='form-check-label' htmlFor='onlyErrors'>
              Apenas mensagens de erro
            </label>
          </div>
        </div>
      </div>

      <div className='row justify-content-end mb-3'>
        <div className='col-auto'>
          <button
            type='button'
            className='btn btn-outline-secondary me-2'
            onClick={handleReset}
          >
            Limpar filtros
          </button>
          <button
            type='button'
            className='btn btn-primary'
            aria-label='Pesquisar mensagens'
            onClick={handleSubmitSearch}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true' />
                Pesquisando...
              </>
            ) : 'Pesquisar'}
          </button>
        </div>
      </div>

      <div className='row mt-3'>
        <table className={`${styles.stickyHeader} table table-striped table-hover table-bordered`}>
          <thead>
            <tr>
              <th scope='col'>Contato</th>
              <th scope='col'>Texto</th>
              <th scope='col'>Tipo</th>
              <th scope='col'>Destino</th>
              <th scope='col'>Data</th>
              <th scope='col'>Enviada</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className='text-center text-muted py-4'>
                  <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true' />
                  Carregando...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className='text-center text-muted py-4'>
                  {hasSearched
                    ? 'Nenhuma mensagem encontrada.'
                    : 'Aplique os filtros e clique em Pesquisar para ver as mensagens.'}
                </td>
              </tr>
            ) : records.map((message) => (
              <tr key={message.id}>
                <td>
                  <div>
                    {message.contact?.name}
                    {message.sector && <span className='badge bg-secondary ms-1'>{message.sector.name}</span>}
                  </div>
                  {message.error && (
                    <div>
                      <details className='mt-1'>
                        <summary className='text-muted'>Visualizar erro</summary>
                        <p className='mb-0'>{message.error}</p>
                      </details>
                      <div className='mt-1'>
                        <button
                          type='button'
                          className='btn btn-sm btn-outline-warning'
                          disabled={retryState[message.id] === 'loading'}
                          onClick={() => handleRetry(message.id)}
                        >
                          {retryState[message.id] === 'loading' ? 'Reenviando...' : 'Reenviar'}
                        </button>
                        {retryState[message.id] === 'success' && (
                          <span className='text-success small ms-2'>Reenviado!</span>
                        )}
                        {retryState[message.id] === 'error' && (
                          <span className='text-danger small ms-2'>Erro ao reenviar.</span>
                        )}
                      </div>
                    </div>
                  )}
                </td>
                <td>
                  {message.kind === 'location' && (
                    <>
                      <a
                        href={`http://maps.google.com/maps?q=${message.latitude},${message.longitude}&ll=${message.latitude},${message.longitude}&z=17`}
                        target='_blank'
                        rel='noreferrer'
                      >
                        <i className='bi bi-geo-alt'></i>
                      </a>
                      {` (${message.latitude}, ${message.longitude})`}
                    </>
                  )}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {message.kind === 'cart' && Boolean(message.cart) && <CartDescription cart={message.cart as any} />}
                  {message.kind !== 'location' && message.kind !== 'cart' && <p className='mb-0'>{message.text}</p>}
                </td>
                <td>
                  <div>{KIND_LABELS[message.kind] ?? message.kind}</div>
                  <div>
                    {message.url && (
                      <a href={message.url} download target='_blank' rel='noreferrer'>
                        {message.fileName}
                      </a>
                    )}
                    {message.trigger && (
                      <a href={`#/triggers/${message.trigger._id.toString()}`} target='_blank' rel='noreferrer'>
                        {message.trigger.name}
                      </a>
                    )}
                  </div>
                </td>
                <td>{DESTINATION_LABELS[message.destination] ?? message.destination}</td>
                <td>{moment(message.createdAt).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('DD/MM/YYYY HH:mm:ss')}</td>
                <td>{message.sended ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <section>
          <div className='container'>
            {!lastPage && hasSearched && (
              <div className='row'>
                <div className='col text-center mt-3'>
                  <button
                    type='button'
                    className='btn btn-outline-primary d-print-none'
                    disabled={loading}
                    onClick={() => {
                      onFilter({ ...filters, page: (filters.page ?? 1) + 1 })
                    }}
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
      </div>
    </>
  )
}

export default MessagesIndex
