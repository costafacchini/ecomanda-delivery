import { FieldWithError, Form } from '../../../../components/form'
import * as Yup from 'yup'
import { useNavigate } from 'react-router'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'
import type { IContact } from '../../../../types'
import type { IUser } from '../../../../types'
import type { ILicensee } from '../../../../types'

const SignupSchema = Yup.object().shape({
  name: Yup.string().required('Nome é obrigatório'),
  number: Yup.string().required('Telefone é obrigatório'),
  email: Yup.string().email('E-mail inválido')
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
  ud: '',
  address: '',
  address_number: '',
  address_complement: '',
  neighborhood: '',
  city: '',
  cep: '',
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
  ud: string
  address: string
  address_number: string
  address_complement: string
  neighborhood: string
  city: string
  cep: string
  uf?: string
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
        initialValues={{...contactInitialValues, ...initialValues} as IContactFormValues}
        onSubmit={(values: IContactFormValues) => {
          onSubmit(values)
        }}
      >
        {(formProps) => (
          <form onSubmit={formProps.handleSubmit}>
            <fieldset className='mb-4'>
              <div className='row mb-3'>
                <div className='form-group col-8'>
                  <label htmlFor='name'>Nome <span className='text-danger'>*</span></label>
                  <FieldWithError
                    id='name'
                    type='text'
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.name}
                    name='name'
                    placeholder='Nome do contato'
                  />
                </div>
              </div>

              <div className='row mb-3'>
                <div className='form-group col-8'>
                  <label htmlFor='email'>E-mail</label>
                  <FieldWithError
                    id='email'
                    name='email'
                    type='text'
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.email}
                    placeholder='contato@email.com'
                  />
                </div>
              </div>

              <div className='row mb-3'>
                <div className='form-group col-8'>
                  <label htmlFor='number'>Telefone <span className='text-danger'>*</span></label>
                  <FieldWithError
                    id='number'
                    type='text'
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.number}
                    name='number'
                    placeholder='Ex: 5511999999999'
                  />
                </div>
              </div>

              <div className='row mb-3'>
                <div className='col-8'>
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
                <div className='row mb-3'>
                  <div className='form-group col-8'>
                    <label htmlFor='licensee'>Licenciado</label>
                    <SelectLicenseesWithFilter selectedItem={typeof formProps.values.licensee === 'string' ? null : formProps.values.licensee} onChange={(e: { value?: string } | null) => {
                      const inputValue = e && e.value ? e.value : null
                      formProps.setFieldValue('licensee', inputValue, false)
                    }} />
                  </div>
                </div>
              )}

              <div className='row mb-3'>
                <div className='form-group col-8'>
                  <label htmlFor='waId'>ID da API oficial do WhatsApp</label>
                  <FieldWithError
                    id='waId'
                    name='waId'
                    type='text'
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.waId}
                    placeholder='ID fornecido pela API'
                  />
                </div>
              </div>

              <div className='row mb-3'>
                <div className='form-group col-8'>
                  <label htmlFor='landbotId'>ID do contato na Landbot</label>
                  <FieldWithError
                    id='landbotId'
                    name='landbotId'
                    type='text'
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.landbotId}
                    placeholder='ID do contato na Landbot'
                  />
                </div>
              </div>

              <div className='row mb-3'>
                <div className='form-group col-8'>
                  <label htmlFor='ud'>UD</label>
                  <FieldWithError
                    id='ud'
                    name='ud'
                    type='text'
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.ud}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className='mb-4'>
              <legend className='fs-6 fw-semibold text-muted mb-3'>Endereço</legend>

              <div className='row mb-3'>
                <div className='form-group col-3'>
                  <label htmlFor='cep'>CEP</label>
                  <FieldWithError
                    id='cep'
                    name='cep'
                    type='text'
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.cep}
                    placeholder='Ex: 01310-100'
                  />
                </div>
              </div>

              <div className='row mb-3'>
                <div className='form-group col-5'>
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

                <div className='form-group col-2'>
                  <label htmlFor='uf'>UF</label>
                  <FieldWithError
                    id='uf'
                    name='uf'
                    type='text'
                    onChange={formProps.handleChange}
                    onBlur={formProps.handleBlur}
                    value={formProps.values.uf}
                    placeholder='SP'
                  />
                </div>
              </div>

              <div className='row mb-3'>
                <div className='form-group col-6'>
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

              <div className='row mb-3'>
                <div className='form-group col-8'>
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

              <div className='row mb-3'>
                <div className='form-group col-8'>
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
            </fieldset>

            <fieldset className='mb-4'>
              <legend className='fs-6 fw-semibold text-muted mb-3'>Entrega</legend>

              <div className='row mb-3'>
                <div className='form-group col-4'>
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

              <div className='row mb-3'>
                <div className='form-group col-8'>
                  <label htmlFor='plugin_cart_id'>ID no plugin de carrinho</label>
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
                <ul className='mb-0'>
                  {errors.map((error) => (<li key={error.message}>{error.message}</li>))}
                </ul>
              </div>
            )}

            <div className='row'>
              <div className='col-8'>
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
