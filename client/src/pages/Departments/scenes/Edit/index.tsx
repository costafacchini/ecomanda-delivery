import Form from '../Form'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getDepartment, updateDepartment } from '../../../../services/department'
import { useNavigate, useParams } from 'react-router'

function SectorEdit({ currentUser }: any) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  let { id } = useParams()
  const [errors, setErrors] = useState(null)
  const [department, setSector] = useState<any>(null)

  useEffect(() => {
    let abortController = new AbortController()

    async function fetchSector() {
      try {
        const { data } = await getDepartment(id)
        setSector(data)
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // Handling error thrown by aborting request
        }
      }
    }

    fetchSector()
    return () => {
      abortController.abort()
    }
  }, [id])

  if (!department) return null

  return (
    <div className='row'>
      <div className='col'>
        <h3>{t('departments.editSectorTitle')}</h3>
        <Form
          initialValues={department}
          currentUser={currentUser}
          errors={errors}
          departmentId={department.id}
          onSubmit={async (values: any) => {
            const response = await updateDepartment({ ...values, id: department.id })

            if (response.status === 200) {
              toast.success(t('departments.toast.updateSuccess'))
              navigate('/departments')
              setErrors(null)
            } else {
              // @ts-ignore — Departments not in type-narrowing plan scope
              setErrors((response.data as any).errors)
              toast.error(t('departments.toast.updateError'))
            }
          }}
        />
      </div>
    </div>
  )
}

export default SectorEdit
