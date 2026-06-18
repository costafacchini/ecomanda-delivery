import React from 'react'
import { FieldWithError } from '../../../../../components/form'
import type { ILicenseeFormValues } from '../../../../../types'
import type { FormikErrors, FormikTouched } from 'formik'

interface ChatPanelProps {
  values: ILicenseeFormValues
  errors: FormikErrors<ILicenseeFormValues>
  touched: FormikTouched<ILicenseeFormValues>
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
}

function Required() {
  return <span className='text-danger ms-1' aria-hidden='true'>*</span>
}

const PLATFORM_NAMES: Record<string, string> = {
  crisp: 'Crisp',
  chatwoot: 'Chatwoot',
}

function ChatPanel({ values, errors, touched, handleChange, handleBlur }: ChatPanelProps) {
  const platformName = PLATFORM_NAMES[values.chatDefault] ?? ''

  return (
    <>
      <div className='row mb-3'>
        <div className='form-group col-5'>
          <label htmlFor='chatDefault'>Chat padrão<Required /></label>
          <select
            value={values.chatDefault}
            className='form-select'
            id='chatDefault'
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value=''>Nenhum</option>
            <option value='rocketchat'>Rocketchat</option>
            <option value='crisp'>Crisp</option>
            <option value='cuboup'>CuboUp</option>
            <option value='chatwoot'>Chatwoot</option>
            <option value='local'>Local</option>
          </select>
        </div>
      </div>

      {['rocketchat', 'crisp', 'chatwoot', 'cuboup'].includes(values.chatDefault) && (
        <>
          <div className='row mb-3'>
            <div className='form-group col-8'>
              <label htmlFor='chatUrl'>URL do chat<Required /></label>
              <FieldWithError
                id='chatUrl'
                name='chatUrl'
                type='text'
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.chatUrl}
              />
            </div>
          </div>

          <div className='row mb-3'>
            <div className='col-8'>
              <div className='form-check'>
                <input
                  type='checkbox'
                  className='form-check-input'
                  id='useSenderName'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  checked={values.useSenderName}
                />
                <label className='form-check-label' htmlFor='useSenderName'>
                  Usa o remetente no nome do chat?
                </label>
              </div>
            </div>
          </div>
        </>
      )}

      {['crisp', 'chatwoot'].includes(values.chatDefault) && (
        <>
          <div className='row mb-3'>
            <div className='form-group col-8'>
              <label htmlFor='chatIdentifier'>
                Identifier{platformName && <span className='text-muted fw-normal ms-1 small'>({platformName} Website ID)</span>}
                <Required />
              </label>
              <FieldWithError
                id='chatIdentifier'
                name='chatIdentifier'
                type='text'
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.chatIdentifier}
              />
            </div>
          </div>

          <div className='row mb-3'>
            <div className='form-group col-8'>
              <label htmlFor='chatKey'>
                Key{platformName && <span className='text-muted fw-normal ms-1 small'>({platformName} Token de acesso)</span>}
                <Required />
              </label>
              <FieldWithError
                id='chatKey'
                name='chatKey'
                type='text'
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.chatKey}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default ChatPanel
