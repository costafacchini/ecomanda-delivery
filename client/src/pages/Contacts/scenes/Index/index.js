import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { fetchContacts, addContacts } from './slice'
import { useEffect, useState } from 'react'

function ContactsIndex({ contacts, dispatch }) {
  const [filters, setFilters] = useState({ expression: '', page: 1 })
  const [expression, setExpression] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let abortController = new AbortController()

    try {
      dispatch(fetchContacts({
        page: 1,
        expression: '',
      }))
    } catch (error) {
      if (error.name === 'AbortError') {
          // Handling error thrown by aborting request
      }
    }

    return () => {
      abortController.abort()
    }
  }, [dispatch])

  useEffect(() => {
    if (page === 1) return

    let abortController = new AbortController()

    try {
      dispatch(addContacts({
        page,
        expression: '',
      }))
    } catch (error) {
      if (error.name === 'AbortError') {
        // Handling error thrown by aborting request
      }
    }

    return () => {
      abortController.abort()
    }
  }, [dispatch, page])

  useEffect(() => {
    let abortController = new AbortController()

    try {
      dispatch(fetchContacts(filters))
    } catch (error) {
      if (error.name === 'AbortError') {
        // Handling error thrown by aborting request
      }
    }

    return () => {
      abortController.abort()
    }
  }, [dispatch, filters])

  function changeExpression(event) {
    setExpression(event.target.value)
  }

  return (
    <>
      <div className='row'>
        <div className='d-flex justify-content-between pb-2'>
          <div className=''>
            <h3 className='pr-3'>Contatos</h3>
          </div>
          <div className=''>
            <Link to='/contacts/new' className='btn btn-primary'>Criar +</Link>
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='d-flex justify-content-between pb-2'>
          <div className=''>
          </div>
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
              <div className='input-group-append'>
                <button className='btn btn-primary' title='Filtre pelo contato' onClick={() => {
                  setPage(1)
                  setFilters({ expression, page })
                }}>
                  <i className='bi bi-search'></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='row'>
        <table className='table'>
          <thead>
            <tr>
              <th scope='col'>Nome</th>
              <th scope='col'>Número</th>
              <th scope='col'>Tipo</th>
              <th scope='col'>E-mail</th>
              <th scope='col'></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.name}</td>
                <td>{contact.number}</td>
                <td>{contact.type}</td>
                <td>{contact.email}</td>
                <td><Link to={`/contacts/${contact.id}`}><i className='bi bi-pencil' /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <div className='container'>
          {expression === '' && (contacts.length > 29) && (
            <div className='row'>
              <div className='col text-center mt-3'>
                <button type='button' className='btn btn-outline-primary d-print-none' onClick={() => setPage(page + 1)}>
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

const mapStateToProps = (state) => {
  return {
    contacts: state.contactsIndex.contacts
  }
}

export default connect(mapStateToProps)(ContactsIndex)
