import { useState, useEffect } from 'react'
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
  const [activeTab, setActiveTab] = useState('principal')
  const [useChat, setUseChat] = useState(true)
  const [useWhatsapp, setUseWhatsapp] = useState(true)
  const [useCart, setUseCart] = useState(true)
  const [usePagarMe, setUsePagarMe] = useState(true)

  useEffect(() => { if (!useChat && activeTab === 'chat') setActiveTab('principal') }, [useChat])
  useEffect(() => { if (!useWhatsapp && activeTab === 'whatsapp') setActiveTab('principal') }, [useWhatsapp])
  useEffect(() => { if (!useCart && activeTab === 'carrinho') setActiveTab('principal') }, [useCart])
  useEffect(() => { if (!usePagarMe && activeTab === 'pagarme') setActiveTab('principal') }, [usePagarMe])

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
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'principal' ? 'active' : ''}`}
                  onClick={() => setActiveTab('principal')}
                >
                  Principal
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  Chat
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'chatbot' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chatbot')}
                >
                  ChatBot
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'whatsapp' ? 'active' : ''}`}
                  onClick={() => setActiveTab('whatsapp')}
                >
                  WhatsApp
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'carrinho' ? 'active' : ''}`}
                  onClick={() => setActiveTab('carrinho')}
                >
                  Carrinho de Compras
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'pagarme' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pagarme')}
                >
                  PagarMe
                </button>
              </li>
              {currentUser?.isPedidos10 && (
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${activeTab === 'pedidos10' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pedidos10')}
                  >
                    Pedidos10
                  </button>
                </li>
              )}
            </ul>

            <div className="tab-content">
              <div className={`tab-pane fade ${activeTab === 'principal' ? 'show active' : ''}`}>
                <MainPanel
                  values={props.values}
                  errors={props.errors}
                  touched={props.touched}
                  handleChange={props.handleChange}
                  handleBlur={props.handleBlur}
                  currentUser={currentUser}
                />
              </div>
              <div className={`tab-pane fade ${activeTab === 'chat' ? 'show active' : ''}`}>
                <ChatPanel
                  values={props.values}
                  errors={props.errors}
                  touched={props.touched}
                  handleChange={props.handleChange}
                  handleBlur={props.handleBlur}
                />
              </div>
              <div className={`tab-pane fade ${activeTab === 'chatbot' ? 'show active' : ''}`}>
                <ChatbotPanel
                  values={props.values}
                  errors={props.errors}
                  touched={props.touched}
                  handleChange={props.handleChange}
                  handleBlur={props.handleBlur}
                />
              </div>
              <div className={`tab-pane fade ${activeTab === 'whatsapp' ? 'show active' : ''}`}>
                <WhatsAppPanel
                  values={props.values}
                  errors={props.errors}
                  touched={props.touched}
                  handleChange={props.handleChange}
                  handleBlur={props.handleBlur}
                />
              </div>
              <div className={`tab-pane fade ${activeTab === 'carrinho' ? 'show active' : ''}`}>
                <CartPanel
                  values={props.values}
                  errors={props.errors}
                  touched={props.touched}
                  handleChange={props.handleChange}
                  handleBlur={props.handleBlur}
                />
              </div>
              <div className={`tab-pane fade ${activeTab === 'pagarme' ? 'show active' : ''}`}>
                <PagarMePanel
                  values={props.values}
                  errors={props.errors}
                  touched={props.touched}
                  handleChange={props.handleChange}
                  handleBlur={props.handleBlur}
                />
              </div>
              <div className={`tab-pane fade ${activeTab === 'pedidos10' ? 'show active' : ''}`}>
                <Pedidos10Panel
                  values={props.values}
                  errors={props.errors}
                  touched={props.touched}
                  handleChange={props.handleChange}
                  handleBlur={props.handleBlur}
                />
              </div>
            </div>

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
