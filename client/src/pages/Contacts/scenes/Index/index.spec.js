import ContactsIndex from './'
import { fireEvent, screen, waitFor, render } from '@testing-library/react'
import { getContacts } from '../../../../services/contact'
import { getLicensees } from '../../../../services/licensee'
import { createRoutesStub } from 'react-router'
import { contactFactory } from '../../../../factories/contact'
import { SimpleCrudContextProvider } from '../../../../contexts/SimpleCrud'

jest.mock('../../../../services/contact')
jest.mock('../../../../services/licensee')

describe('<ContactsIndex />', () => {
  const currentUser = { isSuper: true }

  function mount({ currentUser }) {
    const Stub = createRoutesStub([
      {
        path: '/contacts',
        Component: () => <ContactsIndex currentUser={currentUser} />,
      },
    ])
    render(
      <SimpleCrudContextProvider>
        <Stub initialEntries={['/contacts']} />
      </SimpleCrudContextProvider>
    )
  }

  it('filters for all contacts on it is opened and there is no previous applied filters', async () => {
    getContacts.mockResolvedValue({ status: 201, data: [{ id: '1', name: 'Contato' }] })

    mount({ currentUser })

    await waitFor(() => expect(getContacts).toHaveBeenCalled())

    expect(getContacts).toHaveBeenCalledWith({ page: 1 })

    expect(await screen.findByText('Contato')).toBeInTheDocument()
  })

  it('paginates the contacts', async () => {
    getContacts.mockResolvedValue({ status: 201, data: contactFactory.buildList(30) })

    mount({ currentUser })

    getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build({ name: 'Contact from new page' })] })

    fireEvent.click(await screen.findByText('Carregar mais'))

    expect(await screen.findByText('Contact from new page')).toBeInTheDocument()

    expect(getContacts).toHaveBeenCalledWith({ page: 2 })
  })

  it('filters the contacts by expression', async () => {
    getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build({ name: 'Contact' })] })

    mount({ currentUser })

    await screen.findByText('Contact')

    getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build({ name: 'A contact filtered by expression' })] })

    fireEvent.change(screen.getByPlaceholderText('Digite a expressão'), { target: { value: 'expression' } })

    fireEvent.click(screen.getByTitle('Filtre pelo contato'))

    expect(await screen.findByText('A contact filtered by expression')).toBeInTheDocument()

    expect(getContacts).toHaveBeenNthCalledWith(2, { page: 1, expression: 'expression' })
  })

  describe('licensee select filter', () => {
    it('does not show the licensee if logged user is not super', async () => {
      getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build({ name: 'Contact' })] })

      const currentUser = { isSuper: false }

      mount({ currentUser })

      await screen.findByText('Contatos')

      await screen.findByText('Contact')

      expect(screen.queryByLabelText('Licenciado')).not.toBeInTheDocument()
    })

    it('changes the filters to get the contacts', async () => {
      getLicensees.mockResolvedValueOnce({ status: 201, data: [{ _id: '12345678', name: 'Alcateia' }] })

      getContacts.mockResolvedValueOnce({ status: 201, data: [contactFactory.build({ name: 'Contact' })] })
      getContacts.mockResolvedValueOnce({ status: 201, data: [contactFactory.build({ name: 'Another' })] })

      mount({ currentUser })

      await screen.findByText('Contatos')

      await screen.findByText('Licenciado')

      fireEvent.change(screen.getByLabelText('Licenciado'), { target: { value: 'alca' } })

      fireEvent.click(await screen.findByText('Alcateia'))

      await screen.findByText('Another')

      expect(getContacts).toHaveBeenCalledWith(expect.objectContaining({ licensee: '12345678' }))
    })
  })
})
