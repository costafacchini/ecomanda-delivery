import Form from '../Form'
import { toast } from 'react-toastify'
import { useState, useContext } from 'react'
import { createTrigger } from '../../../../services/trigger'
import { useNavigate } from 'react-router'
import { AppContext } from '../../../../contexts/App'

function TriggerNew({ currentUser }: any) {
  const { activeLicensee } = useContext(AppContext)
  let navigate = useNavigate()
  const [errors, setErrors] = useState(null)

  return (
    <div className='row'>
      <div className='col'>
        <h3>Gatilho criando</h3>
        <Form errors={errors} currentUser={currentUser} activeLicensee={activeLicensee} onSubmit={async (values: any) => {
          if (!values.licensee) {
            if (currentUser.role !== 'super') {
              values.licensee = currentUser.licensee
            } else if (activeLicensee) {
              values.licensee = activeLicensee._id
            }
          }
          const response = await createTrigger(values)

          if (response.status === 201) {
            toast.success('Gatilho criado com sucesso!');
            navigate('/triggers')
            setErrors(null)
          } else {
            setErrors(response.data.errors)
            toast.error('Ops! Não foi possível criar o contato.');
          }
        }} />
      </div>
    </div>
  )
}

export default TriggerNew
