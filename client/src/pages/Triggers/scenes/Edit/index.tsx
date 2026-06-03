import Form from '../Form'
import { toast } from 'react-toastify'
import { useState, useContext } from 'react'
import { getTrigger, updateTrigger } from '../../../../services/trigger'
import { useNavigate, useParams } from 'react-router'
import { useEffect } from 'react'
import { AppContext } from '../../../../contexts/App'

function TriggerEdit({ currentUser }: any) {
  const { activeLicensee } = useContext(AppContext)
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
      } catch (error: any) {
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
          activeLicensee={activeLicensee}
          errors={errors}
          onSubmit={async (values: any) => {
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
