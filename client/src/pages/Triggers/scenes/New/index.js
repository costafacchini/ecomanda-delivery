import Form from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { createTrigger } from '../../../../services/trigger'
import { useNavigate } from 'react-router'

function TriggerNew({ currentUser }) {
  let navigate = useNavigate()
  const [errors, setErrors] = useState(null)

  return (
    <div className='row'>
      <div className='col'>
        <h3>Gatilho criando</h3>
        <Form errors={errors} currentUser={currentUser} onSubmit={async (values) => {
          if (values.licensee === '' && !currentUser.isSuper) {
            values.licensee = currentUser.licensee
          }
          const response = await createTrigger(values)

          if (response.status === 201) {
            toast.success('Gatilho criado com sucesso!');
            navigate('/triggers')
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

export default TriggerNew
