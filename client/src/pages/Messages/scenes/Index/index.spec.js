import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import MessageIndex from './'
import { fireEvent, screen, cleanup } from '@testing-library/react'
import { getMessages } from '../../../../services/message'
import { MemoryRouter } from 'react-router'

jest.mock('../../../../services/message')

describe('<MessageIndex />', () => {
  function mount() {
    const store = createStore()
    mountWithRedux(store)(
      <MemoryRouter>
        <MessageIndex />
      </MemoryRouter>)
  }

  it('renders the messages when the user clicks on the search button', async () => {
    getMessages.mockResolvedValue({ status: 201, data: [{ _id: '1', contact: { name: 'Contact' } }] })

    mount()

    fireEvent.click(screen.getByText('Pesquisar'))

    expect(await screen.findByText('Contact')).toBeInTheDocument()

    expect(getMessages).toHaveBeenCalledWith({
      "contact": "",
      "destination": "",
      "endDate": "",
      "kind": "",
      "licensee": "",
      "onlyErrors": false,
      "startDate": "",
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

  xdescribe('licensee typeahead filter', () => {
    it('changes the filters to get the messages', async () => {
      getMessages.mockResolvedValue({ status: 201, data: [{ _id: '1', contact: { name: 'Contact' } }] })

      mount()

      fireEvent.change(screen.getByLabelText('Licenciado'), { target: { value: 'licensee' } })

      fireEvent.click(screen.getByText('Pesquisar'))

      await screen.findByText('Contact')

      expect(getMessages).toHaveBeenCalledWith(expect.objectContaining({ destination: 'to-chat' }))
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

  xdescribe('location  link', () => {
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
})
