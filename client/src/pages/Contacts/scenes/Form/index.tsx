import { FieldWithError, Form } from '../../../../components/form'
import * as Yup from 'yup'
import { useNavigate } from 'react-router'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'
import type { IContact } from '../../../../types'
import type { IUser } from '../../../../types'
import type { ILicensee } from '../../../../types'

const SignupSchema = Yup.object().shape({
  name: Yup.string()
});

const contactInitialValues: Partial<IContact> & {
  talkingWithChatBot: boolean
  waId: string
  landbotId: string
  ud: string
  delivery_tax: number
  plugin_cart_id: string
} = {
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

interface ContactFormProps {
  onSubmit: (values: IContactFormValues) => void
  errors?: Array<{ message: string }> | null
  initialValues?: Partial<IContact>
  currentUser?: IUser | null
  activeLicensee?: ILicensee | null
}

interface IContactFormValues {
  name: string
  number: string
  email: string
  talkingWithChatBot: boolean
  licensee: string | null
  waId: string
  landbotId: string
  address: string
  address_number: string
  address_complement: string
  neighborhood: string
  city: string
  cep: string
  uf?: string
  ud: string
  delivery_tax: number
  plugin_cart_id: string
  [key: string]: unknown
}

function ContactForm(props: ContactFormProps) {
  const { onSubmit, errors, initialValues, currentUser, activeLicensee } = props
  const navigate = useNavigate()

  return (
    <div>
      <Form
        validationSchema={SignupSchema}
        initialValues={{...contactInitialValues, ...initialValues}}
        onSubmit={(values: IContactFormValues) => {
          onSubmit(values)
        }}
      >
        {(formProps: {
          handleSubmit: React.FormEventHandler
          handleChange: React.ChangeEventHandler
          handleBlur: React.FocusEventHandler
          values: IContactFormValues
          setFieldValue: (field: string, value: unknown, shouldValidate?: boolean) => void
        }) => (
          <form onSubmit={formProps.handleSubmit}>
            <fieldset className='pb-4'>
              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='name'>Nome</label>
                  <FieldWithError
                    id='name'
                    type='text'
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.name}
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
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.email}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='number'>Telefone</label>
                  <FieldWithError
                    id='number'
                    type='text'
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.number}
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
                      onChange={formProps.handleChange}
                      onBlur={formProps.handleBlur}
                      checked={formProps.values.talkingWithChatBot}
                    />
                    <label className='form-check-label' htmlFor='talkingWithChatBot'>Conversando com chatbot?</label>
                  </div>
                </div>
              </div>

              {currentUser && currentUser.role === 'super' && !activeLicensee && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='waId'>Licenciado</label>
                    <SelectLicenseesWithFilter selectedItem={formProps.values.licensee} onChange={(e: { value?: string } | null) => {
                      const inputValue = e && e.value ? e.value : null
                      formProps.setFieldValue('licensee', inputValue, false)
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
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.waId}
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
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.landbotId}
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
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.cep}
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
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.city}
                  />
                </div>

                <div className='form-group col-1'>
                  <label htmlFor='uf'>UF</label>
                  <FieldWithError
                    id='uf'
                    name='uf'
                    type='text'
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.uf}
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
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.address}
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
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.address_number}
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
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.address_complement}
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
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.neighborhood}
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
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.delivery_tax}
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
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.plugin_cart_id}
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
