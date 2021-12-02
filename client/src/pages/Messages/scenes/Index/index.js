import { useState } from 'react'
import { connect } from 'react-redux'
import { fetchMessages } from './slice'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'
import SelectContactsWithFilter from '../../../../components/SelectContactsWithFilter'

function MessagesIndex({ messages, loggedUser, dispatch }) {
  const [filters, setFilters] = useState({ startDate: '', endDate: '', licensee: '', onlyErrors: false, contact: '' })

  function handleChange({ target }) {
    console.log(target)
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
            <label htmlFor='startDate'>Data início</label>
            <input value={filters.startDate} onChange={handleChange} className='form-control' type='date' name='startDate' id='startDate' />
          </div>
        </div>

        <div className='col-3'>
          <div className='form-group'>
            <label htmlFor='endDate'>Data início</label>
            <input value={filters.endDate} onChange={handleChange} className='form-control' type='date' name='endDate' id='endDate' />
          </div>
        </div>

        {loggedUser && loggedUser.isSuper && (
          <div className='col-3'>
            <div className='form-group'>
              <label htmlFor='licensee'>Licenciado</label>
              <SelectLicenseesWithFilter
                className='form-select'
                selectedItem={filters.licensee}
                name='licensee'
                id='licensee'
                onChange={(e) => {
                  const inputValue = e && e.value ? e.value : ''
                  setFilters({ ...filters, licensee: inputValue })
                }}
              />
            </div>
          </div>
        )}


Precisa estilizar a mensagem
Acredito que teria que criar um componente para renderizar certinho em duas ou três linhas cada mensagem por causa dos tipos e os erros

Precisa também filtrar os contatos por licenciado
Precisa arrumar os testes do controlador de mensagens do backend
        <div className='col-3'>
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
        <table className='table'>
          <thead>
            <tr>
              <th scope='col'>Contato</th>
              <th scope='col'>Texto</th>
              <th scope='col'>Tipo</th>
              <th scope='col'>Destino</th>
              <th scope='col'>Departamento</th>
              <th scope='col'>Enviada?</th>
              <th scope='col'>Erro</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message._id.toString()}>
                <td>{message.contact}</td>
                <td>{message.text}</td>
                <td>{message.kind}</td>
                <td>{message.destination}</td>
                <td>{message.departament}</td>
                <td>{message.sended}</td>
                <td>{message.error}</td>
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
