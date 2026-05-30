import { FieldWithError, Form } from '../../../../components/form'
import * as Yup from 'yup'
import { useNavigate } from 'react-router'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'
import styles from './styles.module.scss'

const SignupSchema = Yup.object().shape({
  name: Yup.string()
});

const triggerInitialValues = {
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

function TriggerForm({ onSubmit, errors, initialValues, currentUser }) {
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
        {props => (
          <form onSubmit={props.handleSubmit}>
            <fieldset className='pb-4'>
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

                <div className='form-group col-1'>
                  <label htmlFor='order'>Ordem</label>
                  <FieldWithError
                    id='order'
                    type='number'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.order}
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
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.expression}
                  />
                </div>
              </div>

              {currentUser && currentUser.isSuper && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='licensee'>Licenciado</label>
                    <SelectLicenseesWithFilter selectedItem={props.values.licensee} onChange={(e) => (
                      props.setFieldValue('licensee', e.value, false)
                    )} />
                  </div>
                </div>
              )}

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='triggerKind'>Tipo</label>
                  <select
                    value={props.values.triggerKind}
                    className='form-select'
                    id='triggerKind'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                  >
                    <option value='multi_product'>Multiplos produtos</option>
                    <option value='single_product'>Único produto</option>
                    <option value='reply_button'>Botões de resposta</option>
                    <option value='list_message'>Lista de opções (mensagens)</option>
                    <option value='text'>Texto</option>
                  </select>
                </div>
              </div>

              { props.values.triggerKind === 'multi_product' && (
                <>
                  <div className='row'>
                    <div className='form-group col-5'>
                      <label htmlFor='catalogId'>Id do catálogo</label>
                      <FieldWithError
                        id='catalogId'
                        type='text'
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.catalogId}
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
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          value={props.values.catalogMulti}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {props.values.triggerKind === 'single_product' && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='catalogSingle'>Catálogo</label>
                    <div className='pb-2'>
                      <textarea
                        id='catalogSingle'
                        name='catalogSingle'
                        className='form-control'
                        rows={10}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.catalogSingle}
                      />
                    </div>
                  </div>
                </div>
              )}

              {props.values.triggerKind === 'reply_button' && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='textReplyButton'>Script</label>
                    <div className='pb-2'>
                      <textarea
                        id='textReplyButton'
                        name='textReplyButton'
                        className='form-control'
                        rows={8}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.textReplyButton}
                      />
                    </div>
                  </div>
                </div>
              )}

              {props.values.triggerKind === 'list_message' && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='messagesList'>Mensagens</label>
                    <div className='pb-2'>
                      <textarea
                        id='messagesList'
                        name='messagesList'
                        className='form-control'
                        rows={8}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.messagesList}
                      />
                    </div>
                  </div>
                </div>
              )}

              {props.values.triggerKind === 'text' && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='text'>Texto</label>
                    <div className='pb-2'>
                      <textarea
                        id='text'
                        name='text'
                        className='form-control'
                        rows={8}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.text}
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
                  {errors.map((error) => (<li key={error.message}>{error.message}</li>))}
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
