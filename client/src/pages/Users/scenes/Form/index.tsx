import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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

const userInitialValues: IUserFormValues = {
  name: '',
  email: '',
  password: '',
  licensee: '',
  active: true,
  role: 'agent',
}

function UserForm({ onSubmit, errors, initialValues, currentUser, isNew = false, saving = false }: UserFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const isSuperUser = currentUser?.role === 'super'

  const schema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string().required(t('users.validation.nameRequired')),
        email: Yup.string().email(t('users.validation.emailInvalid')).max(60).required(t('users.validation.emailRequired')),
        password: isNew
          ? Yup.string().required(t('users.validation.passwordRequired'))
          : Yup.string(),
        licensee: isSuperUser
          ? Yup.string().when('role', {
              is: (role: string) => !ROLES_WITHOUT_LICENSEE.includes(role as UserRole),
              then: (s) => s.required(t('users.validation.licenseeRequired')),
            })
          : Yup.string(),
      }),
    [t, isSuperUser, isNew]
  )

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
                  <label htmlFor='name'>{t('common.name')} <span className='text-danger'>*</span></label>
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
                    <label className='form-check-label' htmlFor='active'>{t('common.active')}</label>
                  </div>
                </div>
              </div>

              <div className='row mb-3'>
                <div className='form-group col-8'>
                  <label htmlFor='email'>{t('common.email')} <span className='text-danger'>*</span></label>
                  <FieldWithError
                    id='email'
                    name='email'
                    type='text'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    placeholder={t('users.emailPlaceholder')}
                  />
                </div>
              </div>

              <div className='row mb-3'>
                <div className='form-group col-8'>
                  <label htmlFor='password'>
                    {t('users.passwordLabel')} {isNew && <span className='text-danger'>*</span>}
                  </label>
                  <FieldWithError
                    id='password'
                    type='password'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    name='password'
                    autoComplete='new-password'
                    placeholder={isNew ? t('users.passwordPlaceholderNew') : t('users.passwordPlaceholderEdit')}
                  />
                </div>
              </div>

              {currentUser && ['admin', 'super'].includes(currentUser.role) && (
                <div className='row mb-3'>
                  <div className='form-group col-8'>
                    <label htmlFor='role'>{t('users.columnProfile')}</label>
                    <select
                      className='form-select'
                      id='role'
                      name='role'
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.role}
                    >
                      <option value='agent'>{t('users.roles.agent')}</option>
                      <option value='supervisor'>{t('users.roles.supervisor')}</option>
                      <option value='admin'>{t('users.roles.admin')}</option>
                      {currentUser.role === 'super' && <option value='super'>{t('users.roles.super')}</option>}
                    </select>
                  </div>
                </div>
              )}

              {isSuperUser && !ROLES_WITHOUT_LICENSEE.includes(formik.values.role) && (
                <div className='row mb-3'>
                  <div className='form-group col-8'>
                    <label htmlFor='licensee'>{t('users.licenseeFilter')} <span className='text-danger'>*</span></label>
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
                  <button onClick={() => navigate('/users')} className='btn btn-secondary' type='button'>{t('common.back')}</button>
                  <button className='btn btn-success' type='submit' disabled={saving}>
                    {saving ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true' />
                        {t('common.saving')}
                      </>
                    ) : t('common.save')}
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
