import Form from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { createTrigger } from '../../../../services/trigger'
import { useNavigate } from 'react-router'
import { useApp } from '../../../../contexts/App'
import type { IUser } from '../../../../types'
import { useTranslation } from 'react-i18next'

interface IFormError {
  message: string
}

interface TriggerNewProps {
  currentUser?: IUser | null
}

function TriggerNew({ currentUser }: TriggerNewProps) {
  const { t } = useTranslation()
  const { activeLicensee } = useApp()
  let navigate = useNavigate()
  const [errors, setErrors] = useState<IFormError[] | null>(null)

  return (
    <div className='row'>
      <div className='col'>
        <h3>{t('triggers.newTitle')}</h3>
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
            toast.success(t('triggers.toast.createSuccess'));
            navigate('/triggers')
            setErrors(null)
          } else {
            const data = response.data as { errors: IFormError[] }
            setErrors(data.errors)
            toast.error(t('triggers.toast.createError'));
          }
        }} />
      </div>
    </div>
  )
}

export default TriggerNew
