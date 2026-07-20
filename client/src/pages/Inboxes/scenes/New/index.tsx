import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { createInbox } from '../../../../services/inbox'
import InboxForm from '../Form'

function InboxNew({ currentUser }: any) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<any[] | null>(null)

  return (
    <div className='row'>
      <div className='col'>
        <h3>{t('inboxes.newInbox')}</h3>
        <InboxForm
          errors={errors}
          onSubmit={async (values: any) => {
            const payload = {
              ...values,
              licensee: currentUser?.licensee?._id || currentUser?.licensee,
            }
            const response = await createInbox(payload)

            if (response.status === 201) {
              toast.success(t('inboxes.toast.createSuccess'))
              navigate('/inboxes')
              setErrors(null)
            } else {
              setErrors((response.data as any).errors)
              toast.error(t('inboxes.toast.createError'))
            }
          }}
        />
      </div>
    </div>
  )
}

export default InboxNew
