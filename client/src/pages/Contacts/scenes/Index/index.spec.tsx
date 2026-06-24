import ContactsIndex from './'
import { fireEvent, screen, waitFor, render } from '@testing-library/react'
import { getContacts } from '../../../../services/contact'
import { getLicensees } from '../../../../services/licensee'
import { createRoutesStub } from 'react-router'
import { contactFactory } from '../../../../factories/contact'
import { SimpleCrudContextProvider } from '../../../../contexts/SimpleCrud'
import { AppContext } from '../../../../contexts/App'

vi.mock('../../../../services/contact')
vi.mock('../../../../services/licensee')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<ContactsIndex />', () => {
  const currentUser = { role: 'super' }
  const appContextValue = { activeLicensee: null, updateActiveLicensee: vi.fn() }

  function mount({ currentUser }) {
    const Stub = createRoutesStub([
      {
        path: '/contacts',
        Component: () => (
          <AppContext.Provider value={appContextValue}>
            <ContactsIndex currentUser={currentUser} />
          </AppContext.Provider>
        ),
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

    fireEvent.click(await screen.findByText('common.loadMore'))

    expect(await screen.findByText('Contact from new page')).toBeInTheDocument()

    expect(getContacts).toHaveBeenCalledWith({ page: 2 })
  })

  it('filters the contacts by expression', async () => {
    getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build({ name: 'Contact' })] })

    mount({ currentUser })

    await screen.findByText('Contact')

    getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build({ name: 'A contact filtered by expression' })] })

    fireEvent.change(screen.getByPlaceholderText('contacts.expressionPlaceholder'), { target: { value: 'expression' } })

    fireEvent.click(screen.getByTitle('contacts.filterButtonTitle'))

    expect(await screen.findByText('A contact filtered by expression')).toBeInTheDocument()

    expect(getContacts).toHaveBeenNthCalledWith(2, { page: 1, expression: 'expression' })
  })

  describe('group filter toggle', () => {
    it('renders a "Todos os Contatos" toggle button by default', async () => {
      getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build()] })

      mount({ currentUser })

      expect(await screen.findByRole('button', { name: 'contacts.viewGroups' })).toBeInTheDocument()
    })

    it('sends isGroup=true filter when toggle is clicked', async () => {
      getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build()] })

      mount({ currentUser })

      await screen.findByRole('button', { name: 'contacts.viewGroups' })

      getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build({ name: 'Group Contact' })] })

      fireEvent.click(screen.getByRole('button', { name: 'contacts.viewGroups' }))

      await screen.findByText('Group Contact')

      expect(getContacts).toHaveBeenCalledWith(expect.objectContaining({ isGroup: true, page: 1 }))
    })

    it('switches button label to "Apenas Grupos" after toggle', async () => {
      getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build()] })

      mount({ currentUser })

      await screen.findByRole('button', { name: 'contacts.viewGroups' })

      getContacts.mockResolvedValue({ status: 201, data: [] })

      fireEvent.click(screen.getByRole('button', { name: 'contacts.viewGroups' }))

      expect(await screen.findByRole('button', { name: 'contacts.viewAll' })).toBeInTheDocument()
    })

    it('clears the isGroup filter when toggled again', async () => {
      getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build()] })

      mount({ currentUser })

      await screen.findByRole('button', { name: 'contacts.viewGroups' })

      getContacts.mockResolvedValue({ status: 201, data: [] })
      fireEvent.click(screen.getByRole('button', { name: 'contacts.viewGroups' }))

      await screen.findByRole('button', { name: 'contacts.viewAll' })

      getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build({ name: 'All again' })] })
      fireEvent.click(screen.getByRole('button', { name: 'contacts.viewAll' }))

      await screen.findByText('All again')

      const lastCall = getContacts.mock.calls[getContacts.mock.calls.length - 1][0]
      expect(lastCall.isGroup).toBeUndefined()
    })
  })

  describe('licensee select filter', () => {
    it('does not show the licensee if logged user is not super', async () => {
      getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build({ name: 'Contact' })] })

      const currentUser = { role: 'agent', licensee: { _id: 'licensee-abc' } }

      mount({ currentUser })

      await screen.findByText('contacts.title')

      await screen.findByText('Contact')

      expect(screen.queryByLabelText('contacts.licenseeFilter')).not.toBeInTheDocument()
    })

    it('includes the user licensee in the initial fetch for non-super users', async () => {
      getContacts.mockResolvedValue({ status: 201, data: [contactFactory.build({ name: 'Contact' })] })

      const currentUser = { role: 'agent', licensee: { _id: 'licensee-abc' } }

      mount({ currentUser })

      await screen.findByText('Contact')

      expect(getContacts).toHaveBeenCalledWith(expect.objectContaining({ licensee: 'licensee-abc', page: 1 }))
    })

    it('changes the filters to get the contacts', async () => {
      getLicensees.mockResolvedValueOnce({ status: 201, data: [{ _id: '12345678', name: 'Alcateia' }] })

      getContacts.mockResolvedValueOnce({ status: 201, data: [contactFactory.build({ name: 'Contact' })] })
      getContacts.mockResolvedValueOnce({ status: 201, data: [contactFactory.build({ name: 'Another' })] })

      mount({ currentUser })

      await screen.findByText('contacts.title')

      await screen.findByText('contacts.licenseeFilter')

      fireEvent.change(screen.getByLabelText('contacts.licenseeFilter'), { target: { value: 'alca' } })

      fireEvent.click(await screen.findByText('Alcateia'))

      await screen.findByText('Another')

      expect(getContacts).toHaveBeenCalledWith(expect.objectContaining({ licensee: '12345678' }))
    })
  })
})
