import Form from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { createContact } from '../../../../services/contact'
import { useNavigate } from 'react-router-dom'

function ContactNew({ loggedUser }) {
  let navigate = useNavigate()
  const [errors, setErrors] = useState(null)

  return (
    <div className='row'>
      <div className='col'>
        <h3>Contato criando</h3>
        <Form errors={errors} loggedUser={loggedUser} onSubmit={async (values) => {
          if (values.licensee === '' && !loggedUser.isSuper) {
            values.licensee = loggedUser.licensee
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
