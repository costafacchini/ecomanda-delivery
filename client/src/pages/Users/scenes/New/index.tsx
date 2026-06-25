import Form, { IUserFormValues } from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<IFormError[] | null>(null)
  const [saving, setSaving] = useState(false)

  return (
    <div className='row'>
      <div className='col'>
        <h3>{t('users.newUser')}</h3>
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
                toast.success(t('users.toast.createSuccess'))
                navigate('/users')
                setErrors(null)
              } else {
                const data = response.data as { errors: IFormError[] }
                setErrors(data.errors)
                toast.error(t('users.toast.createError'))
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
