import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { getInboxes, deleteInbox } from '../../../../services/inbox'
import { toast } from 'react-toastify'
import { useApp } from '../../../../contexts/App'

function InboxesIndex({ currentUser }: any) {
  const { t } = useTranslation()
  const { activeLicensee } = useApp()
  const [inboxes, setInboxes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchInboxes = useCallback(async () => {
    const licenseeId =
      (typeof currentUser?.licensee === 'object' ? currentUser?.licensee?.id : currentUser?.licensee) ??
      activeLicensee?.id
    if (!licenseeId) return

    setLoading(true)
    try {
      const { data } = await getInboxes({ licensee: licenseeId })
      setInboxes(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [currentUser, activeLicensee])

  useEffect(() => {
    fetchInboxes()
  }, [fetchInboxes])

  async function handleDelete(id: string) {
    if (!window.confirm(t('inboxes.deleteInboxConfirm'))) return

    const response = await deleteInbox(id)
    if (response.status === 200 || response.status === 204) {
      toast.success(t('inboxes.toast.deleteSuccess'))
      fetchInboxes()
    } else {
      toast.error(t('inboxes.toast.deleteError'))
    }
  }

  return (
    <>
      <div className='row'>
        <div className='d-flex justify-content-between pb-2'>
          <div className=''>
            <h3 className='pr-3'>{t('inboxes.title')}</h3>
          </div>
          <div className=''>
            <Link to='/inboxes/new' className='btn btn-primary'>{t('inboxes.newInbox')}</Link>
          </div>
        </div>
      </div>

      <div className='row'>
        <table className='table'>
          <thead>
            <tr>
              <th scope='col'>{t('common.name')}</th>
              <th scope='col'>{t('inboxes.kindLabel')}</th>
              <th scope='col'>{t('common.active')}</th>
              <th scope='col'></th>
            </tr>
          </thead>
          <tbody>
            {!loading && inboxes.map((inbox: any) => (
              <tr key={inbox.id}>
                <td>{inbox.name}</td>
                <td>{t(`inboxes.kind.${inbox.kind}`)}</td>
                <td>{inbox.active ? t('common.yes') : t('common.no')}</td>
                <td>
                  <Link to={`/inboxes/${inbox.id}/edit`} className='me-2'>
                    <i className='bi bi-pencil' />
                  </Link>
                  <button
                    className='btn btn-link p-0 text-danger'
                    onClick={() => handleDelete(inbox.id)}
                    title={t('inboxes.deleteInboxTitle')}
                  >
                    <i className='bi bi-trash' />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default InboxesIndex
