import styles from './styles.module.scss'
import type { ICart, ICartProduct } from '../../../../../types'
import { useTranslation } from 'react-i18next'

function formatNumber(value: number, decimal = 2) {
  return '$' + value.toFixed(decimal).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function productsDescription(products: ICartProduct[]) {
  return products.map((item) => (
    <li key={item.product_retailer_id}>
      <p>{`${item.quantity} - ${item.product_retailer_id} - ${formatNumber(item.unit_price)}`}</p>
    </li>
  ))
}

interface CartDescriptionProps {
  cart: ICart
}

function CartDescription({ cart }: CartDescriptionProps) {
  const { t } = useTranslation()

  const concludedLabel = cart.concluded ? t('common.yes') : t('common.no')

  return (
    <div className={`${styles.cartDescription}`}>
      {cart.products.length > 0 && (
        <ul>
          {productsDescription(cart.products)}
        </ul>
      )}
      <p>{`${t('messages.cartDeliveryTax')}: ${formatNumber(cart.delivery_tax)}`}</p>
      <p>{`${t('messages.cartTotal')}: ${formatNumber(cart.total)}`}</p>
      <p>{`${t('messages.cartConcluded')}: ${concludedLabel}`}</p>
      {cart.address && (
        <>
          <p>{`${t('messages.cartDelivery')}: ${cart.address}, ${cart.address_number} - ${cart.address_complement}`}</p>
          <p>{`         ${cart.neighborhood} - ${cart.city}/${cart.uf} - ${cart.cep}`}</p>
        </>
      )}
      {cart.note && (<p>{`${t('messages.cartNote')}: ${cart.note}`}</p>)}
    </div>
  )
}

export default CartDescription
