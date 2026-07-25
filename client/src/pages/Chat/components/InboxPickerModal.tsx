import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { IInbox } from '../../../types/inbox'

interface InboxPickerModalProps {
  inboxes: IInbox[]
  onSelect: (inbox: IInbox) => void
  onDismiss: () => void
}

export default function InboxPickerModal({ inboxes, onSelect, onDismiss }: InboxPickerModalProps) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<IInbox | null>(null)

  function handleConfirm() {
    if (selected) onSelect(selected)
  }

  return (
    <div
      className='modal fade show d-block'
      tabIndex={-1}
      role='dialog'
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onDismiss() }}
    >
      <div className='modal-dialog' role='document'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>{t('chat.selectInbox')}</h5>
            <button type='button' className='btn-close' onClick={onDismiss} aria-label={t('chat.closeModalAriaLabel')} />
          </div>
          <div className='modal-body'>
            <p className='text-muted'>{t('chat.selectInboxDescription')}</p>
            <div className='list-group'>
              {inboxes.map(inbox => (
                <button
                  key={inbox._id}
                  type='button'
                  className={`list-group-item list-group-item-action${selected?._id === inbox._id ? ' active' : ''}`}
                  onClick={() => setSelected(inbox)}
                >
                  {inbox.name}
                </button>
              ))}
            </div>
          </div>
          <div className='modal-footer'>
            <button type='button' className='btn btn-secondary' onClick={onDismiss}>
              {t('common.cancel')}
            </button>
            <button
              type='button'
              className='btn btn-primary'
              onClick={handleConfirm}
              disabled={!selected}
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
