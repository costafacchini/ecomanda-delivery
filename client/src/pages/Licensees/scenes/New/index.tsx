import LicenseeWizard from './LicenseeWizard'
import { toast } from 'react-toastify';
import { useState } from 'react';
import { useTranslation } from 'react-i18next'
import { createLicensee } from '../../../../services/licensee'
import { useNavigate } from 'react-router'
import type { IUser, ILicenseeFormValues } from '../../../../types'

interface ApiError {
  message: string
}

interface LicenseeNewProps {
  currentUser?: IUser | null
}

function LicenseeNew({ currentUser }: LicenseeNewProps) {
  const { t } = useTranslation()
  let navigate = useNavigate()
  const [errors, setErrors] = useState<ApiError[] | null>(null)

  return (
    <div className='row'>
      <div className='col'>
        <LicenseeWizard
          errors={errors}
          onSubmit={async (values: ILicenseeFormValues) => {
            const response = await createLicensee(values)

            if (response.status === 201) {
              toast.success(t('licensees.new.createSuccess'))
              navigate('/licensees')
              setErrors(null)
            } else {
              const errorData = response.data as { errors: ApiError[] }
              setErrors(errorData.errors)
              toast.error(t('licensees.new.createError'))
            }
          }}
        />
      </div>
    </div>
  )
}

export default LicenseeNew
