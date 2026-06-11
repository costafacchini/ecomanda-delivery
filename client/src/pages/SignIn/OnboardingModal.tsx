import React, { useState } from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { createAccount, OnboardingFields } from '../../services/onboarding'

type StepId = 'identity' | 'integrations' | 'chat' | 'whatsapp' | 'user'

function buildSteps(wantsChat: boolean | null, wantsWhatsapp: boolean | null): StepId[] {
  return [
    'identity',
    'integrations',
    ...(wantsChat === true ? ['chat' as StepId] : []),
    ...(wantsWhatsapp === true ? ['whatsapp' as StepId] : []),
    'user',
  ]
}

const identitySchema = Yup.object().shape({
  licenseeName: Yup.string().required('Nome da empresa é obrigatório'),
  kind:         Yup.string().required('Tipo é obrigatório'),
  document:     Yup.string().required('Documento é obrigatório'),
  licenseeEmail: Yup.string().email('E-mail inválido').required('E-mail da empresa é obrigatório'),
  phone:        Yup.string().required('Telefone é obrigatório'),
})

const chatSchema = Yup.object().shape({
  chatDefault: Yup.string().required('Chat padrão é obrigatório'),
  chatUrl: Yup.string().when('chatDefault', {
    is: (v: string) => v && v !== 'local',
    then: (s) => s.required('URL do chat é obrigatória'),
  }),
  chatIdentifier: Yup.string().when('chatDefault', {
    is: (v: string) => ['crisp', 'chatwoot'].includes(v),
    then: (s) => s.required('Identifier é obrigatório'),
  }),
  chatKey: Yup.string().when('chatDefault', {
    is: (v: string) => ['crisp', 'chatwoot'].includes(v),
    then: (s) => s.required('Key é obrigatória'),
  }),
})

const whatsappSchema = Yup.object().shape({
  whatsappDefault: Yup.string().required('WhatsApp padrão é obrigatório'),
  whatsappToken: Yup.string().when('whatsappDefault', {
    is: (v: string) => v && v !== 'baileys',
    then: (s) => s.required('Token do WhatsApp é obrigatório'),
  }),
  whatsappUrl: Yup.string().when('whatsappDefault', {
    is: (v: string) => v && v !== 'baileys',
    then: (s) => s.required('URL do WhatsApp é obrigatória'),
  }),
})

const userSchema = Yup.object().shape({
  userName:        Yup.string().min(4, 'Nome deve ter no mínimo 4 caracteres').required('Nome é obrigatório'),
  userEmail:       Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  password:        Yup.string().min(8, 'Senha deve ter no mínimo 8 caracteres').required('Senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Senhas não conferem')
    .required('Confirmação de senha é obrigatória'),
})

const schemaMap: Partial<Record<StepId, Yup.ObjectSchema<any>>> = {
  identity:    identitySchema,
  chat:        chatSchema,
  whatsapp:    whatsappSchema,
  user:        userSchema,
}

const initialValues = {
  licenseeName: '',
  kind: '',
  document: '',
  licenseeEmail: '',
  phone: '',
  chatDefault: '',
  chatUrl: '',
  chatIdentifier: '',
  chatKey: '',
  whatsappDefault: '',
  whatsappToken: '',
  whatsappUrl: '',
  useSectors: false,
  userName: '',
  userEmail: '',
  password: '',
  confirmPassword: '',
}

function YesNoGate({ label, isYes, onChange }: { label: string; isYes: boolean | null; onChange: (v: boolean) => void }) {
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

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function OnboardingModal({ isOpen, onClose, onSuccess }: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [wantsChat, setWantsChat]               = useState<boolean | null>(null)
  const [wantsWhatsapp, setWantsWhatsapp]       = useState<boolean | null>(null)
  const [stepErrors, setStepErrors]             = useState<string[] | null>(null)
  const [submitError, setSubmitError]           = useState('')

  if (!isOpen) return null

  const steps = buildSteps(wantsChat, wantsWhatsapp)
  const stepId = steps[currentStepIndex]
  const isLast = currentStepIndex === steps.length - 1

  async function validateCurrentStep(values: any): Promise<boolean> {
    const schema = schemaMap[stepId]
    if (!schema) return true
    try {
      await schema.validate(values, { abortEarly: false })
      setStepErrors(null)
      return true
    } catch (err: any) {
      setStepErrors(err.errors)
      return false
    }
  }

  async function handleNext(values: any) {
    const valid = await validateCurrentStep(values)
    if (valid) {
      setStepErrors(null)
      setCurrentStepIndex((i) => i + 1)
    }
  }

  function handleBack() {
    setStepErrors(null)
    setCurrentStepIndex((i) => i - 1)
  }

  async function handleSubmit(values: any, { setSubmitting }: any) {
    const valid = await validateCurrentStep(values)
    if (!valid) {
      setSubmitting(false)
      return
    }

    const payload: OnboardingFields = {
      licenseeName:  values.licenseeName,
      kind:          values.kind,
      document:      values.document,
      licenseeEmail: values.licenseeEmail,
      phone:         values.phone,
      userName:      values.userName,
      userEmail:     values.userEmail,
      password:      values.password,
      ...(wantsChat ? {
        chatDefault:    values.chatDefault,
        chatUrl:        values.chatUrl,
        chatIdentifier: values.chatIdentifier,
        chatKey:        values.chatKey,
      } : {}),
      ...(wantsWhatsapp ? {
        whatsappDefault: values.whatsappDefault,
        whatsappToken:   values.whatsappToken,
        whatsappUrl:     values.whatsappUrl,
        useSectors:      values.useSectors ?? false,
      } : {}),
    }

    const response = await createAccount(payload)
    setSubmitting(false)

    if (response.status === 201) {
      onSuccess()
    } else {
      console.error('onboarding error', response)
      const errors = response.data?.errors
      if (errors && typeof errors === 'object') {
        const messages = Object.values(errors).map((e: any) => e.message || String(e))
        setSubmitError(messages.join(', '))
      } else {
        setSubmitError(response.data?.message || `Erro ao criar conta (status ${response.status})`)
      }
    }
  }

  function renderStepContent(formik: any) {
    if (stepId === 'identity') {
      return (
        <>
          <div className='mb-3'>
            <label htmlFor='licenseeName' className='form-label'>Nome da empresa</label>
            <input
              id='licenseeName'
              name='licenseeName'
              type='text'
              className='form-control'
              value={formik.values.licenseeName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.licenseeName && formik.errors.licenseeName && (
              <div className='text-danger small'>{formik.errors.licenseeName as string}</div>
            )}
          </div>

          <div className='row mb-3'>
            <div className='col-3'>
              <label htmlFor='kind' className='form-label'>Tipo</label>
              <select
                id='kind'
                name='kind'
                className='form-select'
                value={formik.values.kind}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value=''></option>
                <option value='company'>Jurídica</option>
                <option value='individual'>Física</option>
              </select>
              {formik.touched.kind && formik.errors.kind && (
                <div className='text-danger small'>{formik.errors.kind as string}</div>
              )}
            </div>

            <div className='col-5'>
              <label htmlFor='document' className='form-label'>Documento</label>
              <input
                id='document'
                name='document'
                type='text'
                className='form-control'
                value={formik.values.document}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.document && formik.errors.document && (
                <div className='text-danger small'>{formik.errors.document as string}</div>
              )}
            </div>

            <div className='col-4'>
              <label htmlFor='phone' className='form-label'>Telefone</label>
              <input
                id='phone'
                name='phone'
                type='text'
                className='form-control'
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.phone && formik.errors.phone && (
                <div className='text-danger small'>{formik.errors.phone as string}</div>
              )}
            </div>
          </div>

          <div className='mb-3'>
            <label htmlFor='licenseeEmail' className='form-label'>E-mail da empresa</label>
            <input
              id='licenseeEmail'
              name='licenseeEmail'
              type='text'
              className='form-control'
              value={formik.values.licenseeEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.licenseeEmail && formik.errors.licenseeEmail && (
              <div className='text-danger small'>{formik.errors.licenseeEmail as string}</div>
            )}
          </div>
        </>
      )
    }

    if (stepId === 'integrations') {
      return (
        <>
          <YesNoGate
            label='Deseja integrar com uma Plataforma de Chat?'
            isYes={wantsChat}
            onChange={setWantsChat}
          />
          <YesNoGate
            label='Deseja integrar com uma Plataforma de WhatsApp?'
            isYes={wantsWhatsapp}
            onChange={setWantsWhatsapp}
          />
        </>
      )
    }

    if (stepId === 'chat') {
      return (
        <>
          <div className='mb-3'>
            <label htmlFor='chatDefault' className='form-label'>Chat padrão</label>
            <select
              id='chatDefault'
              name='chatDefault'
              className='form-select'
              value={formik.values.chatDefault}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value=''></option>
              <option value='rocketchat'>Rocketchat</option>
              <option value='crisp'>Crisp</option>
              <option value='cuboup'>CuboUp</option>
              <option value='chatwoot'>Chatwoot</option>
              <option value='local'>Local</option>
            </select>
            {formik.touched.chatDefault && formik.errors.chatDefault && (
              <div className='text-danger small'>{formik.errors.chatDefault as string}</div>
            )}
          </div>

          {['rocketchat', 'crisp', 'chatwoot', 'cuboup'].includes(formik.values.chatDefault) && (
            <div className='mb-3'>
              <label htmlFor='chatUrl' className='form-label'>URL do chat</label>
              <input
                id='chatUrl'
                name='chatUrl'
                type='text'
                className='form-control'
                value={formik.values.chatUrl}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.chatUrl && formik.errors.chatUrl && (
                <div className='text-danger small'>{formik.errors.chatUrl as string}</div>
              )}
            </div>
          )}

          {['crisp', 'chatwoot'].includes(formik.values.chatDefault) && (
            <>
              <div className='mb-3'>
                <label htmlFor='chatIdentifier' className='form-label'>Identifier</label>
                <input
                  id='chatIdentifier'
                  name='chatIdentifier'
                  type='text'
                  className='form-control'
                  value={formik.values.chatIdentifier}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.chatIdentifier && formik.errors.chatIdentifier && (
                  <div className='text-danger small'>{formik.errors.chatIdentifier as string}</div>
                )}
              </div>

              <div className='mb-3'>
                <label htmlFor='chatKey' className='form-label'>Key</label>
                <input
                  id='chatKey'
                  name='chatKey'
                  type='text'
                  className='form-control'
                  value={formik.values.chatKey}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.chatKey && formik.errors.chatKey && (
                  <div className='text-danger small'>{formik.errors.chatKey as string}</div>
                )}
              </div>
            </>
          )}
        </>
      )
    }

    if (stepId === 'whatsapp') {
      return (
        <>
          <div className='mb-3'>
            <label htmlFor='whatsappDefault' className='form-label'>WhatsApp padrão</label>
            <select
              id='whatsappDefault'
              name='whatsappDefault'
              className='form-select'
              value={formik.values.whatsappDefault}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value=''></option>
              <option value='utalk'>Utalk</option>
              <option value='dialog'>Dialog360</option>
              <option value='ycloud'>YCloud</option>
              <option value='pabbly'>Pabbly</option>
              <option value='baileys'>Baileys</option>
            </select>
            {formik.touched.whatsappDefault && formik.errors.whatsappDefault && (
              <div className='text-danger small'>{formik.errors.whatsappDefault as string}</div>
            )}
          </div>

          {formik.values.whatsappDefault === 'baileys' && (
            <div className='mb-3 form-check'>
              <input
                type='checkbox'
                className='form-check-input'
                id='useSectors'
                name='useSectors'
                checked={formik.values.useSectors ?? false}
                onChange={formik.handleChange}
              />
              <label className='form-check-label' htmlFor='useSectors'>
                Usar setores (múltiplos departamentos com números de WhatsApp separados)
              </label>
            </div>
          )}

          {formik.values.whatsappDefault && formik.values.whatsappDefault !== 'baileys' && (
            <>
              <div className='mb-3'>
                <label htmlFor='whatsappToken' className='form-label'>Token do WhatsApp</label>
                <input
                  id='whatsappToken'
                  name='whatsappToken'
                  type='text'
                  className='form-control'
                  value={formik.values.whatsappToken}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.whatsappToken && formik.errors.whatsappToken && (
                  <div className='text-danger small'>{formik.errors.whatsappToken as string}</div>
                )}
              </div>

              <div className='mb-3'>
                <label htmlFor='whatsappUrl' className='form-label'>URL do WhatsApp</label>
                <input
                  id='whatsappUrl'
                  name='whatsappUrl'
                  type='text'
                  className='form-control'
                  value={formik.values.whatsappUrl}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.whatsappUrl && formik.errors.whatsappUrl && (
                  <div className='text-danger small'>{formik.errors.whatsappUrl as string}</div>
                )}
              </div>
            </>
          )}
        </>
      )
    }

    if (stepId === 'user') {
      return (
        <>
          <div className='mb-3'>
            <label htmlFor='userName' className='form-label'>Seu nome</label>
            <input
              id='userName'
              name='userName'
              type='text'
              className='form-control'
              value={formik.values.userName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.userName && formik.errors.userName && (
              <div className='text-danger small'>{formik.errors.userName as string}</div>
            )}
          </div>

          <div className='mb-3'>
            <label htmlFor='userEmail' className='form-label'>Seu e-mail</label>
            <input
              id='userEmail'
              name='userEmail'
              type='text'
              className='form-control'
              value={formik.values.userEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.userEmail && formik.errors.userEmail && (
              <div className='text-danger small'>{formik.errors.userEmail as string}</div>
            )}
          </div>

          <div className='mb-3'>
            <label htmlFor='password' className='form-label'>Senha</label>
            <input
              id='password'
              name='password'
              type='password'
              className='form-control'
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <div className='text-danger small'>{formik.errors.password as string}</div>
            )}
          </div>

          <div className='mb-3'>
            <label htmlFor='confirmPassword' className='form-label'>Confirmar senha</label>
            <input
              id='confirmPassword'
              name='confirmPassword'
              type='password'
              className='form-control'
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <div className='text-danger small'>{formik.errors.confirmPassword as string}</div>
            )}
          </div>
        </>
      )
    }

    return null
  }

  const stepTitles: Record<StepId, string> = {
    identity:     'Dados da Empresa',
    integrations: 'Integrações',
    chat:         'Plataforma de Chat',
    whatsapp:     'Plataforma de WhatsApp',
    user:         'Seus Dados',
  }

  return (
    <div className='modal d-block' tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className='modal-dialog modal-dialog-centered modal-lg'>
        <div className='modal-content'>
          <Formik
            initialValues={initialValues}
            validationSchema={Yup.object()}
            onSubmit={handleSubmit}
          >
            {(formik) => (
              <>
                <div className='modal-header'>
                  <div>
                    <h5 className='modal-title mb-0'>Criar conta</h5>
                    <p className='text-muted mb-0 small'>
                      Passo {currentStepIndex + 1} de {steps.length} — {stepTitles[stepId]}
                    </p>
                  </div>
                  <button type='button' className='btn-close' onClick={onClose} />
                </div>

                <div className='modal-body'>
                  {renderStepContent(formik)}
                </div>

                <div className='modal-footer flex-column align-items-stretch'>
                  {(stepErrors || submitError) && (
                    <div className='alert alert-danger mb-2'>
                      {stepErrors?.map((e) => <div key={e}>{e}</div>)}
                      {submitError && <div>{submitError}</div>}
                    </div>
                  )}

                  <div className='d-flex justify-content-between'>
                    {currentStepIndex === 0
                      ? <button type='button' className='btn btn-secondary' onClick={onClose}>Cancelar</button>
                      : <button type='button' className='btn btn-outline-secondary' onClick={handleBack}>← Voltar</button>
                    }
                    {isLast
                      ? (
                        <button
                          type='button'
                          className='btn btn-success'
                          disabled={formik.isSubmitting}
                          onClick={() => formik.submitForm()}
                        >
                          {formik.isSubmitting ? 'Criando...' : 'Criar conta'}
                        </button>
                      )
                      : (
                        <button
                          type='button'
                          className='btn btn-primary'
                          onClick={() => handleNext(formik.values)}
                        >
                          Próximo →
                        </button>
                      )
                    }
                  </div>
                </div>
              </>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default OnboardingModal
