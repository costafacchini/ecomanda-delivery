import { FieldWithError, Form } from '../../../../components/form'
import { FieldArray } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'

const SignupSchema = Yup.object().shape({
  name: Yup.string(),
  namespace: Yup.string()
});

const templateInitialValues = {
  name: '',
  namespace: '',
}

function TemplateForm({ onSubmit, errors, initialValues, currentUser }) {
  let navigate = useNavigate()

  return (
    <div>
      <Form
        validationSchema={SignupSchema}
        initialValues={{...templateInitialValues, ...initialValues}}
        onSubmit={(values) => {
          onSubmit(values)
        }}
      >
        {props => (
          <form onSubmit={props.handleSubmit}>
            <fieldset className='pb-4' disabled={true}>
              <div className='row'>
                <div className='form-group col-4'>
                  <label htmlFor='name'>Nome</label>
                  <FieldWithError
                    id='name'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.name}
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
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.namespace}
                  />
                </div>
              </div>

              {currentUser && currentUser.isSuper && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='licensee'>Licenciado</label>
                    <SelectLicenseesWithFilter selectedItem={props.values.licensee} isDisabled={true} onChange={(e) => (
                      props.setFieldValue('licensee', e.value, false)
                    )} />
                  </div>
                </div>
              )}

              <label htmlFor='headerParams'>Parâmetros do Header</label>
              <FieldArray
                name='headerParams'
                render={() => (
                  <div>
                    {props.values.headerParams && props.values.headerParams.length > 0 && (
                      props.values.headerParams.map((param, index) => (
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
                    {props.values.bodyParams && props.values.bodyParams.length > 0 && (
                      props.values.bodyParams.map((param, index) => (
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
                    {props.values.footerParams && props.values.footerParams.length > 0 && (
                      props.values.footerParams.map((param, index) => (
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
                  {errors.map((error) => (<li key={error.message}>{error.message}</li>))}
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
