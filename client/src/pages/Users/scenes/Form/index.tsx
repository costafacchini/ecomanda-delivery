import { useMemo } from 'react'
import { FieldWithError, Form } from '../../../../components/form'
import { ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'

const ROLES_WITHOUT_LICENSEE = ['admin', 'super']

function buildSchema(isSuperUser: boolean) {
  return Yup.object().shape({
    name: Yup.string(),
    email: Yup.string().email().max(60),
    password: Yup.string(),
    licensee: isSuperUser
      ? Yup.string().when('role', {
          is: (role: string) => !ROLES_WITHOUT_LICENSEE.includes(role),
          then: (schema) => schema.required('Licenciado é obrigatório'),
        })
      : Yup.string(),
  })
}

const userInitialValues = {
  name: '',
  email: '',
  password: '',
  licensee: '',
  active: true,
  role: 'agent',
}

function UserForm(props: any) {
  const { onSubmit, errors, initialValues, currentUser } = props
  let navigate = useNavigate()

  const isSuperUser = currentUser?.role === 'super'
  const schema = useMemo(() => buildSchema(isSuperUser), [isSuperUser])

  return (
    <div>
      <Form
        validationSchema={schema}
        initialValues={{...userInitialValues, ...initialValues}}
        onSubmit={(values: any) => {
          onSubmit(values)
        }}
      >
        {(props: any) => (
          <form onSubmit={props.handleSubmit}>
            <fieldset className='pb-4'>
              <div className='row'>
                <div className='form-group col-5'>
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
                <div className='form-group col-5'>
                  <div className='form-check mt-4'>
                    <input
                      checked={props.values.active}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      type='checkbox'
                      className='form-check-input'
                      id='active'
                    />
                    <label className='form-check-label' htmlFor='active'>Ativo</label>
                  </div>
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='email'>E-email</label>
                  <FieldWithError
                    id='email'
                    name='email'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.email}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='password'>Senha</label>
                  <FieldWithError
                    id='password'
                    type='password'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.password}
                    name='password'
                    autoComplete='new-password'
                  />
                </div>
              </div>

              {currentUser && ['admin', 'super'].includes(currentUser.role) && (
                <div className='row pb-2'>
                  <div className='form-group col-5'>
                    <label htmlFor='role'>Perfil</label>
                    <select
                      className='form-select'
                      id='role'
                      name='role'
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      value={props.values.role}
                    >
                      <option value='agent'>Agente</option>
                      <option value='supervisor'>Supervisor</option>
                      <option value='admin'>Administrador</option>
                      {currentUser.role === 'super' && <option value='super'>Super</option>}
                    </select>
                  </div>
                </div>
              )}

              {isSuperUser && !ROLES_WITHOUT_LICENSEE.includes(props.values.role) && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='licensee'>Licenciado <span className='text-danger'>*</span></label>
                    <SelectLicenseesWithFilter selectedItem={props.values.licensee} onChange={(e: any) => {
                      const inputValue = e && e.value ? e.value : null
                      props.setFieldValue('licensee', inputValue, true)
                    }} />
                    <ErrorMessage name='licensee' />
                  </div>
                </div>
              )}
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
                  <button onClick={() => navigate('/users')} className='btn btn-secondary' type='button'>Voltar</button>
                  <button className='btn btn-success' type='submit'>Salvar</button>
                </div>
              </div>
            </div>
          </form>
        )}
      </Form>
    </div>
  )
}

export default UserForm
