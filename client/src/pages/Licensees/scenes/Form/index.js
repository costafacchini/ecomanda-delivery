import { FieldWithError, Form } from '../../../../components/form'
import * as Yup from "yup";
import { useHistory } from 'react-router-dom'

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
  whatsappDefault: '',
  whatsappToken: '',
  whatsappUrl: '',
  chatDefault: '',
  chatUrl: '',
  awsId: '',
  awsSecret: '',
  bucketName: '',
}

function LicenseeForm({ onSubmit, errors, initialValues }) {
  let history = useHistory();

  return (
    <div>
      <Form
        validationSchema={SignupSchema}
        initialValues={{...licenseeInitialValues, ...initialValues}}
        onSubmit={(values) => {
          onSubmit(values)
        }}
      >
        {props => (
          <form onSubmit={props.handleSubmit}>
            <div className='row'>
              <div className='form-group col-5'>
                <label htmlFor='name'>Nome</label>
                <FieldWithError
                  id='name'
                  type="text"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.name}
                  name="name"
                />
              </div>
              <div className='form-group col-5'>
                <div className="form-check mt-4">
                  <input
                    checked={props.values.active}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    type="checkbox"
                    className="form-check-input"
                    id="active"
                  />
                  <label className="form-check-label" htmlFor="active">Ativo</label>
                </div>
              </div>
            </div>

            <div className='row'>
              <div className='form-group col-5'>
                <label htmlFor='email'>E-email</label>
                <FieldWithError
                  id='email'
                  name="email"
                  type="text"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.email}
                />
              </div>
            </div>

            <div className='row'>
              <div className='form-group col-5'>
                <label htmlFor='phone'>Telefone</label>
                <FieldWithError
                  id='phone'
                  type="text"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.phone}
                  name="phone"
                />
              </div>
            </div>

            <div className='row'>
              <div className='form-group col-5'>
                <label htmlFor='apiToken'>API token</label>
                <FieldWithError
                  id='apiToken'
                  type="text"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.apiToken}
                  name="apiToken"
                />
              </div>
            </div>

            <div className='row pb-4'>
              <div className='col-5'>
                <div className="form-group">
                  <label htmlFor="licenseKind">Tipo</label>
                  <select
                    value={props.values.licenseKind}
                    className="form-select"
                    id="licenseKind"
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                  >
                    <option value='demo'>Demonstração</option>
                    <option value='free'>Grátis</option>
                    <option value='paid'>Pago</option>
                  </select>
                </div>
              </div>
            </div>

            <div className='row pb-2'>
              <div className='col-3'>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="useChatbot"
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    checked={props.values.useChatbot}
                  />
                  <label className="form-check-label" htmlFor="useChatbot">Chatbot</label>
                </div>
              </div>
            </div>

            <div className='row'>
              <div className='col-5'>
                <div className="form-group">
                  <label htmlFor="chatDefault">Chat padrão</label>
                  <select
                    value={props.values.chatDefault}
                    className="form-select"
                    id="chatDefault"
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                  >
                    <option value=''></option>
                    <option value='jivochat'>Jivochat</option>
                    <option value='rocketchat'>Rocketchat</option>
                  </select>
                </div>
              </div>
            </div>

            <div className='row'>
              <div className='col-5'>
                <div className="form-group">
                  <label htmlFor="chatbotDefault">Chatbot padrão</label>
                  <select
                    value={props.values.chatbotDefault}
                    className="form-select"
                    id="chatbotDefault"
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                  >
                    <option value=''></option>
                    <option value='landbot'>Landbot</option>
                  </select>
                </div>
              </div>
            </div>

            <div className='row'>
              <div className='form-group col-5'>
                <label htmlFor='chatbotUrl'>URL do chatbot</label>
                <FieldWithError
                  id='chatbotUrl'
                  name="chatbotUrl"
                  type="text"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.chatbotUrl}
                />
              </div>
            </div>

            <div className='row pb-4'>
              <div className='form-group col-5'>
                <label htmlFor='chatbotAuthorizationToken'>Token do chatbot</label>
                <FieldWithError
                  id='chatbotAuthorizationToken'
                  name="chatbotAuthorizationToken"
                  type="text"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.chatbotAuthorizationToken}
                />
              </div>
            </div>

            <div className='row'>
              <div className='form-group col-5'>
                <label htmlFor='whatsappToken'>Token do whatsapp</label>
                <FieldWithError
                  id='whatsappToken'
                  name="whatsappToken"
                  type="text"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.whatsappToken}
                />
              </div>
            </div>

            <div className='row'>
              <div className='col-5'>
                <div className="form-group">
                  <label htmlFor="whatsappDefault">Whatsapp Default</label>
                  <select
                    value={props.values.whatsappDefault}
                    className="form-select"
                    id="whatsappDefault"
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                  >
                    <option value=''></option>
                    <option value='utalk'>Utalk</option>
                    <option value='winzap'>Winzap</option>
                    <option value='chatapi'>Chat-api</option>
                    <option value='dialog'>Dialog360</option>
                  </select>
                </div>
              </div>
            </div>

            <div className='row'>
              <div className='form-group col-5'>
                <label htmlFor='whatsappUrl'>Url do whatsapp</label>
                <FieldWithError
                  id='whatsappUrl'
                  name="whatsappUrl"
                  type="text"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.whatsappUrl}
                />
              </div>
            </div>

            <div className='row pb-3'>
              <div className='form-group col-5'>
                <label htmlFor='chatUrl'>Url do chat</label>
                <FieldWithError
                  id='chatUrl'
                  name="chatUrl"
                  type="text"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.chatUrl}
                />
              </div>
            </div>

            <div className='row'>
              <div className='form-group col-5'>
                <label htmlFor='awsId'>Id da AWS</label>
                <FieldWithError
                  id='awsId'
                  name="awsId"
                  type="text"
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
                  name="awsSecret"
                  type="text"
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
                  name="bucketName"
                  type="text"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.bucketName}
                />
              </div>
            </div>

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
                  <button onClick={()=> history.push('/licensees')} className='btn btn-secondary' type="button">Voltar</button>
                  <button className='btn btn-success' type="submit">Salvar</button>
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
