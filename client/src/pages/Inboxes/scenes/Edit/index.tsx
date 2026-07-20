import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { getInbox, updateInbox } from '../../../../services/inbox'
import InboxForm from '../Form'

function InboxEdit({ currentUser }: any) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [errors, setErrors] = useState<any[] | null>(null)
  const [inbox, setInbox] = useState<any>(null)

  useEffect(() => {
    const abortController = new AbortController()

    async function fetchInbox() {
      try {
        const { data } = await getInbox(id as string)
        setInbox(data)
      } catch (error: any) {
        if (error.name === 'AbortError') return
      }
    }

    fetchInbox()
    return () => abortController.abort()
  }, [id])

  if (!inbox) return null

  return (
    <div className='row'>
      <div className='col'>
        <h3>{t('inboxes.editInbox')}</h3>
        <InboxForm
          initialValues={inbox}
          errors={errors}
          inboxId={inbox.id}
          onSubmit={async (values: any) => {
            const response = await updateInbox(inbox.id, values)

            if (response.status === 200) {
              toast.success(t('inboxes.toast.updateSuccess'))
              navigate('/inboxes')
              setErrors(null)
            } else {
              setErrors((response.data as any).errors)
              toast.error(t('inboxes.toast.updateError'))
            }
          }}
        />
      </div>
    </div>
  )
}

export default InboxEdit
