import { FieldWithError, Form } from '../../../../components/form'
import * as Yup from 'yup'
import { useNavigate } from 'react-router'
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
  address: '',
  address_number: '',
  address_complement: '',
  neighborhood: '',
  city: '',
  cep: '',
  ud: '',
  delivery_tax: 0,
  plugin_cart_id: ''
}

function ContactForm({ onSubmit, errors, initialValues, currentUser }) {
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

            <fieldset className='pb-4'>
              <div className='row'>
                <div className='form-group col-3'>
                  <label htmlFor='cep'>Cep</label>
                  <FieldWithError
                    id='cep'
                    name='cep'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.cep}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-4'>
                  <label htmlFor='city'>Cidade</label>
                  <FieldWithError
                    id='city'
                    name='city'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.city}
                  />
                </div>

                <div className='form-group col-1'>
                  <label htmlFor='uf'>UF</label>
                  <FieldWithError
                    id='uf'
                    name='uf'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.uf}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='address'>Endereço</label>
                  <FieldWithError
                    id='address'
                    name='address'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.address}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-2'>
                  <label htmlFor='address_number'>Número</label>
                  <FieldWithError
                    id='address_number'
                    name='address_number'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.address_number}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='address_complement'>Complemento</label>
                  <FieldWithError
                    id='address_complement'
                    name='address_complement'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.address_complement}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='neighborhood'>Bairro</label>
                  <FieldWithError
                    id='neighborhood'
                    name='neighborhood'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.neighborhood}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='delivery_tax'>Taxa de entrega</label>
                  <FieldWithError
                    id='delivery_tax'
                    name='delivery_tax'
                    type='number'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.delivery_tax}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='plugin_cart_id'>Id no plugin de carrinho</label>
                  <FieldWithError
                    id='plugin_cart_id'
                    name='plugin_cart_id'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.plugin_cart_id}
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
