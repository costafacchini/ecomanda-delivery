import { Link } from "react-router-dom"
import { connect } from 'react-redux'
import { fetchContacts } from './slice'
import { useEffect } from "react"

function ContactsIndex({ contacts, dispatch }) {

  useEffect(() => {
    dispatch(fetchContacts())
  }, [dispatch])

  return (
    <>
      <div className='d-flex justify-content-between pb-2'>
        <div className=''>
          <h3 className='pr-3'>Contatos</h3>
        </div>
        <div className=''>
          <Link to='/contacts/new' className='btn btn-primary'>Criar +</Link>
        </div>
      </div>
      <div className='row'>
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
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.name}</td>
                <td>{contact.email}</td>
                <td>{contact.licenseKind}</td>
                <td><Link to={`/contacts/${contact.id}`}><i className="bi bi-pencil" /></Link></td>
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
    contacts: state.contactsIndex.contacts
  }
}

export default connect(mapStateToProps)(ContactsIndex)
