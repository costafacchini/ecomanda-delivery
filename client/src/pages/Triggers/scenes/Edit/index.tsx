import Form from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { getTrigger, updateTrigger } from '../../../../services/trigger'
import { useNavigate, useParams } from 'react-router'
import { useEffect } from 'react'
import { useApp } from '../../../../contexts/App'
import type { IUser, ITrigger } from '../../../../types'

interface IFormError {
  message: string
}

interface TriggerEditProps {
  currentUser?: IUser | null
}

function TriggerEdit({ currentUser }: TriggerEditProps) {
  const { activeLicensee } = useApp()
  const navigate = useNavigate()
  let { id } = useParams()
  const [errors, setErrors] = useState<IFormError[] | null>(null)
  const [trigger, setTrigger] = useState<ITrigger | null>(null)

  const triggerId = id

  useEffect(() => {
    let abortController = new AbortController()

    async function fetchTrigger() {
      try {
        const { data: licensee } = await getTrigger(triggerId!)
        setTrigger(licensee as ITrigger)
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
          activeLicensee={activeLicensee as any}
          errors={errors}
          onSubmit={async (values) => {
            const response = await updateTrigger({ ...values, id: trigger.id } as ITrigger)

            if (response.status === 200) {
              toast.success('Gatilho atualizado com sucesso!');
              navigate('/triggers')
              setErrors(null)
            } else {
              const data = response.data as { errors: IFormError[] }
              setErrors(data.errors)
              toast.error('Ops! Não foi possível atualizar o gatilho.');
            }
          }}
        />
      </div>
    </div>
  )
}

export default TriggerEdit
