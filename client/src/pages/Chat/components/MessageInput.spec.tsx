import { render, screen, fireEvent } from '@testing-library/react'
import MessageInput from './MessageInput'

describe('<MessageInput>', () => {
  it('calls onSend with input value on button click', () => {
    const handleSend = vi.fn()
    render(<MessageInput onSend={handleSend} />)

    fireEvent.change(screen.getByPlaceholderText(/digite uma mensagem/i), { target: { value: 'Olá!' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    expect(handleSend).toHaveBeenCalledWith('Olá!')
  })

  it('clears input after send', () => {
    render(<MessageInput onSend={vi.fn()} />)

    const input = screen.getByPlaceholderText(/digite uma mensagem/i)
    fireEvent.change(input, { target: { value: 'Mensagem' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    expect(input).toHaveValue('')
  })

  it('does NOT call onSend on empty input', () => {
    const handleSend = vi.fn()
    render(<MessageInput onSend={handleSend} />)

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    expect(handleSend).not.toHaveBeenCalled()
  })

  it('input and button are disabled when disabled=true', () => {
    render(<MessageInput onSend={vi.fn()} disabled />)

    expect(screen.getByPlaceholderText(/digite uma mensagem/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /enviar/i })).toBeDisabled()
  })
})
