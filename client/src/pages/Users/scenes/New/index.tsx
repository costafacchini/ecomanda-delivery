import Form from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { createUser } from '../../../../services/user'
import { useNavigate } from 'react-router'

function UserNew({ currentUser }) {
  let navigate = useNavigate()
  const [errors, setErrors] = useState(null)

  return (
    <div className='row'>
      <div className='col'>
        <h3>Usuário criando</h3>
        <Form errors={errors} currentUser={currentUser} onSubmit={async (values) => {
          if (values.licensee === '' && !currentUser.isSuper) {
            values.licensee = currentUser.licensee
          }
          const response = await createUser(values)

          if (response.status === 201) {
            toast.success('Usuário criado com sucesso!');
            navigate('/users')
            setErrors(null)
          } else {
            setErrors(response.data.errors)
            toast.error('Ops! Não foi possível criar o usuário.');
          }
        }} />
      </div>
    </div>
  )
}

export default UserNew
