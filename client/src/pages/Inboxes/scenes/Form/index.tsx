import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FieldWithError, Form } from '../../../../components/form'
import * as Yup from 'yup'
import { useNavigate } from 'react-router'
import InboxBaileysPanel from '../Edit/InboxBaileysPanel'

const inboxInitialValues = {
  name: '',
  kind: 'messenger' as const,
  whatsappDefault: '',
  whatsappToken: '',
  whatsappUrl: '',
  chatDefault: '',
  chatUrl: '',
  chatKey: '',
  chatIdentifier: '',
  active: true,
}

interface InboxFormProps {
  onSubmit: (values: any) => void
  errors?: any[] | null
  initialValues?: Record<string, any>
  inboxId?: string
}

function InboxForm({ onSubmit, errors, initialValues, inboxId }: InboxFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const inboxSchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string().required(t('inboxes.validation.nameRequired')),
        kind: Yup.string().required(t('inboxes.validation.kindRequired')),
      }),
    [t]
  )

  const mergedInitialValues = { ...inboxInitialValues, ...initialValues }

  const isBaileysMessenger =
    inboxId &&
    mergedInitialValues.kind === 'messenger' &&
    mergedInitialValues.whatsappDefault === 'baileys'

  return (
    <div>
      <Form
        validationSchema={inboxSchema}
        initialValues={mergedInitialValues}
        onSubmit={(values: any) => onSubmit(values)}
      >
        {(formikProps: any) => {
          const selectedKind = formikProps.values.kind
          const isMessenger = selectedKind === 'messenger'
          const isChat = selectedKind === 'chat'

          return (
            <form onSubmit={formikProps.handleSubmit}>
              <fieldset className='pb-4'>
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='name'>{t('common.name')}</label>
                    <FieldWithError
                      id='name'
                      type='text'
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      value={formikProps.values.name}
                      name='name'
                    />
                  </div>

                  <div className='form-group col-3'>
                    <label htmlFor='kind'>{t('inboxes.kindLabel')}</label>
                    <select
                      id='kind'
                      name='kind'
                      className='form-select'
                      value={formikProps.values.kind}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                    >
                      <option value='messenger'>{t('inboxes.kind.messenger')}</option>
                      <option value='chat'>{t('inboxes.kind.chat')}</option>
                    </select>
                  </div>

                  <div className='form-group col-4'>
                    <div className='form-check mt-4'>
                      <input
                        checked={formikProps.values.active}
                        onChange={formikProps.handleChange}
                        onBlur={formikProps.handleBlur}
                        type='checkbox'
                        className='form-check-input'
                        id='active'
                        name='active'
                      />
                      <label className='form-check-label' htmlFor='active'>{t('inboxes.active')}</label>
                    </div>
                  </div>
                </div>

                {isMessenger && (
                  <div className='row'>
                    <div className='form-group col-4'>
                      <label htmlFor='whatsappDefault'>{t('inboxes.whatsappDefault')}</label>
                      <FieldWithError
                        id='whatsappDefault'
                        type='text'
                        onChange={formikProps.handleChange}
                        onBlur={formikProps.handleBlur}
                        value={formikProps.values.whatsappDefault}
                        name='whatsappDefault'
                      />
                    </div>
                    <div className='form-group col-4'>
                      <label htmlFor='whatsappToken'>{t('inboxes.whatsappToken')}</label>
                      <FieldWithError
                        id='whatsappToken'
                        type='text'
                        onChange={formikProps.handleChange}
                        onBlur={formikProps.handleBlur}
                        value={formikProps.values.whatsappToken}
                        name='whatsappToken'
                      />
                    </div>
                    <div className='form-group col-4'>
                      <label htmlFor='whatsappUrl'>{t('inboxes.whatsappUrl')}</label>
                      <FieldWithError
                        id='whatsappUrl'
                        type='text'
                        onChange={formikProps.handleChange}
                        onBlur={formikProps.handleBlur}
                        value={formikProps.values.whatsappUrl}
                        name='whatsappUrl'
                      />
                    </div>
                  </div>
                )}

                {isChat && (
                  <div className='row'>
                    <div className='form-group col-3'>
                      <label htmlFor='chatDefault'>{t('inboxes.chatDefault')}</label>
                      <FieldWithError
                        id='chatDefault'
                        type='text'
                        onChange={formikProps.handleChange}
                        onBlur={formikProps.handleBlur}
                        value={formikProps.values.chatDefault}
                        name='chatDefault'
                      />
                    </div>
                    <div className='form-group col-3'>
                      <label htmlFor='chatUrl'>{t('inboxes.chatUrl')}</label>
                      <FieldWithError
                        id='chatUrl'
                        type='text'
                        onChange={formikProps.handleChange}
                        onBlur={formikProps.handleBlur}
                        value={formikProps.values.chatUrl}
                        name='chatUrl'
                      />
                    </div>
                    <div className='form-group col-3'>
                      <label htmlFor='chatKey'>{t('inboxes.chatKey')}</label>
                      <FieldWithError
                        id='chatKey'
                        type='text'
                        onChange={formikProps.handleChange}
                        onBlur={formikProps.handleBlur}
                        value={formikProps.values.chatKey}
                        name='chatKey'
                      />
                    </div>
                    <div className='form-group col-3'>
                      <label htmlFor='chatIdentifier'>{t('inboxes.chatIdentifier')}</label>
                      <FieldWithError
                        id='chatIdentifier'
                        type='text'
                        onChange={formikProps.handleChange}
                        onBlur={formikProps.handleBlur}
                        value={formikProps.values.chatIdentifier}
                        name='chatIdentifier'
                      />
                    </div>
                  </div>
                )}

                {inboxId && (
                  <div className='row mt-2'>
                    <div className='col-12'>
                      <label className='form-label fw-semibold'>{t('inboxes.inboxToken')}</label>
                      <p className='text-muted font-monospace small'>{mergedInitialValues.inboxToken}</p>
                    </div>
                    {mergedInitialValues.webhookUrl && (
                      <div className='col-12'>
                        <label className='form-label fw-semibold'>{t('inboxes.webhookUrl')}</label>
                        <p className='text-muted font-monospace small'>{mergedInitialValues.webhookUrl}</p>
                      </div>
                    )}
                  </div>
                )}
              </fieldset>

              {errors && (
                <div className='alert alert-danger'>
                  <ul>
                    {errors.map((error: any) => (
                      <li key={error.message}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {isBaileysMessenger && (
                <InboxBaileysPanel inboxId={inboxId} isActive={mergedInitialValues.active} />
              )}

              <div className='row'>
                <div className='col-5'>
                  <div className='mt-4 d-flex justify-content-between'>
                    <button onClick={() => navigate('/inboxes')} className='btn btn-secondary' type='button'>
                      {t('common.back')}
                    </button>
                    <button className='btn btn-success' type='submit'>
                      {t('common.save')}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )
        }}
      </Form>
    </div>
  )
}

export default InboxForm
