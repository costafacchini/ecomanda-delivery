import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { getDepartments, deleteDepartment } from '../../../../services/department'
import { toast } from 'react-toastify'

function SectorsIndex({ currentUser }: any) {
  const { t } = useTranslation()
  const [departments, setSectors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSectors = useCallback(async () => {
    if (!currentUser?.licensee?._id) return

    setLoading(true)
    try {
      const { data } = await getDepartments({ licensee: currentUser.licensee._id })
      setSectors(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchSectors()
  }, [fetchSectors])

  async function handleDelete(id: string) {
    if (!window.confirm(t('departments.confirmDelete'))) return

    const response = await deleteDepartment(id)
    if (response.status === 200) {
      toast.success(t('departments.toast.deleteSuccess'))
      fetchSectors()
    } else {
      toast.error(t('departments.toast.deleteError'))
    }
  }

  return (
    <>
      <div className='row'>
        <div className='d-flex justify-content-between pb-2'>
          <div className=''>
            <h3 className='pr-3'>{t('departments.title')}</h3>
          </div>
          <div className=''>
            <Link to='/departments/new' className='btn btn-primary'>{t('departments.createButton')}</Link>
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
            {!loading && departments.map((department: any) => (
              <tr key={department.id}>
                <td>{department.name}</td>
                <td>{department.active ? t('common.yes') : t('common.no')}</td>
                <td>
                  <Link to={`/departments/${department.id}/edit`} className='me-2'>
                    <i className='bi bi-pencil' />
                  </Link>
                  <button
                    className='btn btn-link p-0 text-danger'
                    onClick={() => handleDelete(department.id)}
                    title={t('departments.deleteDepartmentTitle')}
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
