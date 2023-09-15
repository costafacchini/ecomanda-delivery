import { useState, useEffect } from 'react'
import styles from './styles.module.scss'
import { io } from 'socket.io-client'
import moment from 'moment'
import SelectLicenseesWithFilter from '../../../../../components/SelectLicenseesWithFilter'
import JsonFormatter from 'react-json-formatter'

function IntegrationlogIndex({ currentUser }) {
  const jsonStyle = {
    falseStyle: { color: 'red' },
    trueStyle: { color: 'green' },
    stringStyle: { color: 'blue' },
    numberStyle: { color: 'darkorange' }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [records, setRecords] = useState([])

  const yesterday = moment().subtract(1, 'days').toISOString()
  const end = moment().endOf('day').toISOString()
  const [filters, setFilters] = useState({
    startDate: yesterday,
    endDate: end,
    licensee: ''
  })

  useEffect(() => {
    const socket = io()
    socket.on('send_integrationlog', data => {
      setRecords(data.data)
      setIsSubmitting(false)
    })

    return () => socket.disconnect()
  }, [setRecords])

  function handleChange({ target }) {
    setFilters({ ...filters, [target.name]: target.value })
  }

  function handleSubmitSearch(e) {
    e.preventDefault()

    const socket = io()
    socket.emit('load_integrationlog', filters)
    setIsSubmitting(true)
  }

  return (
    <>
      <div className='d-flex justify-content-between pb-2'>
        <div className=''>
          <h3 className='pr-3'>Logs de Integração</h3>
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
                  const newFilters = { ...filters, licensee: inputValue }
                  setFilters(newFilters)
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className='row justify-content-end mt-3'>
        <div className='col-1'>
          <button type='button' disabled={isSubmitting} className='btn btn-primary' onClick={handleSubmitSearch} >Pesquisar</button>
        </div>
      </div>

      <div className='row mt-3'>
        <table className={`${styles.stickyHeader} table table-striped table-hover table table-bordered`} >
          <thead>
            <tr>
              <th scope='col'>Data</th>
              <th scope='col'>Descrição</th>
              <th scope='col'>Licenciado</th>
              <th scope='col'>Contato/Carrinho</th>
              <th scope='col'>Conteúdo</th>
            </tr>
          </thead>
          <tbody>
            {records.map((integrationlog) => (
              <tr key={integrationlog._id.toString()}>
                <td>{integrationlog.createdAt ? moment(integrationlog.createdAt).format('DD/MM/YYYY') : ''}</td>
                <td>{integrationlog.log_description}</td>
                <td>{integrationlog.licensee.name}</td>
                <td>{integrationlog.contact ? integrationlog.contact.name : 'Carrinho'}</td>
                <td><JsonFormatter json={integrationlog.log_payload} tabWith={4} jsonStyle={jsonStyle} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default IntegrationlogIndex
