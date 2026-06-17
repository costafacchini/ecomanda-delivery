import Form, { IUserFormValues } from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { createUser } from '../../../../services/user'
import { useNavigate } from 'react-router'
import type { IUser } from '../../../../types'

interface IFormError {
  message: string
}

interface UserNewProps {
  currentUser?: IUser | null
}

function UserNew({ currentUser }: UserNewProps) {
  let navigate = useNavigate()
  const [errors, setErrors] = useState<IFormError[] | null>(null)

  return (
    <div className='row'>
      <div className='col'>
        <h3>Usuário criando</h3>
        <Form errors={errors} currentUser={currentUser} onSubmit={async (values: IUserFormValues) => {
          if (['admin', 'super'].includes(values.role)) {
            delete values.licensee
          } else if (currentUser && currentUser.role !== 'super') {
            values.licensee = currentUser.licensee as string
          }
          const response = await createUser({ ...values, licensee: values.licensee ?? undefined })

          if (response.status === 201) {
            toast.success('Usuário criado com sucesso!');
            navigate('/users')
            setErrors(null)
          } else {
            const data = response.data as { errors: IFormError[] }
            setErrors(data.errors)
            toast.error('Ops! Não foi possível criar o usuário.');
          }
        }} />
      </div>
    </div>
  )
}

export default UserNew
