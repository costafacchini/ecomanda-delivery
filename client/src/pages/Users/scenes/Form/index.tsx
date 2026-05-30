import { FieldWithError, Form } from '../../../../components/form'
import * as Yup from 'yup'
import { useNavigate } from 'react-router'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'

const SignupSchema = Yup.object().shape({
  name: Yup.string(),
  email: Yup.string().email().max(60),
  password: Yup.string()
});

const userInitialValues = {
  name: '',
  email: '',
  password: '',
  licensee: '',
  active: true,
  isAdmin: false,
  isSuper: false,
}

function UserForm({ onSubmit, errors, initialValues, currentUser }) {
  let navigate = useNavigate()

  return (
    <div>
      <Form
        validationSchema={SignupSchema}
        initialValues={{...userInitialValues, ...initialValues}}
        onSubmit={(values) => {
          onSubmit(values)
        }}
      >
        {props => (
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

              {currentUser && (currentUser.isAdmin || currentUser.isSuper) && (
                <div className='row pb-2'>
                  <div className='col-5'>
                    <div className='form-check'>
                      <input
                        type='checkbox'
                        className='form-check-input'
                        id='isAdmin'
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        checked={props.values.isAdmin}
                      />
                      <label className='form-check-label' htmlFor='isAdmin'>Tem diretos de administrador?</label>
                      <p><b>Administradores podem gerenciar os usuários do licenciado</b></p>
                    </div>
                  </div>
                </div>
              )}

              {currentUser && currentUser.isSuper && (
                <div className='row pb-2'>
                  <div className='col-5'>
                    <div className='form-check'>
                      <input
                        type='checkbox'
                        className='form-check-input'
                        id='isSuper'
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        checked={props.values.isSuper}
                      />
                      <label className='form-check-label' htmlFor='isSuper'>Tem diretos de super usuário?</label>
                      <p><b>Libera direitos de acesso a funcionar sem Licenciado e dá acesso a algumas rotinas especiais</b></p>
                    </div>
                  </div>
                </div>
              )}

              {currentUser && currentUser.isSuper && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='waId'>Licenciado</label>
                    <SelectLicenseesWithFilter selectedItem={props.values.licensee} onChange={(e) => {
                      const inputValue = e && e.value ? e.value : null
                      props.setFieldValue('licensee', inputValue, false)
                    }} />
                  </div>
                </div>
              )}
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
