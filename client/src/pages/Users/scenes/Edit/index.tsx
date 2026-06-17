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
  let { id } = useParams()
  const [errors, setErrors] = useState<IFormError[] | null>(null)
  const [user, setUser] = useState<IUser | null>(null)

  const userId = id

  useEffect(() => {
    let abortController = new AbortController()

    async function fetchUser() {
      try {
        const { data: user } = await getUser(userId)
        setUser(user as IUser)
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // Handling error thrown by aborting request
        }
      }
    }

    fetchUser()
    return () => {
      abortController.abort()
    }
  }, [userId])

  if (!user) return null

  return (
    <div className='row'>
      <div className='col'>
        <h3>Usuário editando</h3>
        <Form
          initialValues={user as Partial<IUserFormValues>}
          currentUser={currentUser}
          errors={errors}
          onSubmit={async (values: IUserFormValues) => {
            if (['admin', 'super'].includes(values.role)) {
              delete values.licensee
            } else if (currentUser && currentUser.role !== 'super' && !values.licensee) {
              values.licensee = currentUser.licensee as string
            }
            const response = await updateUser(values)

            if (response.status === 200) {
              toast.success('Usuário atualizado com sucesso!');
              navigate('/users')
              setErrors(null)
            } else {
              const data = response.data as { errors: IFormError[] }
              setErrors(data.errors)
              toast.error('Ops! Não foi possível atualizar o usuário.');
            }
          }}
        />
      </div>
    </div>
  )
}

export default UserEdit
