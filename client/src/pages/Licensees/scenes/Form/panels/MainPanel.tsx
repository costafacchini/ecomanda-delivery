import React from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  return (
    <>
      <div className='row mb-3'>
        <div className='form-group col-8'>
          <label htmlFor='name'>{t('licensees.form.nameLabel')}<Required /></label>
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
              {t('licensees.form.activeLabel')}
            </label>
          </div>
        </div>
      </div>

      <div className='row mb-3'>
        <div className='form-group col-2'>
          <label htmlFor='kind'>{t('licensees.form.kindLabel')}<Required /></label>
          <select
            value={values.kind}
            className='form-select'
            id='kind'
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value=''>{t('licensees.form.kindSelectPlaceholder')}</option>
            <option value='company'>{t('licensees.form.kindCompany')}</option>
            <option value='individual'>{t('licensees.form.kindIndividual')}</option>
          </select>
        </div>

        <div className='form-group col-3'>
          <label htmlFor='document'>{t('licensees.form.documentLabel')}<Required /></label>
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
          <label htmlFor='email'>{t('licensees.form.emailLabel')}<Required /></label>
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
          <label htmlFor='licenseKind'>{t('licensees.form.licenseKindLabel')}<Required /></label>
          <select
            value={values.licenseKind}
            className='form-select'
            id='licenseKind'
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value='demo'>{t('licensees.form.licenseKindDemo')}</option>
            <option value='free'>{t('licensees.form.licenseKindFree')}</option>
            <option value='paid'>{t('licensees.form.licenseKindPaid')}</option>
          </select>
        </div>
      </div>

      <div className='row mb-3'>
        <div className='form-group col-8'>
          <label htmlFor='phone'>{t('licensees.form.phoneLabel')}<Required /></label>
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
          <label htmlFor='apiToken'>{t('licensees.form.apiTokenLabel')}</label>
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
          {t('licensees.form.webhookSectionSummary')}
        </summary>
        <fieldset className='mt-2'>
          <legend className='visually-hidden'>{t('licensees.form.webhookSectionLegend')}</legend>
          <div className='row mb-3'>
            <div className='form-group col-8'>
              <label htmlFor='urlChatWebhook'>{t('licensees.form.webhookChatLabel')}</label>
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
              <label htmlFor='urlChatbotWebhook'>{t('licensees.form.webhookChatbotLabel')}</label>
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
              <label htmlFor='urlChatbotTransfer'>{t('licensees.form.webhookChatbotTransferLabel')}</label>
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
              <label htmlFor='urlWhatsappWebhook'>{t('licensees.form.webhookWhatsappLabel')}</label>
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
