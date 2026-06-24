import { Form } from '../../../../components/form'
import * as Yup from 'yup'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { importTriggerMultiProduct } from '../../../../services/trigger'
import { useTranslation } from 'react-i18next'

interface IImportationFormValues {
  text: string
}

interface IFormError {
  message: string
}

const SignupSchema = Yup.object().shape({
  text: Yup.string()
});

const triggerInitialValues: IImportationFormValues = {
  text: ''
}

function TriggerImportation() {
  const { t } = useTranslation()
  let navigate = useNavigate()
  let { id } = useParams()
  const [errors, setErrors] = useState<IFormError[] | null>(null)

  const triggerId = id

  if (!triggerId) return null

  return (
    <div className='row'>
      <div className='col'>
        <h3>{t('triggers.importTitle')}</h3>
        <div>
          <Form
            validationSchema={SignupSchema}
            initialValues={{ ...triggerInitialValues }}
            onSubmit={async (values) => {
              const response = await importTriggerMultiProduct(triggerId, values)

              if (response.status === 201) {
                toast.success(t('triggers.toast.importSuccess'));
                navigate('/triggers')
                setErrors(null)
              } else {
                const data = response.data as { errors: IFormError[] }
                setErrors(data.errors)
                toast.error(t('triggers.toast.importError'));
              }
            }}
          >
            {(formik) => (
              <form onSubmit={formik.handleSubmit}>
                <fieldset className='pb-4'>
                  <div className='row'>
                    <div className='form-group'>
                      <label htmlFor='text'>{t('triggers.catalogLabel')}</label>
                      <div className='pb-2'>
                        <textarea
                          id='text'
                          name='text'
                          className='form-control'
                          rows={15}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.text}
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>

                {errors && (
                  <div className='alert alert-danger'>
                    <ul>
                      {errors.map((error: any) => (<li key={error.message}>{error.message}</li>))}
                    </ul>
                  </div>
                )}

                <div className='row'>
                  <div className='col-5'>
                    <div className='mt-4 d-flex justify-content-between'>
                      <button onClick={() => navigate('/triggers')} className='btn btn-secondary' type='button'>{t('common.back')}</button>
                      <button className='btn btn-success' type='submit'>{t('triggers.importButton')}</button>
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
