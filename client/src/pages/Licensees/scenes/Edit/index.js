import Form from '../Form'
import { toast } from 'react-toastify';
import { useState } from 'react';
import { getLicensee, updateLicensee } from '../services/licensee';
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useEffect } from 'react';

function LicenseeEdit() {
  const history = useHistory()
  const match = useRouteMatch()
  const [errors, setErrors] = useState(null)
  const [licensee, setLicensee] = useState(null)

  const licenseeId = match.params.id

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
          onSubmit={async (values) => {
            const response = await updateLicensee(values)

            if (response.status === 200) {
              toast.success('Licenciado atualizado com sucesso!');
              history.push('/licensees')
              setErrors(null)
            } else {
              setErrors(response.data.errors)
              toast.error('Ops! Não foi possível atualizar o licenciado.');
            }
          }}
        />
      </div>
    </div>
  )
}

export default LicenseeEdit
