import Form from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { getUser, updateUser } from '../../../../services/user'
import { useNavigate, useParams } from 'react-router'
import { useEffect } from 'react'

function UserEdit({ currentUser }) {
  const navigate = useNavigate()
  let { id } = useParams()
  const [errors, setErrors] = useState(null)
  const [user, setUser] = useState(null)

  const userId = id

  useEffect(() => {
    let abortController = new AbortController()

    async function fetchUser() {
      try {
        const { data: user } = await getUser(userId)
        setUser(user)
      } catch (error) {
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
          initialValues={user}
          currentUser={currentUser}
          errors={errors}
          onSubmit={async (values) => {
            const response = await updateUser(values)

            if (response.status === 200) {
              toast.success('Usuário atualizado com sucesso!');
              navigate('/users')
              setErrors(null)
            } else {
              setErrors(response.data.errors)
              toast.error('Ops! Não foi possível atualizar o usuário.');
            }
          }}
        />
      </div>
    </div>
  )
}

export default UserEdit
