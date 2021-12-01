import mountWithRedux, { createStore } from '../../../../.jest/redux-testing'
import LicenseeIndex from './'
import { findByText, fireEvent, screen, waitFor } from '@testing-library/react'
import { getLicensees } from '../../../../services/licensee'
import { fetchLicensees } from './slice'
import { MemoryRouter } from 'react-router'
import { licenseeFactory } from '../../../../factories/licensee'

jest.mock('../../../../services/licensees')

describe('<LicenseeIndex />', () => {
  function mount() {
    const store = createStore()
    mountWithRedux(store)(
      <MemoryRouter>
        <LicenseeIndex />
      </MemoryRouter>)

    return store
  }

  it('filters for all licensees on it is opened and there is no previous applied filters', async () => {
    getLicensees.mockResolvedValue({ status: 201, data: [{ id: '1', name: 'Licenciado' }] })

    mount()

    await waitFor(() => expect(getLicensees).toHaveBeenCalled())

    expect(getLicensees).toHaveBeenCalledWith({
      page: 1,
      expression: '',
    })

    expect(screen.getByText('Licenciado')).toBeInTheDocument()
  })

  it('paginates the licensees', async () => {
    getLicensees.mockResolvedValue({ status: 201, data: licenseeFactory.buildList(30) })

    mount()

    getLicensees.mockResolvedValue({ status: 201, data: [licenseeFactory.build({ name: 'Licensee from new page' })] })

    fireEvent.click(await screen.findByText('Carregar mais'))

    expect(await screen.findByText('Licensee from new page')).toBeInTheDocument()

    expect(getLicensees).toHaveBeenCalledWith({
      page: 2,
      expression: '',
    })
  })

  it('filters the licensees by expression', async () => {
    getLicensees.mockResolvedValue({ status: 201, data: [licenseeFactory.build({ name: 'Licensee' })] })

    mount()

    await screen.findByText('Licensee')

    getLicensees.mockResolvedValue({ status: 201, data: [licenseeFactory.build({ name: 'A licensee filtered by expression' })] })

    fireEvent.change(screen.getByPlaceholderText('Digite a expressão'), { target: { value: 'expression' } })

    fireEvent.click(screen.getByTitle('Filtre pelo licenciado'))

    expect(await screen.findByText('A licensee filtered by expression')).toBeInTheDocument()

    expect(getLicensees).toHaveBeenNthCalledWith(2, {
      page: 1,
      expression: 'expression',
    })
  })
})
