import { FieldWithError, Form } from '../../../../components/form'
import * as Yup from 'yup'
import { useNavigate } from 'react-router'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'
import styles from './styles.module.scss'
import type { IUser, TriggerKind } from '../../../../types'

interface ITriggerFormValues {
  name: string
  triggerKind: TriggerKind
  expression: string
  catalogMulti: string
  licensee: string | null
  catalogSingle: string
  textReplyButton: string
  messagesList: string
  catalogId: string
  order: number
  text?: string
}

interface IFormError {
  message: string
}

interface TriggerFormProps {
  onSubmit: (values: ITriggerFormValues) => void
  errors?: IFormError[] | null
  initialValues?: Partial<ITriggerFormValues>
  currentUser?: IUser | null
  activeLicensee?: { _id: string } | null
}

const SignupSchema = Yup.object().shape({
  name: Yup.string()
});

const triggerInitialValues: ITriggerFormValues = {
  name: '',
  triggerKind: 'multi_product',
  expression: '',
  catalogMulti: '',
  licensee: '',
  catalogSingle: '',
  textReplyButton: '',
  messagesList: '',
  catalogId: '',
  order: 1,
}

function TriggerForm({ onSubmit, errors, initialValues, currentUser, activeLicensee }: TriggerFormProps) {
  let navigate = useNavigate()

  return (
    <div>
      <Form
        validationSchema={SignupSchema}
        initialValues={{...triggerInitialValues, ...initialValues}}
        onSubmit={(values) => {
          onSubmit(values)
        }}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <fieldset className='pb-4'>
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

                <div className='form-group col-1'>
                  <label htmlFor='order'>Ordem</label>
                  <FieldWithError
                    id='order'
                    type='number'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.order}
                    name='order'
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='expression'>Expressão</label>
                  <FieldWithError
                    id='expression'
                    name='expression'
                    type='text'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.expression}
                  />
                </div>
              </div>

              {currentUser && currentUser.role === 'super' && !activeLicensee && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='licensee'>Licenciado</label>
                    <SelectLicenseesWithFilter selectedItem={typeof formik.values.licensee === 'string' ? null : formik.values.licensee} onChange={(e: any) => (
                      formik.setFieldValue('licensee', e?.value ?? null, false)
                    )} />
                  </div>
                </div>
              )}

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='triggerKind'>Tipo</label>
                  <select
                    value={formik.values.triggerKind}
                    className='form-select'
                    id='triggerKind'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value='multi_product'>Multiplos produtos</option>
                    <option value='single_product'>Único produto</option>
                    <option value='reply_button'>Botões de resposta</option>
                    <option value='list_message'>Lista de opções (mensagens)</option>
                    <option value='text'>Texto</option>
                  </select>
                </div>
              </div>

              { formik.values.triggerKind === 'multi_product' && (
                <>
                  <div className='row'>
                    <div className='form-group col-5'>
                      <label htmlFor='catalogId'>Id do catálogo</label>
                      <FieldWithError
                        id='catalogId'
                        type='text'
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.catalogId}
                        name='catalogId'
                      />
                    </div>
                  </div>

                  <div className='row'>
                    <div className='form-group col-5'>
                      <label htmlFor='catalogMulti'>Catálogo</label>
                      <div className='pb-2'>
                        <textarea
                          id='catalogMulti'
                          name='catalogMulti'
                          className='form-control'
                          rows={10}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.catalogMulti}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {formik.values.triggerKind === 'single_product' && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='catalogSingle'>Catálogo</label>
                    <div className='pb-2'>
                      <textarea
                        id='catalogSingle'
                        name='catalogSingle'
                        className='form-control'
                        rows={10}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.catalogSingle}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formik.values.triggerKind === 'reply_button' && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='textReplyButton'>Script</label>
                    <div className='pb-2'>
                      <textarea
                        id='textReplyButton'
                        name='textReplyButton'
                        className='form-control'
                        rows={8}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.textReplyButton}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formik.values.triggerKind === 'list_message' && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='messagesList'>Mensagens</label>
                    <div className='pb-2'>
                      <textarea
                        id='messagesList'
                        name='messagesList'
                        className='form-control'
                        rows={8}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.messagesList}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formik.values.triggerKind === 'text' && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='text'>Texto</label>
                    <div className='pb-2'>
                      <textarea
                        id='text'
                        name='text'
                        className='form-control'
                        rows={8}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.text}
                      />
                    </div>
                    <div className={`${styles.textHelp}`}>
                      <span>O campo de texto aceita algumas palavras reservadas:</span>
                      <ul>
                        <li>$last_cart_resume - carrinho do contato</li>
                        <li>$contact_name - nome do contato</li>
                        <li>$contact_number - número de telefone do contato</li>
                        <li>$contact_address_complete - endereço completo do contato</li>
                      </ul>
                    </div>
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
                  <button onClick={() => navigate('/triggers')} className='btn btn-secondary' type='button'>Voltar</button>
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

export default TriggerForm
