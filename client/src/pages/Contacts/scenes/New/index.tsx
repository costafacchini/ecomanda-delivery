import Form from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { createContact } from '../../../../services/contact'
import { useNavigate } from 'react-router'
import { useApp } from '../../../../contexts/App'
import type { IUser, IContactInput } from '../../../../types'
import { useTranslation } from 'react-i18next'

interface ContactNewProps {
  currentUser: IUser | null | undefined
}

function ContactNew({ currentUser }: ContactNewProps) {
  const { t } = useTranslation()
  const { activeLicensee } = useApp()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Array<{ message: string }> | null>(null)

  return (
    <div className='row'>
      <div className='col'>
        <h3>{t('contacts.newTitle')}</h3>
        <Form errors={errors} currentUser={currentUser} activeLicensee={activeLicensee} onSubmit={async (values) => {
          if (!values.licensee) {
            if (currentUser?.role !== 'super') {
              values.licensee = (currentUser?.licensee as string | null) ?? null
            } else if (activeLicensee) {
              values.licensee = activeLicensee.id
            }
          }
          const response = await createContact(values as unknown as IContactInput)

          if (response.status === 201) {
            toast.success(t('contacts.toast.createSuccess'));
            navigate('/contacts')
            setErrors(null)
          } else {
            const data = response.data as unknown as { errors: Array<{ message: string }> }
            setErrors(data.errors)
            toast.error(t('contacts.toast.createError'));
          }
        }} />
      </div>
    </div>
  )
}

export default ContactNew
