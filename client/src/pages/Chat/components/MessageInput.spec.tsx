import { render, screen, fireEvent } from '@testing-library/react'
import MessageInput from './MessageInput'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'pt', changeLanguage: vi.fn() },
  }),
}))

describe('<MessageInput>', () => {
  it('calls onSend with input value on button click', () => {
    const handleSend = vi.fn()
    render(<MessageInput onSend={handleSend} />)

    fireEvent.change(screen.getByPlaceholderText('chat.messagePlaceholder'), { target: { value: 'Olá!' } })
    fireEvent.click(screen.getByRole('button', { name: 'chat.sendAriaLabel' }))

    expect(handleSend).toHaveBeenCalledWith('Olá!')
  })

  it('clears input after send', () => {
    render(<MessageInput onSend={vi.fn()} />)

    const input = screen.getByPlaceholderText('chat.messagePlaceholder')
    fireEvent.change(input, { target: { value: 'Mensagem' } })
    fireEvent.click(screen.getByRole('button', { name: 'chat.sendAriaLabel' }))

    expect(input).toHaveValue('')
  })

  it('does NOT call onSend on empty input', () => {
    const handleSend = vi.fn()
    render(<MessageInput onSend={handleSend} />)

    fireEvent.click(screen.getByRole('button', { name: 'chat.sendAriaLabel' }))

    expect(handleSend).not.toHaveBeenCalled()
  })

  it('input and button are disabled when disabled=true', () => {
    render(<MessageInput onSend={vi.fn()} disabled />)

    expect(screen.getByPlaceholderText('chat.messagePlaceholder')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'chat.sendAriaLabel' })).toBeDisabled()
  })
})
