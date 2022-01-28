import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import MessageIndex from './'
import { fireEvent, screen, cleanup } from '@testing-library/react'
import { getMessages } from '../../../../services/message'
import { MemoryRouter } from 'react-router'
import { getLicensees } from '../../../../services/licensee'
import { getContacts } from '../../../../services/contact'
import { messageFactory } from '../../../../factories/message'

jest.mock('../../../../services/message')
jest.mock('../../../../services/licensee')
jest.mock('../../../../services/contact')

describe('<MessageIndex />', () => {
  function mount() {
    const loggedUser = {
      isSuper: true
    }

    const store = createStore()
    mountWithRedux(store)(
      <MemoryRouter>
        <MessageIndex loggedUser={loggedUser} />
      </MemoryRouter>)
  }

  it('renders the messages when the user clicks on the search button', async () => {
    getMessages.mockResolvedValue(
      {
        status: 201,
        data: [
          {
            _id: '1',
            contact: {
              name: 'Contact',
            },
            kind: 'text',
            text: 'First message',
            destination: 'to-chat',
            departament: 'departament',
            sended: true,
          }
        ]
      }
    )

    mount()

    fireEvent.click(screen.getByText('Pesquisar'))

    expect(await screen.findByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('First message')).toBeInTheDocument()
    expect(screen.getByText('text')).toBeInTheDocument()
    expect(screen.getByText('to-chat')).toBeInTheDocument()
    expect(screen.getByText('departament')).toBeInTheDocument()
    expect(screen.getByText('Sim')).toBeInTheDocument()

    expect(getMessages).toHaveBeenCalledWith({
      "contact": "",
      "destination": "",
      "endDate": "",
      "kind": "",
      "licensee": "",
      "onlyErrors": false,
      "startDate": "",
      "page": 1,
    })
  })

  describe('pagination', () => {
    it('paginates the messages', async () => {
      getMessages.mockResolvedValue({ status: 201, data: messageFactory.buildList(30) })

      mount()

      fireEvent.click(screen.getByText('Pesquisar'))
      expect(await screen.findByText('Carregar mais')).toBeInTheDocument()

      getMessages.mockResolvedValue({ status: 201, data: [messageFactory.build({ text: 'Message from new page' })] })
      fireEvent.click(await screen.findByText('Carregar mais'))

      expect(await screen.findByText('Message from new page')).toBeInTheDocument()

      expect(getMessages).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }))
    })
  })

  describe('startDate filter', () => {
    it('changes the filters to get the messages', async () => {
      getMessages.mockResolvedValue({ status: 201, data: [{ _id: '1', contact: { name: 'Contact' } }] })

      mount()

      fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2012-12-12' } })

      fireEvent.click(screen.getByText('Pesquisar'))

      await screen.findByText('Contact')

      expect(getMessages).toHaveBeenCalledWith(expect.objectContaining({ startDate: '2012-12-12' }))

    })
  })

  describe('endDate filter', () => {
    it('changes the filters to get the messages', async () => {
      getMessages.mockResolvedValue({ status: 201, data: [{ _id: '1', contact: { name: 'Contact' } }] })

      mount()

      fireEvent.change(screen.getByLabelText('Data final'), { target: { value: '2012-12-12' } })

      fireEvent.click(screen.getByText('Pesquisar'))

      await screen.findByText('Contact')

      expect(getMessages).toHaveBeenCalledWith(expect.objectContaining({ endDate: '2012-12-12' }))

    })
  })

  describe('kind filter', () => {
    it('changes the filters to get the messages', async () => {
      getMessages.mockResolvedValue({ status: 201, data: [{ _id: '1', contact: { name: 'Contact' } }] })

      mount()

      fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'text' } })

      fireEvent.click(screen.getByText('Pesquisar'))

      await screen.findByText('Contact')

      expect(getMessages).toHaveBeenCalledWith(expect.objectContaining({ kind: 'text' }))
    })
  })

  describe('destination filter', () => {
    it('changes the filters to get the messages', async () => {
      getMessages.mockResolvedValue({ status: 201, data: [{ _id: '1', contact: { name: 'Contact' } }] })

      mount()

      fireEvent.change(screen.getByLabelText('Destino'), { target: { value: 'to-chat' } })

      fireEvent.click(screen.getByText('Pesquisar'))

      await screen.findByText('Contact')

      expect(getMessages).toHaveBeenCalledWith(expect.objectContaining({ destination: 'to-chat' }))
    })
  })

  describe('licensee select filter', () => {
    it('does not show the licensee if logged user is not super', async () => {
      const loggedUser = {
        isSuper: false
      }

      const store = createStore()
      mountWithRedux(store)(
        <MemoryRouter>
          <MessageIndex loggedUser={loggedUser} />
        </MemoryRouter>)

      expect(screen.getByLabelText('Contato')).toBeInTheDocument()
      expect(screen.queryByLabelText('Licenciado')).not.toBeInTheDocument()
    })

    it('changes the filters to get the messages', async () => {
      getLicensees.mockResolvedValueOnce({ status: 201, data: [{ _id: '12345678', name: 'Alcateia' }] })

      getMessages.mockResolvedValueOnce({ status: 201, data: [{ _id: '1', contact: { name: 'Contact' } }] })

      mount()

      fireEvent.change(screen.getByLabelText('Licenciado'), { target: { value: 'alca' } })

      fireEvent.click(await screen.findByText('Alcateia'))

      fireEvent.click(screen.getByText('Pesquisar'))

      await screen.findByText('Contact')

      expect(getMessages).toHaveBeenCalledWith(expect.objectContaining({ licensee: '12345678' }))
    })
  })

  describe('contact select filter', () => {
    it('changes the filters to get the messages', async () => {
      getContacts.mockResolvedValueOnce({ status: 201, data: [{ _id: '9876543', name: 'John Doe', number: '12345' }] })

      getMessages.mockResolvedValueOnce({ status: 201, data: [{ _id: '1', contact: { name: 'John Doe' } }] })

      mount()

      fireEvent.change(screen.getByLabelText('Contato'), { target: { value: 'john' } })

      fireEvent.click(await screen.findByText('John Doe | 12345'))

      fireEvent.click(screen.getByText('Pesquisar'))

      await screen.findByText('John Doe')

      expect(getMessages).toHaveBeenCalledWith(expect.objectContaining({ contact: '9876543' }))
    })
  })

  describe('Error details', () => {
    it('is rendered when theres an error', async () => {
      getMessages.mockResolvedValueOnce(
        {
          status: 201,
          data: [
            {
              _id: '1',
              contact: {
                name: 'Contact',
              },
              error: 'This is an error',
            }
          ]
        }
      )

      mount()

      fireEvent.click(screen.getByText('Pesquisar'))

      const error = await screen.findByText('This is an error')

      expect(error).toBeInTheDocument()

      cleanup()

      getMessages.mockResolvedValueOnce(
        {
          status: 201,
          data: [
            {
              _id: '1',
              contact: {
                name: 'Contact',
              },
            }
          ]
        }
      )

      mount()

      fireEvent.click(screen.getByText('Pesquisar'))

      await screen.findByText('Contact')

      expect(screen.queryByText('This is an error')).not.toBeInTheDocument()

    })
  })

  describe('file download link', () => {
    it('is rendered when theres a file with name and link', async () => {
      getMessages.mockResolvedValueOnce(
        {
          status: 201,
          data: [
            {
              _id: '1',
              contact: {
                name: 'Contact',
              },
              fileName: 'File name',
              url: 'google.com'
            }
          ]
        }
      )

      mount()

      fireEvent.click(screen.getByText('Pesquisar'))

      const link = await screen.findByText('File name')

      expect(link).toHaveAttribute('href', 'google.com')

      cleanup()

      getMessages.mockResolvedValueOnce(
        {
          status: 201,
          data: [
            {
              _id: '1',
              contact: {
                name: 'Contact',
              },
            }
          ]
        }
      )

      mount()

      fireEvent.click(screen.getByText('Pesquisar'))

      await screen.findByText('Contact')

      expect(screen.queryByText('File name')).not.toBeInTheDocument()
    })
  })

  describe('location link', () => {
    it('is rendered when theres a cordinate', async () => {
      getMessages.mockResolvedValueOnce(
        {
          status: 201,
          data: [
            {
              _id: '1',
              contact: {
                name: 'Contact',
              },
              kind: 'location',
              text: '-25.5617048;-49.3086837',
            }
          ]
        }
      )

      mount()

      fireEvent.click(screen.getByText('Pesquisar'))

      expect(await screen.findByText('(-25.5617048;-49.3086837)')).toBeInTheDocument()

      const link = screen.getByRole('link')

      expect(link).toHaveAttribute('href', 'http://maps.google.com/maps?q=-25.5617048,-49.3086837&ll=-25.5617048,-49.3086837&z=17')
    })
  })

  describe('interactive link', () => {
    it('is rendered when theres a trigger', async () => {
      getMessages.mockResolvedValueOnce(
        {
          status: 201,
          data: [
            {
              _id: '1',
              contact: {
                name: 'Contact',
              },
              kind: 'interactive',
              trigger: {
                _id: '123235',
                name: 'Trigger',
              },
            }
          ]
        }
      )

      mount()

      fireEvent.click(screen.getByText('Pesquisar'))

      expect(await screen.findByText('interactive')).toBeInTheDocument()

      const link = screen.getByText('Trigger')

      expect(link).toHaveAttribute('href', '#/triggers/123235')
    })
  })

  describe('cart description', () => {
    it('is rendered when theres a cart', async () => {
      getMessages.mockResolvedValueOnce(
        {
          status: 201,
          data: [
            {
              _id: '1',
              contact: {
                name: 'Contact',
              },
              kind: 'interactive',
              trigger: {
                _id: '123235',
                name: 'Trigger',
              },
            }
          ]
        }
      )

      mount()

      fireEvent.click(screen.getByText('Pesquisar'))

      expect(await screen.findByText('interactive')).toBeInTheDocument()

      const link = screen.getByText('Trigger')

      expect(link).toHaveAttribute('href', '#/triggers/123235')
    })
  })
})
