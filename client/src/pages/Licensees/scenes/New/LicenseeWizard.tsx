import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { FieldWithError } from '../../../../components/form'
import ChatPanel from '../Form/panels/ChatPanel'
import ChatbotPanel from '../Form/panels/ChatbotPanel'
import WhatsAppPanel from '../Form/panels/WhatsAppPanel'
import CartPanel from '../Form/panels/CartPanel'
import PagarMePanel from '../Form/panels/PagarMePanel'
import Pedidos10Panel from '../Form/panels/Pedidos10Panel'

const licenseeInitialValues = {
  name: '',
  email: '',
  phone: '',
  active: false,
  apiToken: '',
  licenseKind: 'demo',
  useChatbot: false,
  useFileIDYcloud: false,
  chatbotDefault: '',
  chatbotUrl: '',
  chatbotAuthorizationToken: '',
  messageOnResetChatbot: '',
  chatbotApiToken: '',
  whatsappDefault: '',
  whatsappToken: '',
  whatsappUrl: '',
  chatDefault: '',
  chatIdentifier: '',
  chatKey: '',
  chatUrl: '',
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

const STEPS = [
  { id: 'identity',  title: 'Identidade', pedidos10Only: false },
  { id: 'chat',      title: 'Chat',        pedidos10Only: false },
  { id: 'chatbot',   title: 'ChatBot',     pedidos10Only: false },
  { id: 'whatsapp',  title: 'WhatsApp',    pedidos10Only: false },
  { id: 'carrinho',  title: 'Carrinho',    pedidos10Only: false },
  { id: 'pagarme',   title: 'PagarMe',     pedidos10Only: false },
  { id: 'pedidos10', title: 'Pedidos10',   pedidos10Only: true  },
]

const identitySchema = Yup.object().shape({
  name:        Yup.string().required('Nome é obrigatório'),
  kind:        Yup.string().required('Tipo é obrigatório'),
  document:    Yup.string().required('Documento é obrigatório'),
  email:       Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  licenseKind: Yup.string().required('Licença é obrigatória'),
  phone:       Yup.string().required('Telefone é obrigatório'),
})

const chatSchema = Yup.object().shape({
  chatDefault: Yup.string().required('Chat padrão é obrigatório'),
  chatUrl:     Yup.string().required('URL do chat é obrigatória'),
  chatIdentifier: Yup.string().when('chatDefault', {
    is: (v) => ['crisp', 'chatwoot'].includes(v),
    then: (s) => s.required('Identifier é obrigatório'),
  }),
  chatKey: Yup.string().when('chatDefault', {
    is: (v) => ['crisp', 'chatwoot'].includes(v),
    then: (s) => s.required('Key é obrigatória'),
  }),
})

const chatbotSchema = Yup.object().shape({
  chatbotDefault:            Yup.string().required('Chatbot padrão é obrigatório'),
  chatbotUrl:                Yup.string().required('URL do chatbot é obrigatória'),
  chatbotAuthorizationToken: Yup.string().required('Token do chatbot é obrigatório'),
  chatbotApiToken:           Yup.string().required('Token de API é obrigatório'),
  messageOnResetChatbot:     Yup.string().required('Mensagem de reset é obrigatória'),
  messageOnCloseChat:        Yup.string().required('Mensagem de encerramento é obrigatória'),
})

const whatsappSchema = Yup.object().shape({
  whatsappDefault: Yup.string().required('WhatsApp padrão é obrigatório'),
  whatsappToken: Yup.string().when('whatsappDefault', {
    is: (v) => v && v !== 'baileys',
    then: (s) => s.required('Token do WhatsApp é obrigatório'),
  }),
  whatsappUrl: Yup.string().when('whatsappDefault', {
    is: (v) => v && v !== 'baileys',
    then: (s) => s.required('URL do WhatsApp é obrigatória'),
  }),
})

const cartSchema = Yup.object().shape({
  cartDefault:        Yup.string().required('Plugin de carrinho é obrigatório'),
  unidadeId:          Yup.string().required('Id da loja é obrigatório'),
  statusId:           Yup.string().required('Id do status é obrigatório'),
  productFractionals: Yup.string().required('Produtos fracionados são obrigatórios'),
})

const pagarmeSchema = Yup.object().shape({
  financial_player_fee: Yup.string().required('Taxa é obrigatória'),
  holder_name:          Yup.string().required('Nome do titular é obrigatório'),
  holder_kind:          Yup.string().required('Tipo do titular é obrigatório'),
  holder_document:      Yup.string().required('Documento do titular é obrigatório'),
  bank:                 Yup.string().required('Banco é obrigatório'),
  branch_number:        Yup.string().required('Agência é obrigatória'),
  branch_check_digit:   Yup.string().required('Dígito da agência é obrigatório'),
  account_number:       Yup.string().required('Conta é obrigatória'),
  account_check_digit:  Yup.string().required('Dígito da conta é obrigatório'),
  account_type:         Yup.string().required('Tipo da conta é obrigatório'),
})

const pedidos10Schema = Yup.object().shape({
  pedidos10_integrator:  Yup.string().required('Software integrador é obrigatório'),
  pedidos10_integration: Yup.string().required('Dados da integração são obrigatórios'),
})

function IdentityStep({ values, errors, touched, handleChange, handleBlur }) {
  return (
    <>
      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='name'>Nome</label>
          <FieldWithError id='name' type='text' name='name'
            value={values.name} onChange={handleChange} onBlur={handleBlur} />
        </div>
        <div className='form-group col-5'>
          <div className='form-check mt-4'>
            <input checked={values.active} onChange={handleChange} onBlur={handleBlur}
              type='checkbox' className='form-check-input' id='active' />
            <label className='form-check-label' htmlFor='active'>Ativo</label>
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='form-group col-2'>
          <label htmlFor='kind'>Tipo</label>
          <select value={values.kind} className='form-select' id='kind'
            onChange={handleChange} onBlur={handleBlur}>
            <option value=''></option>
            <option value='company'>Jurídica</option>
            <option value='individual'>Física</option>
          </select>
        </div>
        <div className='form-group col-3'>
          <label htmlFor='document'>Documento</label>
          <FieldWithError id='document' name='document' type='text'
            value={values.document} onChange={handleChange} onBlur={handleBlur} />
        </div>
      </div>
      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='email'>E-mail</label>
          <FieldWithError id='email' name='email' type='text'
            value={values.email} onChange={handleChange} onBlur={handleBlur} />
        </div>
      </div>
      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='licenseKind'>Licença</label>
          <select value={values.licenseKind} className='form-select' id='licenseKind'
            onChange={handleChange} onBlur={handleBlur}>
            <option value='demo'>Demonstração</option>
            <option value='free'>Grátis</option>
            <option value='paid'>Pago</option>
          </select>
        </div>
      </div>
      <div className='row mt-3'>
        <div className='form-group col-5'>
          <label htmlFor='phone'>Telefone</label>
          <FieldWithError id='phone' name='phone' type='text'
            value={values.phone} onChange={handleChange} onBlur={handleBlur} />
        </div>
      </div>
    </>
  )
}

function YesNoGate({ label, isYes, onChange }) {
  return (
    <div className='mb-3'>
      <p className='fw-semibold'>{label}</p>
      <div className='btn-group' role='group'>
        <button
          type='button'
          className={`btn ${isYes === true ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => onChange(true)}
        >
          Sim
        </button>
        <button
          type='button'
          className={`btn ${isYes === false ? 'btn-secondary' : 'btn-outline-secondary'}`}
          onClick={() => onChange(false)}
        >
          Não
        </button>
      </div>
    </div>
  )
}

function LicenseeWizard({ currentUser, onSubmit, errors: backendErrors }) {
  const navigate = useNavigate()
  const steps = STEPS.filter(s => !s.pedidos10Only || currentUser?.isPedidos10)
  const [currentStep, setCurrentStep] = useState(0)
  const [stepErrors, setStepErrors] = useState(null)
  const [useChat,      setUseChat]      = useState(null)
  const [useWhatsapp,  setUseWhatsapp]  = useState(null)
  const [useCart,      setUseCart]      = useState(null)
  const [usePagarMe,   setUsePagarMe]   = useState(null)
  const [usePedidos10, setUsePedidos10] = useState(null)
  // useChatbot → formik.values.useChatbot (Formik field)

  const totalSteps = steps.length
  const step = steps[currentStep]
  const isLastStep = currentStep === totalSteps - 1
  const progressPct = Math.round(((currentStep + 1) / totalSteps) * 100)

  async function validateStep(values) {
    const schemas = {
      identity: identitySchema,
      chat:      useChat                  ? chatSchema      : null,
      chatbot:   values.useChatbot        ? chatbotSchema   : null,
      whatsapp:  useWhatsapp              ? whatsappSchema  : null,
      carrinho:  useCart                  ? cartSchema      : null,
      pagarme:   usePagarMe               ? pagarmeSchema   : null,
      pedidos10: usePedidos10             ? pedidos10Schema : null,
    }
    const schema = schemas[step.id]
    if (!schema) return true
    try {
      await schema.validate(values, { abortEarly: false })
      return true
    } catch (err) {
      setStepErrors(err.errors)
      return false
    }
  }

  return (
    <Formik initialValues={licenseeInitialValues} validationSchema={Yup.object()} onSubmit={(values) => {
        const cleaned = { ...values }
        if (!useChat) {
          cleaned.chatDefault = ''
          cleaned.chatUrl = ''
          cleaned.chatIdentifier = ''
          cleaned.chatKey = ''
          cleaned.useSenderName = false
        }
        if (!cleaned.useChatbot) {
          cleaned.chatbotDefault = ''
          cleaned.chatbotUrl = ''
          cleaned.chatbotAuthorizationToken = ''
          cleaned.chatbotApiToken = ''
          cleaned.messageOnResetChatbot = ''
          cleaned.messageOnCloseChat = ''
        }
        if (!useWhatsapp) {
          cleaned.whatsappDefault = ''
          cleaned.whatsappToken = ''
          cleaned.whatsappUrl = ''
          cleaned.useFileIDYcloud = false
        }
        if (!useCart) {
          cleaned.cartDefault = ''
          cleaned.unidadeId = ''
          cleaned.statusId = ''
          cleaned.productFractionals = ''
        }
        if (!usePagarMe) {
          cleaned.financial_player_fee = '0.00'
          cleaned.holder_name = ''
          cleaned.holder_kind = ''
          cleaned.holder_document = ''
          cleaned.bank = ''
          cleaned.branch_number = ''
          cleaned.branch_check_digit = ''
          cleaned.account_number = ''
          cleaned.account_check_digit = ''
          cleaned.account_type = ''
        }
        if (!usePedidos10) {
          cleaned.pedidos10_integrator = ''
          cleaned.pedidos10_integration = ''
        }
        onSubmit(cleaned)
      }}>
      {(formik) => (
        <form onSubmit={formik.handleSubmit}>
          <h3>Criar Licenciado</h3>
          <p className='text-muted'>Passo {currentStep + 1} de {totalSteps} — {step.title}</p>

          <div className='progress mb-4' style={{ height: '6px' }}>
            <div
              className='progress-bar'
              role='progressbar'
              style={{ width: `${progressPct}%` }}
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className='mb-4'>
            {step.id === 'identity' && (
              <IdentityStep
                values={formik.values}
                errors={formik.errors}
                touched={formik.touched}
                handleChange={formik.handleChange}
                handleBlur={formik.handleBlur}
              />
            )}
            {step.id === 'chat' && (
              <>
                <YesNoGate
                  label='Deseja integrar com uma Plataforma de Chat?'
                  isYes={useChat}
                  onChange={setUseChat}
                />
                {useChat && (
                  <ChatPanel
                    values={formik.values}
                    errors={formik.errors}
                    touched={formik.touched}
                    handleChange={formik.handleChange}
                    handleBlur={formik.handleBlur}
                  />
                )}
              </>
            )}
            {step.id === 'chatbot' && (
              <>
                <YesNoGate
                  label='Deseja integrar com uma Plataforma de ChatBot?'
                  isYes={formik.values.useChatbot || null}
                  onChange={(val) => formik.setFieldValue('useChatbot', val)}
                />
                {formik.values.useChatbot && (
                  <ChatbotPanel
                    values={formik.values}
                    errors={formik.errors}
                    touched={formik.touched}
                    handleChange={formik.handleChange}
                    handleBlur={formik.handleBlur}
                  />
                )}
              </>
            )}
            {step.id === 'whatsapp' && (
              <>
                <YesNoGate
                  label='Deseja integrar com uma Plataforma de WhatsApp?'
                  isYes={useWhatsapp}
                  onChange={setUseWhatsapp}
                />
                {useWhatsapp && (
                  <WhatsAppPanel
                    values={formik.values}
                    errors={formik.errors}
                    touched={formik.touched}
                    handleChange={formik.handleChange}
                    handleBlur={formik.handleBlur}
                  />
                )}
              </>
            )}
            {step.id === 'carrinho' && (
              <>
                <YesNoGate
                  label='Deseja integrar com um Carrinho de Compras?'
                  isYes={useCart}
                  onChange={setUseCart}
                />
                {useCart && (
                  <CartPanel
                    values={formik.values}
                    errors={formik.errors}
                    touched={formik.touched}
                    handleChange={formik.handleChange}
                    handleBlur={formik.handleBlur}
                  />
                )}
              </>
            )}
            {step.id === 'pagarme' && (
              <>
                <YesNoGate
                  label='Deseja integrar com o PagarMe?'
                  isYes={usePagarMe}
                  onChange={setUsePagarMe}
                />
                {usePagarMe && (
                  <PagarMePanel
                    values={formik.values}
                    errors={formik.errors}
                    touched={formik.touched}
                    handleChange={formik.handleChange}
                    handleBlur={formik.handleBlur}
                    wizardMode={true}
                  />
                )}
              </>
            )}
            {step.id === 'pedidos10' && (
              <>
                <YesNoGate
                  label='Deseja integrar com o Pedidos10?'
                  isYes={usePedidos10}
                  onChange={setUsePedidos10}
                />
                {usePedidos10 && (
                  <Pedidos10Panel
                    values={formik.values}
                    errors={formik.errors}
                    touched={formik.touched}
                    handleChange={formik.handleChange}
                    handleBlur={formik.handleBlur}
                    wizardMode={true}
                  />
                )}
              </>
            )}
          </div>

          {(backendErrors || stepErrors) && (
            <div className='alert alert-danger'>
              <ul className='mb-0'>
                {backendErrors?.map((e) => <li key={e.message || e}>{e.message || e}</li>)}
                {stepErrors?.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}

          <div className='d-flex justify-content-between mt-4'>
            <button type='button' className='btn btn-secondary' onClick={() => navigate('/licensees')}>
              Cancelar
            </button>
            <div className='d-flex gap-2'>
              {currentStep > 0 && (
                <button
                  type='button'
                  className='btn btn-outline-secondary'
                  onClick={() => { setStepErrors(null); setCurrentStep(s => s - 1) }}
                >
                  ← Voltar
                </button>
              )}
              {!isLastStep ? (
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={async () => {
                    const valid = await validateStep(formik.values)
                    if (valid) { setStepErrors(null); setCurrentStep(s => s + 1) }
                  }}
                >
                  Próximo →
                </button>
              ) : (
                <button type='submit' className='btn btn-success'>Salvar</button>
              )}
            </div>
          </div>
        </form>
      )}
    </Formik>
  )
}

export default LicenseeWizard
