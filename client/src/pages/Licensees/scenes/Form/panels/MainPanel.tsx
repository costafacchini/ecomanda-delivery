import React from 'react'
import { FieldWithError } from '../../../../../components/form'
import type { ILicenseeFormValues } from '../../../../../types'
import type { FormikErrors, FormikTouched } from 'formik'

/** MainPanel also receives the read-only webhook URL fields returned by the API */
interface MainPanelValues extends ILicenseeFormValues {
  urlChatWebhook?: string
  urlChatbotWebhook?: string
  urlChatbotTransfer?: string
  urlWhatsappWebhook?: string
}

interface MainPanelProps {
  values: MainPanelValues
  errors: FormikErrors<MainPanelValues>
  touched: FormikTouched<MainPanelValues>
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  currentUser?: unknown
}

function Required() {
  return <span className='text-danger ms-1' aria-hidden='true'>*</span>
}

function MainPanel({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
}: MainPanelProps) {
  return (
    <>
      <div className='row mb-3'>
        <div className='form-group col-8'>
          <label htmlFor='name'>Nome<Required /></label>
          <FieldWithError
            id='name'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.name}
            name='name'
          />
        </div>
        <div className='form-group col-4'>
          <div className='form-check mt-4'>
            <input
              checked={values.active}
              onChange={handleChange}
              onBlur={handleBlur}
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

      <div className='row mb-3'>
        <div className='form-group col-2'>
          <label htmlFor='kind'>Tipo<Required /></label>
          <select
            value={values.kind}
            className='form-select'
            id='kind'
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value=''>Selecione</option>
            <option value='company'>Jurídica</option>
            <option value='individual'>Física</option>
          </select>
        </div>

        <div className='form-group col-3'>
          <label htmlFor='document'>Documento<Required /></label>
          <FieldWithError
            id='document'
            name='document'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.document}
          />
        </div>
      </div>

      <div className='row mb-3'>
        <div className='form-group col-8'>
          <label htmlFor='email'>E-mail<Required /></label>
          <FieldWithError
            id='email'
            name='email'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />
        </div>
      </div>

      <div className='row mb-3'>
        <div className='form-group col-8'>
          <label htmlFor='licenseKind'>Licença<Required /></label>
          <select
            value={values.licenseKind}
            className='form-select'
            id='licenseKind'
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value='demo'>Demonstração</option>
            <option value='free'>Grátis</option>
            <option value='paid'>Pago</option>
          </select>
        </div>
      </div>

      <div className='row mb-3'>
        <div className='form-group col-8'>
          <label htmlFor='phone'>Telefone<Required /></label>
          <FieldWithError
            id='phone'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.phone}
            name='phone'
          />
        </div>
      </div>

      <div className='row mb-3'>
        <div className='form-group col-8'>
          <label htmlFor='apiToken'>API token</label>
          <FieldWithError
            readOnly
            id='apiToken'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.apiToken}
            name='apiToken'
          />
        </div>
      </div>

      <details className='mt-2'>
        <summary className='text-muted small' style={{ cursor: 'pointer', userSelect: 'none' }}>
          URLs de webhook (somente leitura)
        </summary>
        <fieldset className='mt-2'>
          <legend className='visually-hidden'>URLs de webhook geradas pelo sistema</legend>
          <div className='row mb-3'>
            <div className='form-group col-8'>
              <label htmlFor='urlChatWebhook'>URL para webhook de Chat</label>
              <FieldWithError
                readOnly
                id='urlChatWebhook'
                type='text'
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.urlChatWebhook}
                name='urlChatWebhook'
              />
            </div>
          </div>

          <div className='row mb-3'>
            <div className='form-group col-8'>
              <label htmlFor='urlChatbotWebhook'>URL para webhook de Chatbot</label>
              <FieldWithError
                readOnly
                id='urlChatbotWebhook'
                type='text'
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.urlChatbotWebhook}
                name='urlChatbotWebhook'
              />
            </div>
          </div>

          <div className='row mb-3'>
            <div className='form-group col-8'>
              <label htmlFor='urlChatbotTransfer'>URL de webhook para transferir do Chatbot para o Chat</label>
              <FieldWithError
                readOnly
                id='urlChatbotTransfer'
                type='text'
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.urlChatbotTransfer}
                name='urlChatbotTransfer'
              />
            </div>
          </div>

          <div className='row mb-3'>
            <div className='form-group col-8'>
              <label htmlFor='urlWhatsappWebhook'>URL para webhook de WhatsApp</label>
              <FieldWithError
                readOnly
                id='urlWhatsappWebhook'
                type='text'
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.urlWhatsappWebhook}
                name='urlWhatsappWebhook'
              />
            </div>
          </div>
        </fieldset>
      </details>
    </>
  )
}

export default MainPanel
