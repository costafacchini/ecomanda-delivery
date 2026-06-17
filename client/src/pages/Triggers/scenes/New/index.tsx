import Form from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { createTrigger } from '../../../../services/trigger'
import { useNavigate } from 'react-router'
import { useApp } from '../../../../contexts/App'
import type { IUser } from '../../../../types'

interface IFormError {
  message: string
}

interface TriggerNewProps {
  currentUser?: IUser | null
}

function TriggerNew({ currentUser }: TriggerNewProps) {
  const { activeLicensee } = useApp()
  let navigate = useNavigate()
  const [errors, setErrors] = useState<IFormError[] | null>(null)

  return (
    <div className='row'>
      <div className='col'>
        <h3>Gatilho criando</h3>
        <Form errors={errors} currentUser={currentUser} activeLicensee={activeLicensee as any} onSubmit={async (values) => {
          if (!values.licensee) {
            if (currentUser && currentUser.role !== 'super') {
              values.licensee = currentUser.licensee as string
            } else if (activeLicensee) {
              values.licensee = activeLicensee.id
            }
          }
          const response = await createTrigger({ ...values, text: values.text ?? '' })

          if (response.status === 201) {
            toast.success('Gatilho criado com sucesso!');
            navigate('/triggers')
            setErrors(null)
          } else {
            const data = response.data as { errors: IFormError[] }
            setErrors(data.errors)
            toast.error('Ops! Não foi possível criar o contato.');
          }
        }} />
      </div>
    </div>
  )
}

export default TriggerNew
