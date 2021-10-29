import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import LicenseeTypeahead from ".";
import { getLicensees } from '../../services/licensees'

jest.mock('../../services/licensees')


describe('<LicenseeTypeahead />', () => {
  function mount(props = {}) {
    render(<LicenseeTypeahead {...props} />)
  }

  it('renders the licencees options', async () => {
    getLicensees.mockResolvedValue({ status: 201, data: [{ id: '1', name: 'Licenciado' }] })

    mount()

    expect(screen.getByRole('option', { name: 'Nenhum selecionado' })).toBeInTheDocument()
    expect(await screen.findByRole('option', { name: 'Licenciado' })).toHaveValue('1')
  })

  it('receives other props', async () => {
    getLicensees.mockResolvedValue({ status: 201, data: [{ id: '1', name: 'Licenciado' }] })
    const onChange = jest.fn()
    mount({ onChange })

    await screen.findByRole('option', { name: 'Licenciado' })

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })

    expect(onChange).toHaveBeenCalled()
  })

  it('receives a value', async () => {
    getLicensees.mockResolvedValue({ status: 201, data: [{ id: '1', name: 'Licenciado' }] })
    mount({ value: '1', onChange: jest.fn() })

    await screen.findByRole('option', { name: 'Licenciado' })

    expect(screen.getByRole('combobox')).toHaveValue('1')

    cleanup()

    getLicensees.mockResolvedValue({ status: 201, data: [{ id: '1', name: 'Licenciado' }] })
    mount({ value: '', onChange: jest.fn() })

    await screen.findByRole('option', { name: 'Licenciado' })

    expect(screen.getByRole('combobox')).toHaveValue('')
  })
})
