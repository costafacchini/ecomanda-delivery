import Form from '../Form'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { createSector } from '../../../../services/sector'
import { useNavigate } from 'react-router'

function SectorNew({ currentUser }: any) {
  let navigate = useNavigate()
  const [errors, setErrors] = useState(null)

  return (
    <div className='row'>
      <div className='col'>
        <h3>Setor criando</h3>
        <Form
          errors={errors}
          currentUser={currentUser}
          onSubmit={async (values: any) => {
            const payload = {
              ...values,
              licensee: currentUser?.licensee?._id || currentUser?.licensee,
            }
            const response = await createSector(payload)

            if (response.status === 201) {
              toast.success('Setor criado com sucesso!')
              navigate('/sectors')
              setErrors(null)
            } else {
              setErrors(response.data.errors)
              toast.error('Ops! Não foi possível criar o setor.')
            }
          }}
        />
      </div>
    </div>
  )
}

export default SectorNew
