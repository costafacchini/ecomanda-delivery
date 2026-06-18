import Form from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { getLicensee, updateLicensee } from '../../../../services/licensee'
import { useNavigate, useParams } from 'react-router'
import { useEffect } from 'react'
import type { ILicensee, IUser } from '../../../../types'

interface LicenseeEditProps {
  currentUser?: IUser | null
}

interface ApiError {
  message: string
}

function LicenseeEdit({ currentUser }: LicenseeEditProps) {
  const navigate = useNavigate()
  let { id } = useParams()
  const [errors, setErrors] = useState<ApiError[] | null>(null)
  const [licensee, setLicensee] = useState<ILicensee | null>(null)

  const licenseeId = id

  useEffect(() => {
    async function fetchLicensee() {
      const { data } = await getLicensee(licenseeId!)
      setLicensee(data as ILicensee)
    }

    fetchLicensee()
  }, [licenseeId])

  if (!licensee) {
    return (
      <div className='d-flex justify-content-center mt-5'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Carregando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className='row'>
      <div className='col'>
        <h3>Editando: {licensee.name}</h3>
        <Form
          initialValues={licensee}
          errors={errors}
          currentUser={currentUser}
          onSubmit={async (values) => {
            const response = await updateLicensee({ ...values, id: licensee.id } as ILicensee)

            if (response.status === 200) {
              toast.success('Licenciado atualizado com sucesso!')
              navigate('/licensees')
              setErrors(null)
            } else {
              const errorData = response.data as { errors: ApiError[] }
              setErrors(errorData.errors)
              toast.error('Ops! Não foi possível atualizar o licenciado.')
            }
          }}
        />
      </div>
    </div>
  )
}

export default LicenseeEdit
