function ConcludedDescription(concluded) {
  return concluded ? 'Sim' : 'Não'
}

function ProductsDescription(products) {
  return products.map((item) => <p>{`${item.quantity} - ${item.product_retailer_id} - ${item.unit_price}`}</p>)
}

function CartDescription({ cart }) {
  return (
    <>
      <p>🛒 Seu carrinho:</p>
      {ProductsDescription(cart.products)}
      <p>{`Taxa Entrega: ${cart.delivery_tax}`}</p>
      <p>{`Total: ${cart.total}`}</p>
      <p>{`Concluído: ${ConcludedDescription(cart.concluded)}`}</p>
      {cart.address && (
        <>
          <p>{`Entrega: ${cart.address}, ${cart.address_number} - ${cart.address_complement}`}</p>
          <p>{`         ${cart.neighborhood} - ${cart.city}/${cart.uf} - ${cart.cep}`}</p>
        </>
      )}
      {cart.note && (<p>{`Obs: ${cart.note}`}</p>)}
    </>
  )
}

export default CartDescription
