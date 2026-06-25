import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useTranslation } from 'react-i18next'
import { FieldWithError } from '../../../../../components/form'
import { setLicenseeWebhook, getBaileysQr, getBaileysStatus, importLicenseeTemplate, syncBaileysDirectory } from '../../../../../services/licensee'
import type { ILicenseeFormValues } from '../../../../../types'
import type { FormikErrors, FormikTouched } from 'formik'

interface WhatsAppPanelValues extends ILicenseeFormValues {
  id?: string
  apiToken: string
}

interface WhatsAppPanelProps {
  values: WhatsAppPanelValues
  errors: FormikErrors<WhatsAppPanelValues>
  touched: FormikTouched<WhatsAppPanelValues>
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  isActive?: boolean
}

interface SyncResult {
  importedGroups: number
  updatedGroups: number
}

interface IBaileysQrResponse {
  qr?: string
  message?: string
}

interface IBaileysStatusResponse {
  connected?: boolean
}

function WhatsAppPanel({ values, errors, touched, handleChange, handleBlur, isActive }: WhatsAppPanelProps) {
  const { t } = useTranslation()
  const [baileysQr, setBaileysQr] = useState<string | null>(null)
  const [baileysStatus, setBaileysStatus] = useState<string | null>(null)
  const [baileysConnected, setBaileysConnected] = useState<boolean | null>(null)
  const [baileysChecking, setBaileysChecking] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    if (!isActive || values.whatsappDefault !== 'baileys' || !values.id) return

    setBaileysChecking(true)
    getBaileysStatus(values as any)
      .then((response) => {
        setBaileysConnected((response.data as IBaileysStatusResponse)?.connected ?? false)
      })
      .catch(() => {
        setBaileysConnected(false)
      })
      .finally(() => {
        setBaileysChecking(false)
      })
  }, [isActive])

  return (
    <>
      <div className='row mb-3'>
        <div className='form-group col-8'>
          <label htmlFor='whatsappDefault'>{t('licensees.form.whatsapp.whatsappDefaultLabel')}</label>
          <select
            value={values.whatsappDefault}
            className='form-select'
            id='whatsappDefault'
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value=''>{t('licensees.form.whatsapp.noneOption')}</option>
            <option value='utalk'>Utalk</option>
            <option value='dialog'>Dialog360</option>
            <option value='ycloud'>YCloud</option>
            <option value='pabbly'>Pabbly</option>
            <option value='baileys'>Baileys</option>
          </select>
        </div>
      </div>

      {values.whatsappDefault !== '' && <fieldset>
        {values.whatsappDefault !== 'baileys' && (
          <>
            <div className='row mb-3'>
              <div className='form-group col-8'>
                <label htmlFor='whatsappToken'>{t('licensees.form.whatsapp.whatsappTokenLabel')}</label>
                <FieldWithError
                  id='whatsappToken'
                  name='whatsappToken'
                  type='text'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.whatsappToken}
                />
              </div>
            </div>

            <div className='row mb-3'>
              <div className='form-group col-8'>
                <label htmlFor='whatsappUrl'>{t('licensees.form.whatsapp.whatsappUrlLabel')}</label>
                <FieldWithError
                  id='whatsappUrl'
                  name='whatsappUrl'
                  type='text'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.whatsappUrl}
                />
              </div>
            </div>
          </>
        )}

        {values.whatsappDefault === 'ycloud' && (
          <div className='row mb-3'>
            <div className='col-8'>
              <div className='form-check'>
                <input
                  type='checkbox'
                  className='form-check-input'
                  id='useFileIDYcloud'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  checked={values.useFileIDYcloud}
                />
                <label className='form-check-label' htmlFor='useFileIDYcloud'>
                  {t('licensees.form.whatsapp.useFileIDYcloudLabel')}
                </label>
              </div>
            </div>
          </div>
        )}

        {(values.whatsappDefault === 'dialog' || values.whatsappDefault === 'ycloud') &&
          values.apiToken && (
            <div className='row mb-3'>
              <div className='form-group col-3'>
                <button
                  onClick={async (event) => {
                    event.preventDefault()
                    await setLicenseeWebhook(values as any)
                  }}
                  className='btn btn-info'
                >
                  {t('licensees.form.whatsapp.setWebhookButton')}
                </button>
              </div>

              <div className='form-group col-2'>
                <button
                  onClick={async (event) => {
                    event.preventDefault()
                    await importLicenseeTemplate(values as any)
                  }}
                  className='btn btn-info'
                >
                  {t('licensees.form.whatsapp.importTemplatesButton')}
                </button>
              </div>
            </div>
          )}

        {values.whatsappDefault === 'baileys' && (
          <div className='row mb-3'>
            <div className='col-8'>
              <div className='form-check'>
                <input
                  type='checkbox'
                  className='form-check-input'
                  id='useSectors'
                  name='useSectors'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  checked={values.useSectors ?? false}
                />
                <label className='form-check-label' htmlFor='useSectors'>
                  {t('licensees.form.whatsapp.useSectorsLabel')}
                </label>
              </div>
            </div>
          </div>
        )}

        {values.whatsappDefault === 'baileys' && (
          <div className='row mb-3'>
            {baileysChecking && (
              <div className='form-group col-12'>
                <span className='text-muted'>{t('licensees.form.whatsapp.checkingConnection')}</span>
              </div>
            )}

            {!baileysChecking && baileysConnected && (
              <div className='form-group col-12 d-flex align-items-center gap-3'>
                <span className='text-success fw-semibold'>{t('licensees.form.whatsapp.connected')}</span>
                <button
                  onClick={async (event) => {
                    event.preventDefault()
                    setBaileysConnected(null)
                    setBaileysQr(null)
                    setBaileysStatus(null)
                    const response = await getBaileysQr(values as any)
                    const qrData = response.data as IBaileysQrResponse
                    if (qrData?.qr) {
                      setBaileysQr(qrData.qr)
                      setBaileysConnected(false)
                    } else {
                      setBaileysStatus(qrData?.message ?? t('licensees.form.whatsapp.generateQrError'))
                    }
                  }}
                  className='btn btn-outline-secondary btn-sm'
                >
                  {t('licensees.form.whatsapp.reconnectButton')}
                </button>
                {values.id && (
                  <button
                    onClick={async (event) => {
                      event.preventDefault()
                      setSyncResult(null)
                      setSyncError(null)
                      setSyncLoading(true)
                      try {
                        const response = await syncBaileysDirectory(values as any)
                        setSyncResult(response.data as SyncResult)
                      } catch {
                        setSyncError(t('licensees.form.whatsapp.syncError'))
                      } finally {
                        setSyncLoading(false)
                      }
                    }}
                    className='btn btn-outline-primary btn-sm'
                    disabled={syncLoading}
                  >
                    {syncLoading ? t('licensees.form.whatsapp.syncingButton') : t('licensees.form.whatsapp.syncGroupsButton')}
                  </button>
                )}
              </div>
            )}

            {syncResult && (
              <div className='form-group col-12 mt-2'>
                <span className='text-muted small'>
                  {t('licensees.form.whatsapp.syncResult', {
                    imported: syncResult.importedGroups,
                    updated: syncResult.updatedGroups,
                  })}
                </span>
              </div>
            )}

            {syncError && (
              <div className='form-group col-12 mt-2'>
                <span className='text-danger small'>{syncError}</span>
              </div>
            )}

            {!baileysChecking && baileysConnected === false && (
              <div className='form-group col-3'>
                <button
                  onClick={async (event) => {
                    event.preventDefault()
                    setBaileysQr(null)
                    setBaileysStatus(null)
                    const response = await getBaileysQr(values as any)
                    const qrData = response.data as IBaileysQrResponse
                    if (qrData?.qr) {
                      setBaileysQr(qrData.qr)
                    } else {
                      setBaileysStatus(qrData?.message ?? t('licensees.form.whatsapp.generateQrError'))
                    }
                  }}
                  className='btn btn-info'
                >
                  {t('licensees.form.whatsapp.generateQrButton')}
                </button>
              </div>
            )}

            {!baileysChecking && baileysConnected === null && !values.id && (
              <div className='form-group col-3'>
                <button
                  onClick={async (event) => {
                    event.preventDefault()
                    setBaileysQr(null)
                    setBaileysStatus(null)
                    const response = await getBaileysQr(values as any)
                    const qrData = response.data as IBaileysQrResponse
                    if (qrData?.qr) {
                      setBaileysQr(qrData.qr)
                    } else {
                      setBaileysStatus(qrData?.message ?? t('licensees.form.whatsapp.generateQrError'))
                    }
                  }}
                  className='btn btn-info'
                >
                  {t('licensees.form.whatsapp.generateQrButton')}
                </button>
              </div>
            )}

            {baileysQr && (
              <div className='form-group col-3 mt-2'>
                <QRCodeSVG value={baileysQr} size={200} />
              </div>
            )}
            {baileysStatus && (
              <div className='form-group col-3'>
                <p>{baileysStatus}</p>
              </div>
            )}
          </div>
        )}
      </fieldset>}
    </>
  )
}

export default WhatsAppPanel
