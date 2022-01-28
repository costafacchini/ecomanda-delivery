import styles from './styles.module.scss'

function concludedDescription(concluded) {
  return concluded ? 'Sim' : 'Não'
}

function formatNumber(value, decimal = 2) {
  return '$' + value.toFixed(decimal).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function productsDescription(products) {
  return products.map((item) => <li key={item.product_retailer_id}><p>{`${item.quantity} - ${item.product_retailer_id} - ${formatNumber(item.unit_price)}`}</p></li>)
}

function CartDescription({ cart }) {
  return (
    <div className={`${styles.cartDescription}`}>
      {cart.products.length > 0 && (
        <ul>
          {productsDescription(cart.products)}
        </ul>
      )}
      <p>{`Taxa Entrega: ${formatNumber(cart.delivery_tax)}`}</p>
      <p>{`Total: ${formatNumber(cart.total)}`}</p>
      <p>{`Concluído: ${concludedDescription(cart.concluded)}`}</p>
      {cart.address && (
        <>
          <p>{`Entrega: ${cart.address}, ${cart.address_number} - ${cart.address_complement}`}</p>
          <p>{`         ${cart.neighborhood} - ${cart.city}/${cart.uf} - ${cart.cep}`}</p>
        </>
      )}
      {cart.note && (<p>{`Obs: ${cart.note}`}</p>)}
    </div>
  )
}

export default CartDescription
