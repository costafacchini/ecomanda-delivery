import Form from '../Form'
import { toast } from 'react-toastify'
import { useState, useContext } from 'react'
import { createContact } from '../../../../services/contact'
import { useNavigate } from 'react-router'
import { AppContext } from '../../../../contexts/App'

function ContactNew({ currentUser }: any) {
  const { activeLicensee } = useContext(AppContext)
  let navigate = useNavigate()
  const [errors, setErrors] = useState(null)

  return (
    <div className='row'>
      <div className='col'>
        <h3>Contato criando</h3>
        <Form errors={errors} currentUser={currentUser} activeLicensee={activeLicensee} onSubmit={async (values: any) => {
          if (!values.licensee) {
            if (currentUser.role !== 'super') {
              values.licensee = currentUser.licensee
            } else if (activeLicensee) {
              values.licensee = activeLicensee._id
            }
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
