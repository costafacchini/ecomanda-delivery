import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { FieldWithError } from '../../../../../components/form'
import { setLicenseeWebhook, getBaileysQr, getBaileysStatus, importLicenseeTemplate } from '../../../../../services/licensee'

function WhatsAppPanel({ values, errors, touched, handleChange, handleBlur, isActive }) {
  const [baileysQr, setBaileysQr] = useState(null)
  const [baileysStatus, setBaileysStatus] = useState(null)
  const [baileysConnected, setBaileysConnected] = useState(null)
  const [baileysChecking, setBaileysChecking] = useState(false)

  useEffect(() => {
    if (!isActive || values.whatsappDefault !== 'baileys' || !values.id) return

    setBaileysChecking(true)
    getBaileysStatus(values)
      .then((response) => {
        setBaileysConnected(response.data?.connected ?? false)
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
      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='whatsappDefault'>Whatsapp padrão</label>
          <select
            value={values.whatsappDefault}
            className='form-select'
            id='whatsappDefault'
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value=''></option>
            <option value='utalk'>Utalk</option>
            <option value='dialog'>Dialog360</option>
            <option value='ycloud'>YCloud</option>
            <option value='pabbly'>Pabbly</option>
            <option value='baileys'>Baileys</option>
          </select>
        </div>
      </div>

      <fieldset className='pb-4' disabled={values.whatsappDefault === ''}>
        {values.whatsappDefault !== 'baileys' && (
          <>
            <div className='row'>
              <div className='form-group col-5'>
                <label htmlFor='whatsappToken'>Token do whatsapp</label>
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

            <div className='row pb-4'>
              <div className='form-group col-5'>
                <label htmlFor='whatsappUrl'>Url do whatsapp</label>
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
          <div className='row pb-2'>
            <div className='col-3'>
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
                  Usar ID no YCloud ao invés de URL?
                </label>
              </div>
            </div>
          </div>
        )}

        {(values.whatsappDefault === 'dialog' || values.whatsappDefault === 'ycloud') &&
          values.apiToken && (
            <div className='row pb-4'>
              <div className='form-group col-3'>
                <button
                  onClick={async (event) => {
                    event.preventDefault()
                    await setLicenseeWebhook(values)
                  }}
                  className='btn btn-info'
                >
                  Configurar Webhook no provedor
                </button>
              </div>

              <div className='form-group col-2'>
                <button
                  onClick={async (event) => {
                    event.preventDefault()
                    await importLicenseeTemplate(values)
                  }}
                  className='btn btn-info'
                >
                  Importar templates
                </button>
              </div>
            </div>
          )}

        {values.whatsappDefault === 'baileys' && (
          <div className='row mt-3 pb-4'>
            {baileysChecking && (
              <div className='form-group col-12'>
                <span className='text-muted'>Verificando conexão...</span>
              </div>
            )}

            {!baileysChecking && baileysConnected && (
              <div className='form-group col-12 d-flex align-items-center gap-3'>
                <span className='badge bg-success fs-6'>Conectado</span>
                <button
                  onClick={async (event) => {
                    event.preventDefault()
                    setBaileysConnected(null)
                    setBaileysQr(null)
                    setBaileysStatus(null)
                    const response = await getBaileysQr(values)
                    if (response.data?.qr) {
                      setBaileysQr(response.data.qr)
                      setBaileysConnected(false)
                    } else {
                      setBaileysStatus(response.data?.message ?? 'Erro ao gerar QR')
                    }
                  }}
                  className='btn btn-outline-secondary btn-sm'
                >
                  Reconectar
                </button>
              </div>
            )}

            {!baileysChecking && baileysConnected === false && (
              <div className='form-group col-3'>
                <button
                  onClick={async (event) => {
                    event.preventDefault()
                    setBaileysQr(null)
                    setBaileysStatus(null)
                    const response = await getBaileysQr(values)
                    if (response.data?.qr) {
                      setBaileysQr(response.data.qr)
                    } else {
                      setBaileysStatus(response.data?.message ?? 'Erro ao gerar QR')
                    }
                  }}
                  className='btn btn-info'
                >
                  Gerar QR Code
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
                    const response = await getBaileysQr(values)
                    if (response.data?.qr) {
                      setBaileysQr(response.data.qr)
                    } else {
                      setBaileysStatus(response.data?.message ?? 'Erro ao gerar QR')
                    }
                  }}
                  className='btn btn-info'
                >
                  Gerar QR Code
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
      </fieldset>
    </>
  )
}

export default WhatsAppPanel
