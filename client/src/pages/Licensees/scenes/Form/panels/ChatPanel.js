import { FieldWithError } from '../../../../../components/form'

function ChatPanel({ values, errors, touched, handleChange, handleBlur }) {
  return (
    <>
      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='chatDefault'>Chat padrão</label>
          <select
            value={values.chatDefault}
            className='form-select'
            id='chatDefault'
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value=''></option>
            <option value='rocketchat'>Rocketchat</option>
            <option value='crisp'>Crisp</option>
            <option value='cuboup'>CuboUp</option>
            <option value='chatwoot'>Chatwoot</option>
          </select>
        </div>
      </div>

      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='chatUrl'>Url do chat</label>
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

      <div className='row pb-2'>
        <div className='col-3'>
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

      {['crisp', 'chatwoot'].includes(values.chatDefault) && (
        <>
          <div className='row'>
            <div className='form-group col-5'>
              <label htmlFor='chatIdentifier'>Identifier</label>
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

          <div className='row'>
            <div className='form-group col-5'>
              <label htmlFor='chatKey'>Key</label>
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
