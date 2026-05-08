import { render, screen } from '@testing-library/react'
import SuperLicenseesCard from './SuperLicenseesCard'
import { getDashboardLicensees } from '../../../services/dashboard'

vi.mock('../../../services/dashboard')

describe('<SuperLicenseesCard />', () => {
  it('shows loading state while the request is in flight', () => {
    getDashboardLicensees.mockReturnValue(new Promise(() => {}))

    render(<SuperLicenseesCard />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    getDashboardLicensees.mockRejectedValue(new Error('fail'))

    render(<SuperLicenseesCard />)

    expect(await screen.findByText('Erro ao carregar dados.')).toBeInTheDocument()
  })

  it('renders licensee totals and kind breakdown on success', async () => {
    getDashboardLicensees.mockResolvedValue({
      data: {
        total: 42,
        active: 30,
        by_kind: { demo: 5, free: 10, paid: 27 },
      },
    })

    render(<SuperLicenseesCard />)

    expect(await screen.findByText('42')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('27')).toBeInTheDocument()
    expect(screen.getByText('Licenciados')).toBeInTheDocument()
  })

  it('falls back to 0 when by_kind values are absent', async () => {
    getDashboardLicensees.mockResolvedValue({
      data: { total: 1, active: 1, by_kind: {} },
    })

    render(<SuperLicenseesCard />)

    await screen.findByText('Licenciados')

    const zeroCells = screen.getAllByText('0')
    expect(zeroCells.length).toBeGreaterThanOrEqual(3)
  })
})
