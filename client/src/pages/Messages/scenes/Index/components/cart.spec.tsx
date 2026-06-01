import { render, screen } from '@testing-library/react'
import CartDescription from './cart'

describe('<CartDescription />', () => {
  function mount({ cart }) {
    render(
      <CartDescription cart={cart} />
    )
  }

  it('shows the cart description', () => {
    const cart = {
      delivery_tax: 100.12,
      total: 200.34,
      concluded: true,
      products: [
        {
          quantity: 1,
          unit_price: 20.1,
          product_retailer_id: '107435'
        },
        {
          quantity: 1,
          unit_price: 5.222,
          product_retailer_id: '93546'
        }
      ],
      address: 'Rua Teste',
      address_number: '123',
      address_complement: 'Apto 123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      uf: 'SP',
      cep: '12345-678',
      note: 'Annotation'
    }

    mount({ cart })

    expect(screen.getByText('1 - 107435 - $20.10')).toBeInTheDocument()
    expect(screen.getByText('1 - 93546 - $5.22')).toBeInTheDocument()
    expect(screen.getByText('Taxa Entrega: $100.12')).toBeInTheDocument()
    expect(screen.getByText('Total: $200.34')).toBeInTheDocument()
    expect(screen.getByText('Concluído: Sim')).toBeInTheDocument()
    expect(screen.getByText('Entrega: Rua Teste, 123 - Apto 123')).toBeInTheDocument()
    expect(screen.getByText('Centro - São Paulo/SP - 12345-678')).toBeInTheDocument()
    expect(screen.getByText('Obs: Annotation')).toBeInTheDocument()
  })

  it('shows the cart description without address if address does not filled', () => {
    const cart = {
      delivery_tax: 100.12,
      total: 200.34,
      concluded: true,
      products: [
        {
          quantity: 1,
          unit_price: 20.1,
          product_retailer_id: '107435'
        },
        {
          quantity: 1,
          unit_price: 5.222,
          product_retailer_id: '93546'
        }
      ],
      note: 'Annotation'
    }

    mount({ cart })

    expect(screen.getByText('Taxa Entrega: $100.12')).toBeInTheDocument()
    expect(screen.queryByText('Entrega:')).not.toBeInTheDocument()
  })

  it('shows the cart description without note if note does not filled', () => {
    const cart = {
      delivery_tax: 100.12,
      total: 200.34,
      concluded: true,
      products: [
        {
          quantity: 1,
          unit_price: 20.1,
          product_retailer_id: '107435'
        },
        {
          quantity: 1,
          unit_price: 5.222,
          product_retailer_id: '93546'
        }
      ],
    }

    mount({ cart })

    expect(screen.getByText('Taxa Entrega: $100.12')).toBeInTheDocument()
    expect(screen.queryByText('Obs:')).not.toBeInTheDocument()
  })

  it('shows the cart description without products if products does not filled', () => {
    const cart = {
      delivery_tax: 100.12,
      total: 200.34,
      concluded: true,
      products: [],
    }

    mount({ cart })

    expect(screen.getByText('Taxa Entrega: $100.12')).toBeInTheDocument()
    expect(screen.queryByText('1 - 107435 - $20.10')).not.toBeInTheDocument()
  })
})