import { FieldWithError, Form } from '../../../../components/form'
import * as Yup from 'yup'
import { useNavigate } from 'react-router'
import {
  setLicenseeWebhook,
  importLicenseeTemplate,
  sendLicenseePagarMe,
  signOrderWebhook,
} from '../../../../services/licensee'

const SignupSchema = Yup.object().shape({
  name: Yup.string()
});

const licenseeInitialValues = {
  name: '',
  email: '',
  phone: '',
  active: false,
  apiToken: '',
  licenseKind: 'demo',
  useChatbot: false,
  chatbotDefault: '',
  chatbotUrl: '',
  chatbotAuthorizationToken: '',
  messageOnResetChatbot: '',
  chatbotApiToken: '',
  whatsappDefault: '',
  whatsappToken: '',
  whatsappUrl: '',
  chatDefault: '',
  chatUrl: '',
  awsId: '',
  awsSecret: '',
  bucketName: '',
  chatKey: '',
  chatIdentifier: '',
  cartDefault: '',
  unidadeId: '',
  statusId: '',
  messageOnCloseChat: '',
  productFractional2Name: '',
  productFractional2Id: '',
  productFractional3Name: '',
  productFractional3Id: '',
  productFractionalSize3Name: '',
  productFractionalSize3Id: '',
  productFractionalSize4Name: '',
  productFractionalSize4Id: '',
  productFractionals: '',
  pedidos10_integration: '',
  pedidos10_integrator: '',
  document: '',
  kind: '',
  financial_player_fee: '0.00',
  holder_name: '',
  bank: '',
  branch_number: '',
  branch_check_digit: '',
  account_number: '',
  account_check_digit: '',
  holder_kind: '',
  holder_document: '',
  account_type: '',
  useSenderName: false,
}

function LicenseeForm({ onSubmit, errors, initialValues, currentUser }) {
  let navigate = useNavigate()

  return (
    <div>
      <Form
        validationSchema={SignupSchema}
        initialValues={{ ...licenseeInitialValues, ...initialValues }}
        onSubmit={(values) => {
          onSubmit(values)
        }}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit}>
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
                  <label className='form-check-label' htmlFor='active'>
                    Ativo
                  </label>
                </div>
              </div>
            </div>

            <div className='row'>
              <div className='form-group col-2'>
                <label htmlFor='kind'>Tipo</label>
                <select
                  value={props.values.kind}
                  className='form-select'
                  id='kind'
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                >
                  <option value=''></option>
                  <option value='company'>Jurídica</option>
                  <option value='individual'>Física</option>
                </select>
              </div>

              <div className='form-group col-3'>
                <label htmlFor='document'>Documento</label>
                <FieldWithError
                  id='document'
                  name='document'
                  type='text'
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.document}
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
                <label htmlFor='licenseKind'>Licença</label>
                <select
                  value={props.values.licenseKind}
                  className='form-select'
                  id='licenseKind'
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                >
                  <option value='demo'>Demonstração</option>
                  <option value='free'>Grátis</option>
                  <option value='paid'>Pago</option>
                </select>
              </div>
            </div>

            <div className='row'>
              <div className='form-group col-5'>
                <label htmlFor='phone'>Telefone</label>
                <FieldWithError
                  id='phone'
                  type='text'
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.phone}
                  name='phone'
                />
              </div>
            </div>

            <div className='row pb-4'>
              <div className='form-group col-5'>
                <label htmlFor='apiToken'>API token</label>
                <FieldWithError
                  disabled
                  id='apiToken'
                  type='text'
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.apiToken}
                  name='apiToken'
                />
              </div>
            </div>

            <div className='row pb-2'>
              <div className='col-3'>
                <div className='form-check'>
                  <input
                    type='checkbox'
                    className='form-check-input'
                    id='useChatbot'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    checked={props.values.useChatbot}
                  />
                  <label className='form-check-label' htmlFor='useChatbot'>
                    Usa chatbot?
                  </label>
                </div>
              </div>
            </div>

            <fieldset className='pb-4' disabled={!props.values.useChatbot}>
              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='chatbotDefault'>Chatbot padrão</label>
                  <select
                    value={props.values.chatbotDefault}
                    className='form-select'
                    id='chatbotDefault'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                  >
                    <option value=''></option>
                    <option value='landbot'>Landbot</option>
                  </select>
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='chatbotUrl'>URL do chatbot</label>
                  <FieldWithError
                    id='chatbotUrl'
                    name='chatbotUrl'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.chatbotUrl}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='chatbotAuthorizationToken'>Token do chatbot</label>
                  <FieldWithError
                    id='chatbotAuthorizationToken'
                    name='chatbotAuthorizationToken'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.chatbotAuthorizationToken}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='chatbotApiToken'>Token de acesso via API do chatbot</label>
                  <FieldWithError
                    id='chatbotApiToken'
                    name='chatbotApiToken'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.chatbotApiToken}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='messageOnResetChatbot'>Mensagem de encerramento de chatbot abandonado</label>
                  <textarea
                    className='form-control'
                    rows={4}
                    id='messageOnResetChatbot'
                    name='messageOnResetChatbot'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.messageOnResetChatbot}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='messageOnCloseChat'>Mensagem de encerramento de chat</label>
                  <textarea
                    className='form-control'
                    rows={4}
                    id='messageOnCloseChat'
                    name='messageOnCloseChat'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.messageOnCloseChat}
                  />
                </div>
              </div>
            </fieldset>

            <div className='row'>
              <div className='form-group col-5'>
                <label htmlFor='chatDefault'>Chat padrão</label>
                <select
                  value={props.values.chatDefault}
                  className='form-select'
                  id='chatDefault'
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                >
                  <option value=''></option>
                  <option value='rocketchat'>Rocketchat</option>
                  <option value='crisp'>Crisp</option>
                  <option value='cuboup'>CuboUp</option>
                  <option value='chatwoot'>Chatwoot</option>
                </select>
              </div>
            </div>

            <fieldset className='pb-4' disabled={props.values.chatDefault === ''}>
              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='chatUrl'>Url do chat</label>
                  <FieldWithError
                    id='chatUrl'
                    name='chatUrl'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.chatUrl}
                  />
                </div>
              </div>

              <div className='row pb-2'>
                <div className='col-3'>
                  <div className='form-check'>
                    <input
                      type='checkbox'
                      className='form-check-input'
                      id='useSenderName'
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      checked={props.values.useSenderName}
                    />
                    <label className='form-check-label' htmlFor='useSenderName'>
                      Usa o remetente no nome do chat?
                    </label>
                  </div>
                </div>
              </div>

              {['crisp', 'chatwoot'].includes(props.values.chatDefault) && (
                <>
                  <div className='row'>
                    <div className='form-group col-5'>
                      <label htmlFor='chatIdentifier'>Identifier</label>
                      <FieldWithError
                        id='chatIdentifier'
                        name='chatIdentifier'
                        type='text'
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.chatIdentifier}
                      />
                    </div>
                  </div>

                  <div className='row'>
                    <div className='form-group col-5'>
                      <label htmlFor='chatKey'>Key</label>
                      <FieldWithError
                        id='chatKey'
                        name='chatKey'
                        type='text'
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.chatKey}
                      />
                    </div>
                  </div>
                </>
              )}
            </fieldset>

            <div className='row'>
              <div className='form-group col-5'>
                <label htmlFor='whatsappDefault'>Whatsapp padrão</label>
                <select
                  value={props.values.whatsappDefault}
                  className='form-select'
                  id='whatsappDefault'
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                >
                  <option value=''></option>
                  <option value='utalk'>Utalk</option>
                  <option value='dialog'>Dialog360</option>
                  <option value='ycloud'>YCloud</option>
                  <option value='pabbly'>Pabbly</option>
                </select>
              </div>
            </div>

            <fieldset className='pb-4' disabled={props.values.whatsappDefault === ''}>
              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='whatsappToken'>Token do whatsapp</label>
                  <FieldWithError
                    id='whatsappToken'
                    name='whatsappToken'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.whatsappToken}
                  />
                </div>
              </div>

              <div className='row pb-4'>
                <div className='form-group col-5'>
                  <label htmlFor='whatsappUrl'>Url do whatsapp</label>
                  <FieldWithError
                    id='whatsappUrl'
                    name='whatsappUrl'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.whatsappUrl}
                  />
                </div>
              </div>

              {(props.values.whatsappDefault === 'dialog' || props.values.whatsappDefault === 'ycloud') &&
                props.values.apiToken && (
                  <div className='row pb-4'>
                    <div className='form-group col-3'>
                      <button
                        onClick={async (event) => {
                          event.preventDefault()
                          await setLicenseeWebhook(props.values)
                        }}
                        className='btn btn-info'
                      >
                        Configurar Webhook no provedor
                      </button>
                    </div>

                    <div className='form-group col-2'>
                      <button
                        onClick={async (event) => {
                          event.preventDefault()
                          await importLicenseeTemplate(props.values)
                        }}
                        className='btn btn-info'
                      >
                        Importar templates
                      </button>
                    </div>
                  </div>
                )}
            </fieldset>

            <fieldset className='pb-4'>
              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='awsId'>Id da AWS</label>
                  <FieldWithError
                    id='awsId'
                    name='awsId'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.awsId}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='awsSecret'>Senha AWS</label>
                  <FieldWithError
                    id='awsSecret'
                    name='awsSecret'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.awsSecret}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='bucketName'>Nome do bucket AWS</label>
                  <FieldWithError
                    id='bucketName'
                    name='bucketName'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.bucketName}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className='pb-4'>
              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='cartDefault'>Plugin para uso de carrinho de compra</label>
                  <select
                    value={props.values.cartDefault}
                    className='form-select'
                    id='cartDefault'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                  >
                    <option value=''></option>
                    <option value='alloy'>Alloy</option>
                    <option value='go2go'>Go2Go</option>
                    <option value='go2go_v2'>Go2Go v2</option>
                  </select>
                </div>
              </div>

              <div className='row pb-2'>
                <div className='col-3'>
                  <div className='form-check'>
                    <input
                      type='checkbox'
                      className='form-check-input'
                      id='useCartGallabox'
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      checked={props.values.useCartGallabox}
                    />
                    <label className='form-check-label' htmlFor='useCartGallabox'>
                      Usa gallabox?
                    </label>
                  </div>
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='unidadeId'>Id da loja</label>
                  <FieldWithError
                    id='unidadeId'
                    name='unidadeId'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.unidadeId}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='statusId'>Id do status do carrinho de compra</label>
                  <FieldWithError
                    id='statusId'
                    name='statusId'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.statusId}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='productFractionals'>Produtos</label>
                  <div className='pb-2'>
                    <textarea
                      id='productFractionals'
                      name='productFractionals'
                      className='form-control'
                      rows={10}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      value={props.values.productFractionals}
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className='pb-4'>
              <div className='row'>
                <div className='form-group col-1'>
                  <label htmlFor='financial_player_fee'>% Taxa</label>
                  <FieldWithError
                    id='financial_player_fee'
                    name='financial_player_fee'
                    type='number'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.financial_player_fee}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='holder_name'>Nome do titular da conta</label>
                  <FieldWithError
                    id='holder_name'
                    name='holder_name'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.holder_name}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-2'>
                  <label htmlFor='holder_kind'>Tipo titular da conta</label>
                  <select
                    value={props.values.holder_kind}
                    className='form-select'
                    id='holder_kind'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                  >
                    <option value=''></option>
                    <option value='company'>Jurídica</option>
                    <option value='individual'>Física</option>
                  </select>
                </div>

                <div className='form-group col-3'>
                  <label htmlFor='holder_document'>Documento titular da conta</label>
                  <FieldWithError
                    id='holder_document'
                    name='holder_document'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.holder_document}
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-1'>
                  <label htmlFor='bank'>Banco</label>
                  <FieldWithError
                    id='bank'
                    name='bank'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.bank}
                  />
                </div>

                <div className='form-group col-1'>
                  <label htmlFor='branch_number'>AG</label>
                  <FieldWithError
                    id='branch_number'
                    name='branch_number'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.branch_number}
                  />
                </div>

                <div className='form-group col-1'>
                  <label htmlFor='branch_check_digit'>DG</label>
                  <FieldWithError
                    id='branch_check_digit'
                    name='branch_check_digit'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.branch_check_digit}
                  />
                </div>

                <div className='form-group col-1'>
                  <label htmlFor='account_number'>Conta</label>
                  <FieldWithError
                    id='account_number'
                    name='account_number'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.account_number}
                  />
                </div>

                <div className='form-group col-1'>
                  <label htmlFor='account_check_digit'>DG</label>
                  <FieldWithError
                    id='account_check_digit'
                    name='account_check_digit'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.account_check_digit}
                  />
                </div>
              </div>

              <div className='row pb-4'>
                <div className='form-group col-2'>
                  <label htmlFor='account_type'>Tipo da conta</label>
                  <select
                    value={props.values.account_type}
                    className='form-select'
                    id='account_type'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                  >
                    <option value=''></option>
                    <option value='checking'>Corrente</option>
                    <option value='savings'>Poupança</option>
                  </select>
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-3'>
                  <button
                    onClick={async (event) => {
                      event.preventDefault()
                      await sendLicenseePagarMe(props.values)
                    }}
                    className='btn btn-info'
                  >
                    Integrar com a Pagar.Me
                  </button>
                </div>
              </div>
            </fieldset>

            {currentUser && currentUser.isPedidos10 && (
              <fieldset>
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='pedidos10_integrator'>Software Integrador</label>
                    <select
                      value={props.values.pedidos10_integrator}
                      className='form-select'
                      id='pedidos10_integrator'
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                    >
                      <option value=''></option>
                    </select>
                  </div>
                </div>

                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='pedidos10_integration'>Dados da integração</label>
                    <div className='pb-2'>
                      <textarea
                        id='pedidos10_integration'
                        name='pedidos10_integration'
                        className='form-control'
                        rows={10}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.pedidos10_integration}
                      />
                    </div>
                  </div>
                </div>

                <div className='row'>
                  <div className='form-group col-3'>
                    <button
                      onClick={async (event) => {
                        event.preventDefault()
                        await signOrderWebhook(props.values)
                      }}
                      className='btn btn-info'
                    >
                      Assinar Webhook P10
                    </button>
                  </div>
                </div>
              </fieldset>
            )}

            <fieldset>
              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='urlChatWebhook'>URL para webhook de Chat</label>
                  <FieldWithError
                    disabled
                    id='urlChatWebhook'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.urlChatWebhook}
                    name='urlChatWebhook'
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='urlChatbotWebhook'>URL para webhook de Chatbot</label>
                  <FieldWithError
                    disabled
                    id='urlChatbotWebhook'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.urlChatbotWebhook}
                    name='urlChatbotWebhook'
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='urlChatbotTransfer'>URL de webhook para transferir do Chatbot para o Chat</label>
                  <FieldWithError
                    disabled
                    id='urlChatbotTransfer'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.urlChatbotTransfer}
                    name='urlChatbotTransfer'
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='urlWhatsappWebhook'>URL para webhook de whatsapp</label>
                  <FieldWithError
                    disabled
                    id='urlWhatsappWebhook'
                    type='text'
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.urlWhatsappWebhook}
                    name='urlWhatsappWebhook'
                  />
                </div>
              </div>
            </fieldset>

            {errors && (
              <div className='alert alert-danger'>
                <ul>
                  {errors.map((error) => (
                    <li key={error.message}>{error.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className='row'>
              <div className='col-5'>
                <div className='mt-4 d-flex justify-content-between'>
                  <button onClick={() => navigate('/licensees')} className='btn btn-secondary' type='button'>
                    Voltar
                  </button>
                  <button className='btn btn-success' type='submit'>
                    Salvar
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

export default LicenseeForm
