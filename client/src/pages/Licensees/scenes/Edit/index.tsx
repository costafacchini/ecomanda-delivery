import Form from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { getLicensee, updateLicensee } from '../../../../services/licensee'
import { useNavigate, useParams } from 'react-router'
import { useEffect } from 'react'

function LicenseeEdit({ currentUser }) {
  const navigate = useNavigate()
  let { id } = useParams()
  const [errors, setErrors] = useState(null)
  const [licensee, setLicensee] = useState(null)

  const licenseeId = id

  useEffect(() => {
    async function fetchLicensee() {
      const { data: licensee } = await getLicensee(licenseeId)
      setLicensee(licensee)
    }

    fetchLicensee()
  }, [licenseeId])

  if (!licensee) return null

  return (
    <div className='row'>
      <div className='col'>
        <h3>Licenciado editando</h3>
        <Form
          initialValues={licensee}
          errors={errors}
          currentUser={currentUser}
          onSubmit={async (values) => {
            const response = await updateLicensee(values)

            if (response.status === 200) {
              toast.success('Licenciado atualizado com sucesso!')
              navigate('/licensees')
              setErrors(null)
            } else {
              setErrors(response.data.errors)
              toast.error('Ops! Não foi possível atualizar o licenciado.')
            }
          }}
        />
      </div>
    </div>
  )
}

export default LicenseeEdit
