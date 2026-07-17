import Form from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createDepartment } from '../../../../services/department'
import { useNavigate } from 'react-router'

function SectorNew({ currentUser }: any) {
  const { t } = useTranslation()
  let navigate = useNavigate()
  const [errors, setErrors] = useState(null)

  return (
    <div className='row'>
      <div className='col'>
        <h3>{t('departments.newSectorTitle')}</h3>
        <Form
          errors={errors}
          currentUser={currentUser}
          onSubmit={async (values: any) => {
            const payload = {
              ...values,
              licensee: currentUser?.licensee?._id || currentUser?.licensee,
            }
            const response = await createDepartment(payload)

            if (response.status === 201) {
              toast.success(t('departments.toast.createSuccess'))
              navigate('/departments')
              setErrors(null)
            } else {
              // @ts-ignore — Departments not in type-narrowing plan scope
              setErrors((response.data as any).errors)
              toast.error(t('departments.toast.createError'))
            }
          }}
        />
      </div>
    </div>
  )
}

export default SectorNew
