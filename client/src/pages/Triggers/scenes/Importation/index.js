import { Form } from '../../../../components/form'
import * as Yup from 'yup'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { importTriggerMultiProduct } from '../../../../services/trigger'

const SignupSchema = Yup.object().shape({
  text: Yup.string()
});

const triggerInitialValues = {
  text: ''
}

function TriggerImportation() {
  let navigate = useNavigate()
  let { id } = useParams()
  const [errors, setErrors] = useState(null)

  const triggerId = id

  if (!triggerId) return null

  return (
    <div className='row'>
      <div className='col'>
        <h3>Gatilho importando catálogo</h3>
        <div>
          <Form
            validationSchema={SignupSchema}
            initialValues={{ ...triggerInitialValues }}
            onSubmit={async (values) => {
              const response = await importTriggerMultiProduct(triggerId, values)

              if (response.status === 201) {
                toast.success('Catálogo importado com sucesso!');
                navigate('/triggers')
                setErrors(null)
              } else {
                setErrors(response.data.errors)
                toast.error('Ops! Não foi possível importar a catálogo.');
              }
            }}
          >
            {props => (
              <form onSubmit={props.handleSubmit}>
                <fieldset className='pb-4'>
                  <div className='row'>
                    <div className='form-group'>
                      <label htmlFor='text'>Catálogo</label>
                      <div className='pb-2'>
                        <textarea
                          id='text'
                          name='text'
                          className='form-control'
                          rows={15}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          value={props.values.text}
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>

                {errors && (
                  <div className='alert alert-danger'>
                    <ul>
                      {errors.map((error) => (<li key={error.message}>{error.message}</li>))}
                    </ul>
                  </div>
                )}

                <div className='row'>
                  <div className='col-5'>
                    <div className='mt-4 d-flex justify-content-between'>
                      <button onClick={() => navigate('/triggers')} className='btn btn-secondary' type='button'>Voltar</button>
                      <button className='btn btn-success' type='submit'>Importar</button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </Form>
        </div>
      </div>
    </div>
  )
}

export default TriggerImportation
