import Form from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { createContact } from '../../../../services/contact'
import { useNavigate } from 'react-router'

function ContactNew({ currentUser }) {
  let navigate = useNavigate()
  const [errors, setErrors] = useState(null)

  return (
    <div className='row'>
      <div className='col'>
        <h3>Contato criando</h3>
        <Form errors={errors} currentUser={currentUser} onSubmit={async (values) => {
          if (values.licensee === '' && !currentUser.isSuper) {
            values.licensee = currentUser.licensee
          }
          const response = await createContact(values)

          if (response.status === 201) {
            toast.success('Contato criado com sucesso!');
            navigate('/contacts')
            setErrors(null)
          } else {
            setErrors(response.data.errors)
            toast.error('Ops! Não foi possível criar o contato.');
          }
        }} />
      </div>
    </div>
  )
}

export default ContactNew
