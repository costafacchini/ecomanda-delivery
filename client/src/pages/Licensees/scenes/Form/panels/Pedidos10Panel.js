import { signOrderWebhook } from '../../../../../services/licensee'

function Pedidos10Panel({ values, errors, touched, handleChange, handleBlur, wizardMode = false }) {
  return (
    <fieldset>
      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='pedidos10_integrator'>Software Integrador</label>
          <select
            value={values.pedidos10_integrator}
            className='form-select'
            id='pedidos10_integrator'
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value=''></option>
          </select>
        </div>
      </div>

      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='pedidos10_integration'>Dados da integração</label>
          <div className='pb-2'>
            <textarea
              id='pedidos10_integration'
              name='pedidos10_integration'
              className='form-control'
              rows={10}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.pedidos10_integration}
            />
          </div>
        </div>
      </div>

      {!wizardMode && (
        <div className='row'>
          <div className='form-group col-3'>
            <button
              onClick={async (event) => {
                event.preventDefault()
                await signOrderWebhook(values)
              }}
              className='btn btn-info'
            >
              Assinar Webhook P10
            </button>
          </div>
        </div>
      )}
    </fieldset>
  )
}

export default Pedidos10Panel
