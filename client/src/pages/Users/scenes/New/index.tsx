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
  const navigate = useNavigate()
  const [errors, setErrors] = useState<IFormError[] | null>(null)
  const [saving, setSaving] = useState(false)

  return (
    <div className='row'>
      <div className='col'>
        <h3>Novo Usuário</h3>
        <Form
          errors={errors}
          currentUser={currentUser}
          isNew={true}
          saving={saving}
          onSubmit={async (values: IUserFormValues) => {
            if (['admin', 'super'].includes(values.role)) {
              delete values.licensee
            } else if (currentUser && currentUser.role !== 'super') {
              values.licensee = currentUser.licensee as string
            }
            setSaving(true)
            try {
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
            } finally {
              setSaving(false)
            }
          }}
        />
      </div>
    </div>
  )
}

export default UserNew
