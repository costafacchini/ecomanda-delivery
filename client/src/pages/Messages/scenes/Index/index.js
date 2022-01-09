import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { fetchMessages } from './slice'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'
import SelectContactsWithFilter from '../../../../components/SelectContactsWithFilter'
import styles from './styles.module.scss'

// Precisa estilizar a mensagem
// Acredito que teria que criar um componente para renderizar certinho em duas ou três linhas cada mensagem por causa dos tipos e os erros
// Falta testes para os componentes de tela da mensagem
// Falta testes para os componentes de select

function MessagesIndex({ messages, loggedUser, dispatch }) {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    licensee: '',
    onlyErrors: false,
    contact: '',
    kind: '',
    destination: ''
  })

  useEffect(() => {
    if (loggedUser && !loggedUser.isSuper && filters.licensee !== loggedUser.licensee) {
      setFilters({ ...filters, licensee: loggedUser.licensee })
    }
  }, [loggedUser, filters])

  function handleChange({ target }) {
    setFilters({ ...filters, [target.name]: target.value })
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
      dispatch(fetchMessages(filters))
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
            <input value={filters.startDate} onChange={handleChange} className='form-control' type='date' name='startDate' id='startDate' />
          </div>
        </div>

        <div className='col-3'>
          <div className='form-group'>
            <label htmlFor='endDate'>Data final</label>
            <input value={filters.endDate} onChange={handleChange} className='form-control' type='date' name='endDate' id='endDate' />
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
        {loggedUser && loggedUser.isSuper && (
          <div className='col-6'>
            <div className=''>
              <label htmlFor='licensee' id='licensee'>Licenciado</label>
              <SelectLicenseesWithFilter
                className=''
                selectedItem={filters.licensee}
                // name='licensee'
                inputId='licensee'
                aria-labelledby='licensee'
                onChange={(e) => {
                  const inputValue = e && e.value ? e.value : ''
                  setFilters({ ...filters, licensee: inputValue })
                }}
              />
            </div>
          </div>
        )}

        <div className='col-6'>
          <div className='form-group'>
            <label htmlFor='contact'>Contato</label>
            <SelectContactsWithFilter
              className='form-select'
              name='contact'
              id='contact'
              selectedItem={filters.contact}
              onChange={(e) => {
                const inputValue = e && e.value ? e.value : ''
                setFilters({ ...filters, contact: inputValue })
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
              <th scope='col'>Departamento</th>
              <th scope='col'>Enviada?</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message._id.toString()}>
                <td>
                  <div>
                    {message.contact.name}
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
                <td>{message.text}</td>
                <td>
                  <div>
                    {message.kind}
                  </div>
                  <div>
                    <a href={message.url} download target='_blank' rel="noreferrer">
                      {message.fileName}
                    </a>
                  </div>
                </td>
                <td>{message.destination}</td>
                <td>{message.departament}</td>
                <td>{message.sended ? 'Sim' : 'Não'}</td>
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
    messages: state.messagesIndex.messages
  }
}

export default connect(mapStateToProps)(MessagesIndex)
