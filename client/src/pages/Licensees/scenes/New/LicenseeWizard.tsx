import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { FieldWithError } from '../../../../components/form'
import ChatPanel from '../Form/panels/ChatPanel'
import ChatbotPanel from '../Form/panels/ChatbotPanel'
import WhatsAppPanel from '../Form/panels/WhatsAppPanel'
import type { ILicenseeFormValues } from '../../../../types'
import type { FormikErrors, FormikTouched } from 'formik'

const licenseeInitialValues: ILicenseeFormValues = {
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
  messageOnCloseChat: '',
  document: '',
  kind: '',
  useSenderName: false,
  useSectors: false,
}

const STEPS = [
  { id: 'identity', title: 'Identidade' },
  { id: 'chat',     title: 'Chat' },
  { id: 'chatbot',  title: 'ChatBot' },
  { id: 'whatsapp', title: 'WhatsApp' },
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
  chatUrl: Yup.string().when('chatDefault', {
    is: (v: string) => ['rocketchat', 'crisp', 'chatwoot', 'cuboup'].includes(v),
    then: (s: Yup.StringSchema) => s.required('URL do chat é obrigatória'),
  }),
  chatIdentifier: Yup.string().when('chatDefault', {
    is: (v: string) => ['crisp', 'chatwoot'].includes(v),
    then: (s: Yup.StringSchema) => s.required('Identifier é obrigatório'),
  }),
  chatKey: Yup.string().when('chatDefault', {
    is: (v: string) => ['crisp', 'chatwoot'].includes(v),
    then: (s: Yup.StringSchema) => s.required('Key é obrigatória'),
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
    is: (v: string) => !!v && v !== 'baileys',
    then: (s: Yup.StringSchema) => s.required('Token do WhatsApp é obrigatório'),
  }),
  whatsappUrl: Yup.string().when('whatsappDefault', {
    is: (v: string) => !!v && v !== 'baileys',
    then: (s: Yup.StringSchema) => s.required('URL do WhatsApp é obrigatória'),
  }),
})

interface IdentityStepProps {
  values: ILicenseeFormValues
  errors: FormikErrors<ILicenseeFormValues>
  touched: FormikTouched<ILicenseeFormValues>
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
}

function Required() {
  return <span className='text-danger ms-1' aria-hidden='true'>*</span>
}

function IdentityStep({ values, errors, touched, handleChange, handleBlur }: IdentityStepProps) {
  return (
    <>
      <div className='row'>
        <div className='form-group col-8'>
          <label htmlFor='name'>Nome<Required /></label>
          <FieldWithError id='name' type='text' name='name'
            value={values.name} onChange={handleChange} onBlur={handleBlur} />
        </div>
        <div className='form-group col-4'>
          <div className='form-check mt-4'>
            <input checked={values.active} onChange={handleChange} onBlur={handleBlur}
              type='checkbox' className='form-check-input' id='active' />
            <label className='form-check-label' htmlFor='active'>Ativo</label>
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='form-group col-2'>
          <label htmlFor='kind'>Tipo<Required /></label>
          <select value={values.kind} className='form-select' id='kind'
            onChange={handleChange} onBlur={handleBlur}>
            <option value=''></option>
            <option value='company'>Jurídica</option>
            <option value='individual'>Física</option>
          </select>
        </div>
        <div className='form-group col-4'>
          <label htmlFor='document'>Documento<Required /></label>
          <FieldWithError id='document' name='document' type='text'
            value={values.document} onChange={handleChange} onBlur={handleBlur} />
        </div>
      </div>
      <div className='row'>
        <div className='form-group col-8'>
          <label htmlFor='email'>E-mail<Required /></label>
          <FieldWithError id='email' name='email' type='text'
            value={values.email} onChange={handleChange} onBlur={handleBlur} />
        </div>
      </div>
      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='licenseKind'>Licença<Required /></label>
          <select value={values.licenseKind} className='form-select' id='licenseKind'
            onChange={handleChange} onBlur={handleBlur}>
            <option value='demo'>Demonstração</option>
            <option value='free'>Grátis</option>
            <option value='paid'>Pago</option>
          </select>
        </div>
      </div>
      <div className='row mt-3'>
        <div className='form-group col-8'>
          <label htmlFor='phone'>Telefone<Required /></label>
          <FieldWithError id='phone' name='phone' type='text'
            value={values.phone} onChange={handleChange} onBlur={handleBlur} />
        </div>
      </div>
    </>
  )
}

interface YesNoGateProps {
  label: string
  isYes: boolean | null
  onChange: (value: boolean) => void
}

function YesNoGate({ label, isYes, onChange }: YesNoGateProps) {
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

interface ApiError {
  message: string
}

interface LicenseeWizardProps {
  onSubmit: (values: ILicenseeFormValues) => void
  errors?: ApiError[] | null
}

function LicenseeWizard({ onSubmit, errors: backendErrors }: LicenseeWizardProps) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [stepErrors, setStepErrors] = useState<string[] | null>(null)
  const [useChat,     setUseChat]     = useState<boolean | null>(null)
  const [useWhatsapp, setUseWhatsapp] = useState<boolean | null>(null)

  const totalSteps = STEPS.length
  const step = STEPS[currentStep]
  const isLastStep = currentStep === totalSteps - 1
  const progressPct = Math.round(((currentStep + 1) / totalSteps) * 100)

  async function validateStep(values: ILicenseeFormValues) {
    const schemas: Record<string, Yup.ObjectSchema<object> | null> = {
      identity: identitySchema,
      chat:     useChat           ? chatSchema    : null,
      chatbot:  values.useChatbot ? chatbotSchema : null,
      whatsapp: useWhatsapp       ? whatsappSchema : null,
    }
    const schema = schemas[step.id]
    if (!schema) return true
    try {
      await schema.validate(values, { abortEarly: false })
      return true
    } catch (err: unknown) {
      if (err instanceof Yup.ValidationError) {
        setStepErrors(err.errors)
      }
      return false
    }
  }

  return (
    <Formik initialValues={licenseeInitialValues} validationSchema={Yup.object()} onSubmit={(values) => {
        if (currentStep !== totalSteps - 1) return
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
        onSubmit(cleaned)
      }}>
      {(formik) => (
        <form onSubmit={formik.handleSubmit}>
          <h3>Criar Licenciado</h3>
          <p className='text-muted mb-1'>Passo {currentStep + 1} de {totalSteps} — {step.title}</p>
          <p className='text-muted small mb-3'>Campos marcados com <span className='text-danger'>*</span> são obrigatórios.</p>

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
                  isYes={typeof formik.values.useChatbot === 'boolean' ? formik.values.useChatbot : null}
                  onChange={(val: boolean) => formik.setFieldValue('useChatbot', val)}
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
          </div>

          {(backendErrors || stepErrors) && (
            <div className='alert alert-danger'>
              <ul className='mb-0'>
                {backendErrors?.map((e) => <li key={e.message}>{e.message}</li>)}
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
