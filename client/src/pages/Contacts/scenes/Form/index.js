import { FieldWithError, Form } from '../../../../components/form'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'

const SignupSchema = Yup.object().shape({
  name: Yup.string()
});

const contactInitialValues = {
  name: '',
  number: '',
  email: '',
  talkingWithChatBot: false,
  licensee: '',
  waId: '',
  landbotId: '',
}

function ContactForm({ onSubmit, errors, initialValues, loggedUser }) {
  let navigate = useNavigate()

  return (
    <div>
      <Form
        validationSchema={SignupSchema}
        initialValues={{...contactInitialValues, ...initialValues}}
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
                  <label htmlFor='number'>Telefone</label>
                  <FieldWithError
                    id='number'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.number}
                    name='number'
                  />
                </div>
              </div>

              <div className='row pb-2'>
                <div className='col-3'>
                  <div className='form-check'>
                    <input
                      type='checkbox'
                      className='form-check-input'
                      id='talkingWithChatBot'
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      checked={props.values.talkingWithChatBot}
                    />
                    <label className='form-check-label' htmlFor='talkingWithChatBot'>Conversando com chatbot?</label>
                  </div>
                </div>
              </div>

              {loggedUser && loggedUser.isSuper && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='waId'>Licenciado</label>
                    <SelectLicenseesWithFilter selectedItem={props.values.licensee} onChange={(e) => (
                      props.setFieldValue('licensee', e.value, false)
                    )} />
                  </div>
                </div>
              )}

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='waId'>ID da API oficial do whatsapp</label>
                  <FieldWithError
                    id='waId'
                    name='waId'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.waId}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='landbotId'>ID do contato na landbot</label>
                  <FieldWithError
                    id='landbotId'
                    name='landbotId'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.landbotId}
                  />
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
                  <button onClick={() => navigate('/contacts')} className='btn btn-secondary' type='button'>Voltar</button>
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

export default ContactForm
