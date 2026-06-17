import { FieldWithError, Form } from '../../../../components/form'
import { FieldArray, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'
import type { IUser } from '../../../../types'
import type { ITemplateParam } from '../../../../types'

interface ITemplateFormValues {
  name: string
  namespace: string
  licensee?: string | null
  headerParams?: ITemplateParam[]
  bodyParams?: ITemplateParam[]
  footerParams?: ITemplateParam[]
}

interface IFormError {
  message: string
}

interface TemplateFormProps {
  onSubmit?: (values: ITemplateFormValues, helpers?: FormikHelpers<ITemplateFormValues>) => void
  errors?: IFormError[] | null
  initialValues?: Partial<ITemplateFormValues>
  currentUser?: IUser | null
  activeLicensee?: { _id: string } | null
}

const SignupSchema = Yup.object().shape({
  name: Yup.string(),
  namespace: Yup.string()
});

const templateInitialValues: ITemplateFormValues = {
  name: '',
  namespace: '',
}

function TemplateForm({ onSubmit, errors, initialValues, currentUser, activeLicensee }: TemplateFormProps) {
  let navigate = useNavigate()

  return (
    <div>
      <Form
        validationSchema={SignupSchema}
        initialValues={{...templateInitialValues, ...initialValues}}
        onSubmit={(values) => {
          onSubmit?.(values)
        }}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <fieldset className='pb-4' disabled={true}>
              <div className='row'>
                <div className='form-group col-4'>
                  <label htmlFor='name'>Nome</label>
                  <FieldWithError
                    id='name'
                    type='text'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                    name='name'
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='namespace'>Namespace</label>
                  <FieldWithError
                    id='namespace'
                    name='namespace'
                    type='text'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.namespace}
                  />
                </div>
              </div>

              {currentUser && currentUser.role === 'super' && !activeLicensee && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='licensee'>Licenciado</label>
                    <SelectLicenseesWithFilter selectedItem={typeof formik.values.licensee === 'string' ? null : formik.values.licensee} isDisabled={true} onChange={(e: any) => (
                      formik.setFieldValue('licensee', e?.value ?? null, false)
                    )} />
                  </div>
                </div>
              )}

              <label htmlFor='headerParams'>Parâmetros do Header</label>
              <FieldArray
                name='headerParams'
                render={() => (
                  <div>
                    {formik.values.headerParams && formik.values.headerParams.length > 0 && (
                      formik.values.headerParams.map((param, index) => (
                        <div key={index} className='row'>
                          <div className='form-group col-5'>
                            <FieldWithError
                              id={`headerParams.${index}`}
                              name={`headerParams.${index}`}
                              type='text'
                              value={param.format}
                            />
                          </div>
                        </div>
                      )))}
                  </div>
                )}
              />

              <label htmlFor='bodyParams'>Parâmetros do Body</label>
              <FieldArray
                name='bodyParams'
                render={() => (
                  <div>
                    {formik.values.bodyParams && formik.values.bodyParams.length > 0 && (
                      formik.values.bodyParams.map((param, index) => (
                        <div key={index} className='row'>
                          <div className='form-group col-5'>
                            <FieldWithError
                              id={`bodyParams.${index}`}
                              name={`bodyParams.${index}`}
                              type='text'
                              value={param.format}
                            />
                          </div>
                        </div>
                      )))}
                  </div>
                )}
              />

              <label htmlFor='footerParams'>Parâmetros do Footer</label>
              <FieldArray
                name='footerParams'
                render={() => (
                  <div>
                    {formik.values.footerParams && formik.values.footerParams.length > 0 && (
                      formik.values.footerParams.map((param, index) => (
                        <div key={index} className='row'>
                          <div className='form-group col-5'>
                            <FieldWithError
                              id={`footerParams.${index}`}
                              name={`footerParams.${index}`}
                              type='text'
                              value={param.format}
                            />
                          </div>
                        </div>
                      )))}
                  </div>
                )}
              />
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
                  <button onClick={() => navigate('/templates')} className='btn btn-secondary' type='button'>Voltar</button>
                </div>
              </div>
            </div>
          </form>
        )}
      </Form>
    </div>
  )
}

export default TemplateForm
