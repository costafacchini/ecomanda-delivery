import { useMemo } from 'react'
import { FieldWithError, Form } from '../../../../components/form'
import { ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'
import type { IUser, UserRole } from '../../../../types'

export interface IUserFormValues {
  name: string
  email: string
  password: string
  licensee?: string | null
  active: boolean
  role: UserRole
}

interface IFormError {
  message: string
}

interface UserFormProps {
  onSubmit: (values: IUserFormValues) => void
  errors?: IFormError[] | null
  initialValues?: Partial<IUserFormValues>
  currentUser?: IUser | null
  isNew?: boolean
  saving?: boolean
}

const ROLES_WITHOUT_LICENSEE: UserRole[] = ['admin', 'super']

function buildSchema(isSuperUser: boolean, isNew: boolean) {
  return Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().email('E-mail inválido').max(60).required('E-mail é obrigatório'),
    password: isNew
      ? Yup.string().required('Senha é obrigatória')
      : Yup.string(),
    licensee: isSuperUser
      ? Yup.string().when('role', {
          is: (role: string) => !ROLES_WITHOUT_LICENSEE.includes(role as UserRole),
          then: (schema) => schema.required('Licenciado é obrigatório'),
        })
      : Yup.string(),
  })
}

const userInitialValues: IUserFormValues = {
  name: '',
  email: '',
  password: '',
  licensee: '',
  active: true,
  role: 'agent',
}

function UserForm({ onSubmit, errors, initialValues, currentUser, isNew = false, saving = false }: UserFormProps) {
  const navigate = useNavigate()

  const isSuperUser = currentUser?.role === 'super'
  const schema = useMemo(() => buildSchema(isSuperUser, isNew), [isSuperUser, isNew])

  return (
    <div>
      <Form
        validationSchema={schema}
        initialValues={{...userInitialValues, ...initialValues}}
        onSubmit={(values) => {
          onSubmit(values)
        }}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <fieldset className='mb-4'>
              <div className='row mb-3'>
                <div className='form-group col-8'>
                  <label htmlFor='name'>Nome <span className='text-danger'>*</span></label>
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

              <div className='row mb-3'>
                <div className='col-8'>
                  <div className='form-check'>
                    <input
                      name='active'
                      checked={formik.values.active}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      type='checkbox'
                      className='form-check-input'
                      id='active'
                    />
                    <label className='form-check-label' htmlFor='active'>Ativo</label>
                  </div>
                </div>
              </div>

              <div className='row mb-3'>
                <div className='form-group col-8'>
                  <label htmlFor='email'>E-mail <span className='text-danger'>*</span></label>
                  <FieldWithError
                    id='email'
                    name='email'
                    type='text'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    placeholder='usuario@email.com'
                  />
                </div>
              </div>

              <div className='row mb-3'>
                <div className='form-group col-8'>
                  <label htmlFor='password'>
                    Senha {isNew && <span className='text-danger'>*</span>}
                  </label>
                  <FieldWithError
                    id='password'
                    type='password'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    name='password'
                    autoComplete='new-password'
                    placeholder={isNew ? 'Crie uma senha' : 'Deixe em branco para não alterar'}
                  />
                </div>
              </div>

              {currentUser && ['admin', 'super'].includes(currentUser.role) && (
                <div className='row mb-3'>
                  <div className='form-group col-8'>
                    <label htmlFor='role'>Perfil</label>
                    <select
                      className='form-select'
                      id='role'
                      name='role'
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.role}
                    >
                      <option value='agent'>Agente</option>
                      <option value='supervisor'>Supervisor</option>
                      <option value='admin'>Administrador</option>
                      {currentUser.role === 'super' && <option value='super'>Super</option>}
                    </select>
                  </div>
                </div>
              )}

              {isSuperUser && !ROLES_WITHOUT_LICENSEE.includes(formik.values.role) && (
                <div className='row mb-3'>
                  <div className='form-group col-8'>
                    <label htmlFor='licensee'>Licenciado <span className='text-danger'>*</span></label>
                    <SelectLicenseesWithFilter
                      selectedItem={typeof formik.values.licensee === 'string' ? null : formik.values.licensee}
                      onChange={(e: { value?: string } | null) => {
                        const inputValue = e && e.value ? e.value : null
                        formik.setFieldValue('licensee', inputValue, true)
                      }}
                    />
                    <ErrorMessage name='licensee' component='div' className='text-danger small mt-1' />
                  </div>
                </div>
              )}
            </fieldset>

            {errors && (
              <div className='alert alert-danger'>
                <ul className='mb-0'>
                  {errors.map((error) => (<li key={error.message}>{error.message}</li>))}
                </ul>
              </div>
            )}

            <div className='row'>
              <div className='col-8'>
                <div className='mt-4 d-flex justify-content-between'>
                  <button onClick={() => navigate('/users')} className='btn btn-secondary' type='button'>Voltar</button>
                  <button className='btn btn-success' type='submit' disabled={saving}>
                    {saving ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true' />
                        Salvando...
                      </>
                    ) : 'Salvar'}
                  </button>
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
