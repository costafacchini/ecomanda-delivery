import { FieldWithError } from '../../../../../components/form'
import { sendLicenseePagarMe } from '../../../../../services/licensee'

function PagarMePanel({ values, errors, touched, handleChange, handleBlur, wizardMode = false }: any) {
  return (
    <fieldset className='pb-4'>
      <div className='row'>
        <div className='form-group col-1'>
          <label htmlFor='financial_player_fee'>% Taxa</label>
          <FieldWithError
            id='financial_player_fee'
            name='financial_player_fee'
            type='number'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.financial_player_fee}
          />
        </div>
      </div>

      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='holder_name'>Nome do titular da conta</label>
          <FieldWithError
            id='holder_name'
            name='holder_name'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.holder_name}
          />
        </div>
      </div>

      <div className='row'>
        <div className='form-group col-2'>
          <label htmlFor='holder_kind'>Tipo titular da conta</label>
          <select
            value={values.holder_kind}
            className='form-select'
            id='holder_kind'
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value=''></option>
            <option value='company'>Jurídica</option>
            <option value='individual'>Física</option>
          </select>
        </div>

        <div className='form-group col-3'>
          <label htmlFor='holder_document'>Documento titular da conta</label>
          <FieldWithError
            id='holder_document'
            name='holder_document'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.holder_document}
          />
        </div>
      </div>

      <div className='row'>
        <div className='form-group col-1'>
          <label htmlFor='bank'>Banco</label>
          <FieldWithError
            id='bank'
            name='bank'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.bank}
          />
        </div>

        <div className='form-group col-1'>
          <label htmlFor='branch_number'>AG</label>
          <FieldWithError
            id='branch_number'
            name='branch_number'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.branch_number}
          />
        </div>

        <div className='form-group col-1'>
          <label htmlFor='branch_check_digit'>DG</label>
          <FieldWithError
            id='branch_check_digit'
            name='branch_check_digit'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.branch_check_digit}
          />
        </div>

        <div className='form-group col-1'>
          <label htmlFor='account_number'>Conta</label>
          <FieldWithError
            id='account_number'
            name='account_number'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.account_number}
          />
        </div>

        <div className='form-group col-1'>
          <label htmlFor='account_check_digit'>DG</label>
          <FieldWithError
            id='account_check_digit'
            name='account_check_digit'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.account_check_digit}
          />
        </div>
      </div>

      <div className='row pb-4'>
        <div className='form-group col-2'>
          <label htmlFor='account_type'>Tipo da conta</label>
          <select
            value={values.account_type}
            className='form-select'
            id='account_type'
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value=''></option>
            <option value='checking'>Corrente</option>
            <option value='savings'>Poupança</option>
          </select>
        </div>
      </div>

      {!wizardMode && (
        <div className='row'>
          <div className='form-group col-3'>
            <button
              onClick={async (event) => {
                event.preventDefault()
                await sendLicenseePagarMe(values)
              }}
              className='btn btn-info'
            >
              Integrar com a Pagar.Me
            </button>
          </div>
        </div>
      )}
    </fieldset>
  )
}

export default PagarMePanel
