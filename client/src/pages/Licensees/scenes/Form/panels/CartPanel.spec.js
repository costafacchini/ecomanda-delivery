import { render, screen } from '@testing-library/react'
import { Formik } from 'formik'
import CartPanel from './CartPanel'

const noop = () => {}

const defaultValues = {
  cartDefault: '',
  useCartGallabox: false,
  unidadeId: '',
  statusId: '',
  productFractionals: '',
}

function mount(overrides = {}) {
  const values = { ...defaultValues, ...overrides }
  render(
    <Formik initialValues={values} onSubmit={noop}>
      <CartPanel
        values={values}
        errors={{}}
        touched={{}}
        handleChange={noop}
        handleBlur={noop}
      />
    </Formik>
  )
}

describe('<CartPanel />', () => {
  it('renders cartDefault select, useCartGallabox checkbox, unidadeId input, statusId input, productFractionals textarea', () => {
    mount()

    expect(screen.getByLabelText('Plugin para uso de carrinho de compra')).toBeInTheDocument()
    expect(screen.getByLabelText('Usa gallabox?')).toBeInTheDocument()
    expect(screen.getByLabelText('Id da loja')).toBeInTheDocument()
    expect(screen.getByLabelText('Id do status do carrinho de compra')).toBeInTheDocument()
    expect(screen.getByLabelText('Produtos')).toBeInTheDocument()
  })
})
