import { useState, useEffect } from 'react'
import styles from './styles.module.scss'
import { io } from 'socket.io-client'
import moment from 'moment'

function totalMessages(licensees) {
  return licensees.reduce((total, licensee) => {
    const licenseeTotal = licensee.days.reduce((sum, day) => sum + day.count, 0)
    return total + licenseeTotal
  }, 0)
}

function MessageIndex() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [records, setRecords] = useState([])
  const [filters, setFilters] = useState({ initialDate: '', endDate: '' })

  useEffect(() => {
    const socket = io()
    socket.on('send_licensees_messages_by_day', (data) => {
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
    socket.emit('load_licensees_messages_by_day', filters)
    setIsSubmitting(true)
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
            <label htmlFor='initialDate'>Data inicial</label>
            <input
              value={filters.initialDate}
              onChange={handleChange}
              className='form-control'
              type='date'
              name='initialDate'
              id='reportDinitialDateate'
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
              type='date'
              name='endDate'
              id='endDate'
            />
          </div>
        </div>
      </div>

      <div className='row justify-content-end'>
        <div className='col-1'>
          <button type='button' disabled={isSubmitting} className='btn btn-primary' onClick={handleSubmitSearch}>
            Pesquisar
          </button>
        </div>
      </div>

      <div className='row mt-3'>
        <table className={`${styles.stickyHeader} table table-striped table-hover table table-bordered`}>
          <thead>
            <tr>
              <th scope='col'>Licenciado</th>
              {records.length > 0 && records[0].days.map((day) => (
                <th key={day.date} scope='col'>
                  {moment(day.date).format('DD/MM')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((licensee) => (
              <tr key={licensee._id.toString()}>
                <td>{licensee.name}</td>
                {licensee.days.map((day) => (
                  <td key={day.date}>{day.count}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>Total de Mensagens</td>
              <td>{totalMessages(records)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}

export default MessageIndex
