import Form, { IUserFormValues } from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { getUser, updateUser } from '../../../../services/user'
import { useNavigate, useParams } from 'react-router'
import { useEffect } from 'react'
import type { IUser } from '../../../../types'

interface IFormError {
  message: string
}

interface UserEditProps {
  currentUser?: IUser | null
}

function UserEdit({ currentUser }: UserEditProps) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [errors, setErrors] = useState<IFormError[] | null>(null)
  const [user, setUser] = useState<IUser | null>(null)
  const [saving, setSaving] = useState(false)

  const userId = id

  useEffect(() => {
    const abortController = new AbortController()

    async function fetchUser() {
      try {
        const { data: user } = await getUser(userId!)
        setUser(user as IUser)
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Handling error thrown by aborting request
        }
      }
    }

    fetchUser()
    return () => {
      abortController.abort()
    }
  }, [userId])

  if (!user) {
    return (
      <div className='d-flex justify-content-center mt-5'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Carregando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className='row'>
      <div className='col'>
        <h3>Editando: {user.name}</h3>
        <Form
          initialValues={user as Partial<IUserFormValues>}
          currentUser={currentUser}
          errors={errors}
          isNew={false}
          saving={saving}
          onSubmit={async (values: IUserFormValues) => {
            if (['admin', 'super'].includes(values.role)) {
              delete values.licensee
            } else if (currentUser && currentUser.role !== 'super' && !values.licensee) {
              values.licensee = currentUser.licensee as string
            }
            setSaving(true)
            try {
              const response = await updateUser({ ...values, id: user.id } as IUser)

              if (response.status === 200) {
                toast.success('Usuário atualizado com sucesso!');
                navigate('/users')
                setErrors(null)
              } else {
                const data = response.data as { errors: IFormError[] }
                setErrors(data.errors)
                toast.error('Ops! Não foi possível atualizar o usuário.');
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

export default UserEdit
