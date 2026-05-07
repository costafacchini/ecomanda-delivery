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

const identitySchema = Yup.object().shape({
  name:        Yup.string().required('Nome é obrigatório'),
  kind:        Yup.string().required('Tipo é obrigatório'),
  document:    Yup.string().required('Documento é obrigatório'),
  email:       Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  licenseKind: Yup.string().required('Licença é obrigatória'),
  phone:       Yup.string().required('Telefone é obrigatório'),
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
    const schemas = {
      identity: identitySchema,
      // STEPS 2-7 ADDED IN task-04 ↓
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
            {step.id === 'identity' && (
              <IdentityStep
                values={formik.values}
                errors={formik.errors}
                touched={formik.touched}
                handleChange={formik.handleChange}
                handleBlur={formik.handleBlur}
              />
            )}
            {/* STEPS 2-7 ADDED IN task-04 ↓ */}
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
