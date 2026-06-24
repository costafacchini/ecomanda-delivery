import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { getSectors, deleteSector } from '../../../../services/sector'
import { toast } from 'react-toastify'

function SectorsIndex({ currentUser }: any) {
  const { t } = useTranslation()
  const [sectors, setSectors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSectors = useCallback(async () => {
    if (!currentUser?.licensee?._id) return

    setLoading(true)
    try {
      const { data } = await getSectors({ licensee: currentUser.licensee._id })
      setSectors(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchSectors()
  }, [fetchSectors])

  async function handleDelete(id: string) {
    if (!window.confirm(t('sectors.confirmDelete'))) return

    const response = await deleteSector(id)
    if (response.status === 200) {
      toast.success(t('sectors.toast.deleteSuccess'))
      fetchSectors()
    } else {
      toast.error(t('sectors.toast.deleteError'))
    }
  }

  return (
    <>
      <div className='row'>
        <div className='d-flex justify-content-between pb-2'>
          <div className=''>
            <h3 className='pr-3'>{t('sectors.title')}</h3>
          </div>
          <div className=''>
            <Link to='/sectors/new' className='btn btn-primary'>{t('sectors.createButton')}</Link>
          </div>
        </div>
      </div>

      <div className='row'>
        <table className='table'>
          <thead>
            <tr>
              <th scope='col'>{t('common.name')}</th>
              <th scope='col'>{t('common.active')}</th>
              <th scope='col'></th>
            </tr>
          </thead>
          <tbody>
            {!loading && sectors.map((sector: any) => (
              <tr key={sector.id}>
                <td>{sector.name}</td>
                <td>{sector.active ? t('common.yes') : t('common.no')}</td>
                <td>
                  <Link to={`/sectors/${sector.id}/edit`} className='me-2'>
                    <i className='bi bi-pencil' />
                  </Link>
                  <button
                    className='btn btn-link p-0 text-danger'
                    onClick={() => handleDelete(sector.id)}
                    title={t('sectors.deleteSectorTitle')}
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

export default SectorsIndex
