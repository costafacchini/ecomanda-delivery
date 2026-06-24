import Form from '../Form'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getSector, updateSector } from '../../../../services/sector'
import { useNavigate, useParams } from 'react-router'

function SectorEdit({ currentUser }: any) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  let { id } = useParams()
  const [errors, setErrors] = useState(null)
  const [sector, setSector] = useState<any>(null)

  useEffect(() => {
    let abortController = new AbortController()

    async function fetchSector() {
      try {
        const { data } = await getSector(id)
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

  if (!sector) return null

  return (
    <div className='row'>
      <div className='col'>
        <h3>{t('sectors.editSectorTitle')}</h3>
        <Form
          initialValues={sector}
          currentUser={currentUser}
          errors={errors}
          sectorId={sector.id}
          onSubmit={async (values: any) => {
            const response = await updateSector({ ...values, id: sector.id })

            if (response.status === 200) {
              toast.success(t('sectors.toast.updateSuccess'))
              navigate('/sectors')
              setErrors(null)
            } else {
              // @ts-ignore — Sectors not in type-narrowing plan scope
              setErrors((response.data as any).errors)
              toast.error(t('sectors.toast.updateError'))
            }
          }}
        />
      </div>
    </div>
  )
}

export default SectorEdit
