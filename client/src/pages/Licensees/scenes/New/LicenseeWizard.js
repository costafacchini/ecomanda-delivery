import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { FieldWithError } from '../../../../components/form'

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

function LicenseeWizard({ currentUser, onSubmit, errors: backendErrors }) {
  const navigate = useNavigate()
  const steps = STEPS.filter(s => !s.pedidos10Only || currentUser?.isPedidos10)
  const [currentStep, setCurrentStep] = useState(0)
  const [stepErrors, setStepErrors] = useState(null)

  const totalSteps = steps.length
  const step = steps[currentStep]
  const isLastStep = currentStep === totalSteps - 1
  const progressPct = Math.round(((currentStep + 1) / totalSteps) * 100)

  async function validateStep(values) {
    // STEPS 2-7 ADDED IN task-04 ↓
    return true
  }

  return (
    <Formik initialValues={licenseeInitialValues} validationSchema={Yup.object()} onSubmit={(values) => onSubmit(values)}>
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
            <p>[Conteúdo do passo: {step.title}]</p>
            {/* STEPS content added in task-03 and task-04 */}
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
