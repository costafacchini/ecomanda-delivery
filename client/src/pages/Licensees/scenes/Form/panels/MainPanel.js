import { FieldWithError } from '../../../../../components/form'

function MainPanel({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  currentUser,
  useChat, setUseChat,
  useWhatsapp, setUseWhatsapp,
  useCart, setUseCart,
  usePagarMe, setUsePagarMe,
  setFieldValue,
}) {
  return (
    <>
      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='name'>Nome</label>
          <FieldWithError
            id='name'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.name}
            name='name'
          />
        </div>
        <div className='form-group col-5'>
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

      <div className='row'>
        <div className='form-group col-2'>
          <label htmlFor='kind'>Tipo</label>
          <select
            value={values.kind}
            className='form-select'
            id='kind'
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value=''></option>
            <option value='company'>Jurídica</option>
            <option value='individual'>Física</option>
          </select>
        </div>

        <div className='form-group col-3'>
          <label htmlFor='document'>Documento</label>
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

      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='email'>E-email</label>
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

      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='licenseKind'>Licença</label>
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

      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='phone'>Telefone</label>
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

      <div className='row pb-4'>
        <div className='form-group col-5'>
          <label htmlFor='apiToken'>API token</label>
          <FieldWithError
            disabled
            id='apiToken'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.apiToken}
            name='apiToken'
          />
        </div>
      </div>

      <div className='row pb-2'>
        <div className='col-3'>
          <div className='form-check'>
            <input
              type='checkbox'
              className='form-check-input'
              id='questionUseChat'
              checked={useChat}
              onChange={(e) => {
                setUseChat(e.target.checked)
                if (!e.target.checked) {
                  setFieldValue('chatDefault', '')
                }
              }}
            />
            <label className='form-check-label' htmlFor='questionUseChat'>
              Integração com Plataforma de Chat?
            </label>
          </div>
        </div>
      </div>

      <div className='row pb-2'>
        <div className='col-3'>
          <div className='form-check'>
            <input
              type='checkbox'
              className='form-check-input'
              id='useChatbot'
              onChange={handleChange}
              onBlur={handleBlur}
              checked={values.useChatbot}
            />
            <label className='form-check-label' htmlFor='useChatbot'>
              Integração com Plataforma de ChatBot?
            </label>
          </div>
        </div>
      </div>

      <div className='row pb-2'>
        <div className='col-3'>
          <div className='form-check'>
            <input
              type='checkbox'
              className='form-check-input'
              id='questionUseWhatsapp'
              checked={useWhatsapp}
              onChange={(e) => {
                setUseWhatsapp(e.target.checked)
                if (!e.target.checked) {
                  setFieldValue('whatsappDefault', '')
                }
              }}
            />
            <label className='form-check-label' htmlFor='questionUseWhatsapp'>
              Integração com Plataforma de WhatsApp?
            </label>
          </div>
        </div>
      </div>

      <div className='row pb-2'>
        <div className='col-3'>
          <div className='form-check'>
            <input
              type='checkbox'
              className='form-check-input'
              id='questionUseCart'
              checked={useCart}
              onChange={(e) => {
                setUseCart(e.target.checked)
                if (!e.target.checked) {
                  setFieldValue('cartDefault', '')
                }
              }}
            />
            <label className='form-check-label' htmlFor='questionUseCart'>
              Integração com Carrinho de Compras?
            </label>
          </div>
        </div>
      </div>

      <div className='row pb-2'>
        <div className='col-3'>
          <div className='form-check'>
            <input
              type='checkbox'
              className='form-check-input'
              id='questionUsePagarMe'
              checked={usePagarMe}
              onChange={(e) => {
                setUsePagarMe(e.target.checked)
              }}
            />
            <label className='form-check-label' htmlFor='questionUsePagarMe'>
              Integração com PagarMe?
            </label>
          </div>
        </div>
      </div>

      {currentUser && currentUser.isPedidos10 && (
        <div className='row pb-2'>
          <div className='col-3'>
            <div className='form-check'>
              <input
                type='checkbox'
                className='form-check-input'
                id='questionUsePedidos10'
                checked={currentUser.isPedidos10}
                readOnly
                disabled
              />
              <label className='form-check-label' htmlFor='questionUsePedidos10'>
                Integração com Pedidos10?
              </label>
            </div>
          </div>
        </div>
      )}

      <fieldset>
        <div className='row'>
          <div className='form-group col-5'>
            <label htmlFor='urlChatWebhook'>URL para webhook de Chat</label>
            <FieldWithError
              disabled
              id='urlChatWebhook'
              type='text'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.urlChatWebhook}
              name='urlChatWebhook'
            />
          </div>
        </div>

        <div className='row'>
          <div className='form-group col-5'>
            <label htmlFor='urlChatbotWebhook'>URL para webhook de Chatbot</label>
            <FieldWithError
              disabled
              id='urlChatbotWebhook'
              type='text'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.urlChatbotWebhook}
              name='urlChatbotWebhook'
            />
          </div>
        </div>

        <div className='row'>
          <div className='form-group col-5'>
            <label htmlFor='urlChatbotTransfer'>URL de webhook para transferir do Chatbot para o Chat</label>
            <FieldWithError
              disabled
              id='urlChatbotTransfer'
              type='text'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.urlChatbotTransfer}
              name='urlChatbotTransfer'
            />
          </div>
        </div>

        <div className='row'>
          <div className='form-group col-5'>
            <label htmlFor='urlWhatsappWebhook'>URL para webhook de whatsapp</label>
            <FieldWithError
              disabled
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
    </>
  )
}

export default MainPanel
