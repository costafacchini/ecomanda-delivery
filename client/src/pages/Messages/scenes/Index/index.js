import { useState } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'

function MessagesIndex({ messages, loggedUser }) {

  const [filters, setFilters] = useState({ startDate: '', endDate: '', licensee: '', onlyErrors: false })

  function handleChange({ target }) {
    setFilters({ ...filters, [target.name]: target.value })
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

        {loggedUser.isSuper && (
          <div className='col-3'>
            <div className='form-group'>
              <label htmlFor='licensee'>Licenciado</label>
              <SelectLicenseesWithFilter className='form-select' selectedItem={filters.licensee} onChange={handleChange} name='licensee' id='licensee' />
            </div>
          </div>
        )}

        <div className='col-3 col-12 mt-3'>
          <div className="form-check">
            <input checked={filters.onlyErrors} onChange={handleChange} type="checkbox" className="form-check-input" name='onlyErrors' id="onlyErrors" />
            <label className="form-check-label" htmlFor="onlyErrors">Apenas mensagens de erro</label>
          </div>
        </div>
      </div>

      <div className='row justify-content-end'>
        <div className='col-1'>
          <button type='button' className='btn btn-primary'>Pesquisar</button>
        </div>
      </div>

      <div className='row mt-3'>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">E-mail</th>
              <th scope="col">Tipo</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message.id.toString()}>
                <td>{message.name}</td>
                <td>{message.email}</td>
                <td>{message.licenseKind}</td>
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
