import { useEffect, useState, useCallback } from 'react'
import { getMessages } from '../../../../services/message'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'
import SelectContactsWithFilter from '../../../../components/SelectContactsWithFilter'
import CartDescription from './components/cart'
import styles from './styles.module.scss'
import moment from 'moment-timezone'
import isEmpty from 'lodash/isEmpty'

function MessagesIndex({ currentUser}) {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    licensee: '',
    onlyErrors: false,
    contact: '',
    kind: '',
    destination: '',
    page: 1
  })

  const [records, setRecords] = useState([])
  const [lastPage, setLastPage] = useState(false)

  const addPage = useCallback(
    (records, filters) => {
      if (filters?.page === 1) {
        setRecords(records)
      } else {
        setRecords((prevRecords) => [...prevRecords, ...records])
      }

      setLastPage(isEmpty(records))
    },
    [setRecords]
  )

  const onFilter = useCallback(
    async (changedFilters) => {
      const newFilters = { ...filters, ...changedFilters }
      setFilters(newFilters)
      const { data: messages } = await getMessages(newFilters)
      addPage(messages, newFilters)
    },
    [filters, setFilters, addPage]
  )

  useEffect(() => {
    if (currentUser && !currentUser.isSuper && filters.licensee !== currentUser.licensee) {
      setFilters({ ...filters, licensee: currentUser.licensee })
    }
  }, [currentUser, filters, setFilters])

  function handleChange({ target }) {
    setFilters({ ...filters, [target.name]: target.value, page: 1 })
  }

  function handleChangeOnlyErrors({ target }) {
    let newFilters

    if (target.checked === true) {
      newFilters = { ...filters, sended: false }
    } else {
      const { sended: removed, ...rest } = filters
      newFilters = rest
    }

    setFilters({ ...newFilters, onlyErrors: target.checked })
  }

  function handleSubmitSearch(e) {
    e.preventDefault()

    let abortController = new AbortController()

    try {
      onFilter(filters)
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
          <h3 className='pr-3'>Mensagens</h3>
        </div>
      </div>

      <div className='row'>
        <div className='col-3'>
          <div className='form-group'>
            <label htmlFor='startDate'>Data inicial</label>
            <input value={filters.startDate} onChange={handleChange} className='form-control' type='datetime-local' name='startDate' id='startDate' />
          </div>
        </div>

        <div className='col-3'>
          <div className='form-group'>
            <label htmlFor='endDate'>Data final</label>
            <input value={filters.endDate} onChange={handleChange} className='form-control' type='datetime-local' name='endDate' id='endDate' />
          </div>
        </div>

        <div className='form-group col-3'>
          <label htmlFor='kind'>Tipo</label>
          <select
            value={filters.kind}
            name='kind'
            id='kind'
            className='form-select'
            onChange={handleChange}
          >
            <option value=''></option>
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
            <option value=''></option>
            <option value='to-chatbot'>Chatbot</option>
            <option value='to-chat'>Chat</option>
            <option value='to-messenger'>Whatsapp</option>
            <option value='to-transfer'>Transferência</option>
          </select>
        </div>
      </div>

      <div className='row'>
        {currentUser && currentUser.isSuper && (
          <div className='col-6'>
            <div className='form-group'>
              <label htmlFor='licensee' id='licensee'>Licenciado</label>
              <SelectLicenseesWithFilter
                name='licensee'
                aria-labelledby='licensee'
                selectedItem={filters.licensee}
                onChange={(e) => {
                  const inputValue = e && e.value ? e.value : ''
                  const newFilters = { ...filters, licensee: inputValue, page: 1 }
                  setFilters(newFilters)
                }}
              />
            </div>
          </div>
        )}

        <div className='col-6'>
          <div className='form-group'>
            <label htmlFor='contact' id='contact'>Contato</label>
            <SelectContactsWithFilter
              name='contact'
              aria-labelledby='contact'
              selectedItem={filters.contact}
              onChange={(e) => {
                const inputValue = e && e.value ? e.value : ''
                const newFilters = { ...filters, contact: inputValue, page: 1 }
                setFilters(newFilters)
              }}
              licensee={filters.licensee}
            />
          </div>
        </div>

        <div className='col-3 col-12 mt-3'>
          <div className='form-check'>
            <input checked={filters.onlyErrors} onChange={handleChangeOnlyErrors} type='checkbox' className='form-check-input' name='onlyErrors' id='onlyErrors' />
            <label className='form-check-label' htmlFor='onlyErrors'>Apenas mensagens de erro</label>
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
              <th scope='col'>Contato</th>
              <th scope='col'>Texto</th>
              <th scope='col'>Tipo</th>
              <th scope='col'>Destino</th>
              <th scope='col'>Data</th>
              <th scope='col'>Enviada?</th>
            </tr>
          </thead>
          <tbody>
            {records.map((message) => (
              <tr key={message.id}>
                <td>
                  <div>
                    {message.contact?.name}
                  </div>
                  {message.error && (
                    <div>
                      <details className='mt-1'>
                        <summary className='text-muted'>Visualizar erro</summary>
                        <p>
                          {message.error}
                        </p>
                      </details>
                    </div>
                  )}
                </td>
                <td>
                  {message.kind === 'location' && (
                    <>
                      <a href={`http://maps.google.com/maps?q=${message.latitude}&ll=${message.longitude}&z=17`} target='_blank' rel='noreferrer'>
                        <i className='bi bi-geo-alt'></i>
                      </a>
                      {` (${message.text})`}
                    </>
                  )}
                  {message.kind === 'cart' && (
                    <CartDescription cart={message.cart} />
                  )}
                  {message.kind !== 'location' && message.kind !== 'cart' && (
                    <p>{message.text}</p>
                  )}
                </td>
                <td>
                  <div>
                    {message.kind}
                  </div>
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
                <td>{message.destination}</td>
                <td>{moment(message.createdAt).tz('America/Sao_Paulo').format('DD/MM/YYYY hh:mm:ss')}</td>
                <td>{message.sended ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <section>
          <div className='container'>
            {!lastPage && (
              <div className='row'>
                <div className='col text-center mt-3'>
                  <button
                    type='button'
                    className='btn btn-outline-primary d-print-none'
                    onClick={() => {
                      onFilter({ ...filters, page: filters.page + 1})
                    }}
                  >
                    Carregar mais
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
