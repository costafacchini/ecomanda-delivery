import Form from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { getTrigger, updateTrigger } from '../../../../services/trigger'
import { useNavigate, useParams } from 'react-router'
import { useEffect } from 'react'

function TriggerEdit({ currentUser }) {
  const navigate = useNavigate()
  let { id } = useParams()
  const [errors, setErrors] = useState(null)
  const [trigger, setTrigger] = useState(null)

  const triggerId = id

  useEffect(() => {
    let abortController = new AbortController()

    async function fetchTrigger() {
      try {
        const { data: licensee } = await getTrigger(triggerId)
        setTrigger(licensee)
      } catch (error) {
        if (error.name === 'AbortError') {
          // Handling error thrown by aborting request
        }
      }
    }

    fetchTrigger()
    return () => {
      abortController.abort()
    }
  }, [triggerId])

  if (!trigger) return null

  return (
    <div className='row'>
      <div className='col'>
        <h3>Gatilho editando</h3>
        <Form
          initialValues={trigger}
          currentUser={currentUser}
          errors={errors}
          onSubmit={async (values) => {
            const response = await updateTrigger(values)

            if (response.status === 200) {
              toast.success('Gatilho atualizado com sucesso!');
              navigate('/triggers')
              setErrors(null)
            } else {
              setErrors(response.data.errors)
              toast.error('Ops! Não foi possível atualizar o gatilho.');
            }
          }}
        />
      </div>
    </div>
  )
}

export default TriggerEdit
