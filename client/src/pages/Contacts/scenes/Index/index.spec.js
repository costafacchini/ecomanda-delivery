import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import ContactsIndex from './'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { getContacts } from '../services/contact'
import { MemoryRouter } from 'react-router'
import { contactFactory } from '../../../../factories/contact'

jest.mock('../services/contact')

describe('<ContactsIndex />', () => {
  function mount() {
    const store = createStore()
    mountWithRedux(store)(
      <MemoryRouter>
        <ContactsIndex />
      </MemoryRouter>)

    return store
  }

  it('filters for all contacts on it is opened and there is no previous applied filters', async () => {
    getContacts.mockResolvedValue({ status: 201, data: [{ id: '1', name: 'Contato' }] })

    mount()

    await waitFor(() => expect(getContacts).toHaveBeenCalled())

    expect(getContacts).toHaveBeenCalledWith({
      page: 1,
      expression: '',
      licensee: '',
    })

    expect(screen.getByText('Contato')).toBeInTheDocument()
  })

  it('paginates the contacts', async () => {
    getContacts.mockResolvedValue({ status: 201, data: contactFactory.buildList(30) })

    mount()

    getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build({ name: 'Contact from new page' })] })

    fireEvent.click(await screen.findByText('Carregar mais'))

    expect(await screen.findByText('Contact from new page')).toBeInTheDocument()

    expect(getContacts).toHaveBeenCalledWith({
      page: 2,
      expression: '',
      licensee: '',
    })
  })

  it('filters the contacts by expression', async () => {
    getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build({ name: 'Contact' })] })

    mount()

    await screen.findByText('Contact')

    getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build({ name: 'A contact filtered by expression' })] })

    fireEvent.change(screen.getByPlaceholderText('Digite a expressão'), { target: { value: 'expression' } })

    fireEvent.click(screen.getByTitle('Filtre pelo contato'))

    expect(await screen.findByText('A contact filtered by expression')).toBeInTheDocument()

    expect(getContacts).toHaveBeenNthCalledWith(2, {
      page: 1,
      expression: 'expression',
      licensee: '',
    })
  })

  // Testar a alteração do licenciado pelo componente da tela
})
