import Form from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { getContact, updateContact } from '../services/contact'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'

function ContactEdit({ loggedUser }) {
  const navigate = useNavigate()
  let { id } = useParams()
  const [errors, setErrors] = useState(null)
  const [contact, setContact] = useState(null)

  const contactId = id

  useEffect(() => {
    async function fetchContact() {
      const { data: licensee } = await getContact(contactId)
      setContact(licensee)
    }

    fetchContact()
  }, [contactId])

  if (!contact) return null

  return (
    <div className='row'>
      <div className='col'>
        <h3>Contato editando</h3>
        <Form
          initialValues={contact}
          loggedUser={loggedUser}
          errors={errors}
          onSubmit={async (values) => {
            const response = await updateContact(values)

            if (response.status === 200) {
              toast.success('Contato atualizado com sucesso!');
              navigate('/contacts')
              setErrors(null)
            } else {
              setErrors(response.data.errors)
              toast.error('Ops! Não foi possível atualizar o contato.');
            }
          }}
        />
      </div>
    </div>
  )
}

export default ContactEdit
