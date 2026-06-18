import React from 'react'
import { FieldWithError } from '../../../../../components/form'
import type { ILicenseeFormValues } from '../../../../../types'
import type { FormikErrors, FormikTouched } from 'formik'

interface ChatbotPanelProps {
  values: ILicenseeFormValues
  errors: FormikErrors<ILicenseeFormValues>
  touched: FormikTouched<ILicenseeFormValues>
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
}

function ChatbotPanel({ values, errors, touched, handleChange, handleBlur }: ChatbotPanelProps) {
  return (
    <>
      <div className='row mb-3'>
        <div className='form-group col-8'>
          <label htmlFor='chatbotDefault'>Chatbot padrão</label>
          <select
            value={values.chatbotDefault}
            className='form-select'
            id='chatbotDefault'
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value=''>Nenhum</option>
            <option value='landbot'>Landbot</option>
          </select>
        </div>
      </div>

      {values.chatbotDefault !== '' && <>
      <div className='row mb-3'>
        <div className='form-group col-8'>
          <label htmlFor='chatbotUrl'>URL do chatbot</label>
          <FieldWithError
            id='chatbotUrl'
            name='chatbotUrl'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.chatbotUrl}
          />
        </div>
      </div>

      <div className='row mb-3'>
        <div className='form-group col-8'>
          <label htmlFor='chatbotAuthorizationToken'>Token do chatbot</label>
          <FieldWithError
            id='chatbotAuthorizationToken'
            name='chatbotAuthorizationToken'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.chatbotAuthorizationToken}
          />
        </div>
      </div>

      <div className='row mb-3'>
        <div className='form-group col-8'>
          <label htmlFor='chatbotApiToken'>Token de acesso via API do chatbot</label>
          <FieldWithError
            id='chatbotApiToken'
            name='chatbotApiToken'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.chatbotApiToken}
          />
        </div>
      </div>

      <div className='row mb-3'>
        <div className='form-group col-8'>
          <label htmlFor='messageOnResetChatbot'>Mensagem de encerramento de chatbot abandonado</label>
          <textarea
            className='form-control'
            rows={4}
            id='messageOnResetChatbot'
            name='messageOnResetChatbot'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.messageOnResetChatbot}
          />
        </div>
      </div>

      <div className='row mb-3'>
        <div className='form-group col-8'>
          <label htmlFor='messageOnCloseChat'>Mensagem de encerramento de chat</label>
          <textarea
            className='form-control'
            rows={4}
            id='messageOnCloseChat'
            name='messageOnCloseChat'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.messageOnCloseChat}
          />
        </div>
      </div>
      </>}
    </>
  )
}

export default ChatbotPanel
