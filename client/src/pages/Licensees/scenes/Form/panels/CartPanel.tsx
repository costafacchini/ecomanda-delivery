import { FieldWithError } from '../../../../../components/form'

function CartPanel({ values, errors, touched, handleChange, handleBlur }) {
  return (
    <fieldset className='pb-4'>
      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='cartDefault'>Plugin para uso de carrinho de compra</label>
          <select
            value={values.cartDefault}
            className='form-select'
            id='cartDefault'
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value=''></option>
            <option value='alloy'>Alloy</option>
            <option value='go2go'>Go2Go</option>
            <option value='go2go_v2'>Go2Go v2</option>
          </select>
        </div>
      </div>

      <div className='row pb-2'>
        <div className='col-3'>
          <div className='form-check'>
            <input
              type='checkbox'
              className='form-check-input'
              id='useCartGallabox'
              onChange={handleChange}
              onBlur={handleBlur}
              checked={values.useCartGallabox}
            />
            <label className='form-check-label' htmlFor='useCartGallabox'>
              Usa gallabox?
            </label>
          </div>
        </div>
      </div>

      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='unidadeId'>Id da loja</label>
          <FieldWithError
            id='unidadeId'
            name='unidadeId'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.unidadeId}
          />
        </div>
      </div>

      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='statusId'>Id do status do carrinho de compra</label>
          <FieldWithError
            id='statusId'
            name='statusId'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.statusId}
          />
        </div>
      </div>

      <div className='row'>
        <div className='form-group col-5'>
          <label htmlFor='productFractionals'>Produtos</label>
          <div className='pb-2'>
            <textarea
              id='productFractionals'
              name='productFractionals'
              className='form-control'
              rows={10}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.productFractionals}
            />
          </div>
        </div>
      </div>
    </fieldset>
  )
}

export default CartPanel
