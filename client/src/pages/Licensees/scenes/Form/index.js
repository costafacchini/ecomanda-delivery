import { useState } from 'react'
import { Form } from '../../../../components/form'
import * as Yup from 'yup'
import { useNavigate } from 'react-router'
import MainPanel from './panels/MainPanel'
import ChatPanel from './panels/ChatPanel'
import ChatbotPanel from './panels/ChatbotPanel'
import WhatsAppPanel from './panels/WhatsAppPanel'
import CartPanel from './panels/CartPanel'
import PagarMePanel from './panels/PagarMePanel'
import Pedidos10Panel from './panels/Pedidos10Panel'

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
  useFileIDYcloud: false,
}

function LicenseeForm({ onSubmit, errors, initialValues, currentUser }) {
  let navigate = useNavigate()
  const [useChat, setUseChat] = useState(false)
  const [useWhatsapp, setUseWhatsapp] = useState(false)
  const [useCart, setUseCart] = useState(false)
  const [usePagarMe, setUsePagarMe] = useState(false)

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
            <MainPanel
              values={props.values}
              errors={props.errors}
              touched={props.touched}
              handleChange={props.handleChange}
              handleBlur={props.handleBlur}
              currentUser={currentUser}
              useChat={useChat}
              setUseChat={setUseChat}
              useWhatsapp={useWhatsapp}
              setUseWhatsapp={setUseWhatsapp}
              useCart={useCart}
              setUseCart={setUseCart}
              usePagarMe={usePagarMe}
              setUsePagarMe={setUsePagarMe}
              setFieldValue={props.setFieldValue}
            />

            <ChatbotPanel
              values={props.values}
              errors={props.errors}
              touched={props.touched}
              handleChange={props.handleChange}
              handleBlur={props.handleBlur}
            />

            <ChatPanel
              values={props.values}
              errors={props.errors}
              touched={props.touched}
              handleChange={props.handleChange}
              handleBlur={props.handleBlur}
            />

            <WhatsAppPanel
              values={props.values}
              errors={props.errors}
              touched={props.touched}
              handleChange={props.handleChange}
              handleBlur={props.handleBlur}
            />

            <CartPanel
              values={props.values}
              errors={props.errors}
              touched={props.touched}
              handleChange={props.handleChange}
              handleBlur={props.handleBlur}
            />

            <PagarMePanel
              values={props.values}
              errors={props.errors}
              touched={props.touched}
              handleChange={props.handleChange}
              handleBlur={props.handleBlur}
            />

            {currentUser && currentUser.isPedidos10 && (
              <Pedidos10Panel
                values={props.values}
                errors={props.errors}
                touched={props.touched}
                handleChange={props.handleChange}
                handleBlur={props.handleBlur}
              />
            )}

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
