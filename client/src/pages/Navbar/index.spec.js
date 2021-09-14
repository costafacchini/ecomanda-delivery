import { render, screen } from '@testing-library/react'
import Navbar from './index'

describe('<Navbar>', () => {
  it('renders the navbar options', () => {
    render(<Navbar />)

    const dashboard = screen.getByText(/Dashboard/i)

    expect(dashboard).toBeInTheDocument()
  })
})