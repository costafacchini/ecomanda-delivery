import { parseText } from './ParseTriggerText'
import { contact as contactFactory } from '@factories/contact'

const renderText = (text: string, contact: any) => parseText(text, contact)

describe('ParseTriggerText', () => {
  describe('#parseText', () => {
    describe('$contact_name', () => {
      it('replaces by the contact name', () => {
        const contact = contactFactory.build({ name: 'John Doe' })

        const text = renderText('Text that contains $contact_name that should be changed', contact)
        expect(text).toEqual('Text that contains John Doe that should be changed')
      })
    })

    describe('$contact_number', () => {
      it('replaces the contact phone', () => {
        const contact = contactFactory.build({ name: 'John Doe', number: '5511990283745' })

        expect(renderText('Text that contains $contact_number that should be changed', contact)).toEqual(
          'Text that contains 5511990283745 that should be changed',
        )
      })
    })
  })
})
