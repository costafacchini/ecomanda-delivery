import { useState, useEffect } from 'react'
import styles from './styles.module.scss'
import { io } from 'socket.io-client'
import moment from 'moment'

function totalBilling(licensees) {
  return licensees.reduce((sum, licensee) => licensee.billing ? sum + 40 : sum, 0)
}

function BillingIndex() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [records, setRecords] = useState([])
  const [filters, setFilters] = useState({ reportDate: '' })

  useEffect(() => {
    const socket = io()
    socket.on('send_billing_report', data => {
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
    socket.emit('load_billing_report', filters)
    setIsSubmitting(true)
  }

  return (
    <>
      <div className='d-flex justify-content-between pb-2'>
        <div className=''>
          <h3 className='pr-3'>Faturamento</h3>
        </div>
      </div>

      <div className='row'>
        <div className='col-3'>
          <div className='form-group'>
            <label htmlFor='reportDate'>Data base do relatório</label>
            <input value={filters.reportDate} onChange={handleChange} className='form-control' type='date' name='reportDate' id='reportDate' />
          </div>
        </div>
      </div>

      <div className='row justify-content-end'>
        <div className='col-1'>
          <button type='button' disabled={isSubmitting} className='btn btn-primary' onClick={handleSubmitSearch} >Pesquisar</button>
        </div>
      </div>

      <div className='row mt-3'>
        <table className={`${styles.stickyHeader} table table-striped table-hover table table-bordered`} >
          <thead>
            <tr>
              <th scope='col'>Licenciado</th>
              <th scope='col'>Situação</th>
              <th scope='col'>Embarque</th>
              <th scope='col'>Primeira mensagem</th>
              <th scope='col'>Última mensagem</th>
              <th scope='col'>{moment().subtract(1, 'month').format('MM/YY')}</th>
              <th scope='col'>{moment().subtract(2, 'month').format('MM/YY')}</th>
            </tr>
          </thead>
          <tbody>
            {records.map((licensee) => (
              <tr key={licensee._id.toString()}>
                <td>{licensee.name}</td>
                <td>{licensee.billing ? 'Ativo' : 'Inativo'}</td>
                <td>{licensee.createdAt ? moment(licensee.createdAt).format('DD/MM/YYYY') : ''}</td>
                <td>{licensee.firstMessageDate ? moment(licensee.firstMessageDate).format('DD/MM/YYYY') : ''}</td>
                <td>{licensee.lastMessageDate ? moment(licensee.lastMessageDate).format('DD/MM/YYYY') : ''}</td>
                <td>{licensee.messages[0].count}</td>
                <td>{licensee.messages[1].count}</td>
              </tr>
            ))}
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>Total</td>
              <td>R$ {totalBilling(records)},00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}

export default BillingIndex
