import Form from '../Form'
import { toast } from 'react-toastify';
import { useState } from 'react';
import { createLicensee } from '../../../../services/licensee'
import { useNavigate } from 'react-router'

function LicenseeNew({ currentUser }) {
  let navigate = useNavigate()
  const [errors, setErrors] = useState(null)

  return (
    <div className='row'>
      <div className='col'>
        <h3>Licenciado criando</h3>
        <Form
          errors={errors}
          currentUser={currentUser}
          onSubmit={async (values) => {
            const response = await createLicensee(values)

            if (response.status === 201) {
              toast.success('Licenciado criado com sucesso!')
              navigate('/licensees')
              setErrors(null)
            } else {
              setErrors(response.data.errors)
              toast.error('Ops! Não foi possível criar o licenciado.')
            }
          }}
        />
      </div>
    </div>
  )
}

export default LicenseeNew
