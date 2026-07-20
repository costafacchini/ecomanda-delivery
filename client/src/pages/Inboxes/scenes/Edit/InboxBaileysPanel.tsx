import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'
import { getInboxBaileysStatus, getInboxBaileysQr, syncInboxBaileys } from '../../../../services/inbox'

interface Props {
  inboxId: string
  isActive: boolean
}

interface BaileysStatusResponse {
  connected?: boolean
}

interface BaileysQrResponse {
  qr?: string
  connected?: boolean
  message?: string
}

interface BaileysSync {
  importedGroups?: number
  updatedGroups?: number
}

function InboxBaileysPanel({ inboxId, isActive }: Props) {
  const { t } = useTranslation()
  const [baileysQr, setBaileysQr] = useState<string | null>(null)
  const [baileysStatus, setBaileysStatus] = useState<string | null>(null)
  const [baileysConnected, setBaileysConnected] = useState<boolean | null>(null)
  const [baileysChecking, setBaileysChecking] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncResult, setSyncResult] = useState<BaileysSync | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    if (!isActive || !inboxId) return

    setBaileysChecking(true)
    getInboxBaileysStatus(inboxId)
      .then((response) => {
        setBaileysConnected((response.data as BaileysStatusResponse)?.connected ?? false)
      })
      .catch(() => {
        setBaileysConnected(false)
      })
      .finally(() => {
        setBaileysChecking(false)
      })
  }, [isActive, inboxId])

  async function handleReconnect(event: React.MouseEvent) {
    event.preventDefault()
    setBaileysConnected(null)
    setBaileysQr(null)
    setBaileysStatus(null)
    const response = await getInboxBaileysQr(inboxId)
    const qrData = response.data as BaileysQrResponse
    if (qrData?.qr) {
      setBaileysQr(qrData.qr)
      setBaileysConnected(false)
    } else {
      setBaileysStatus(qrData?.message ?? t('inboxes.baileys.qrError'))
    }
  }

  async function handleSync(event: React.MouseEvent) {
    event.preventDefault()
    setSyncResult(null)
    setSyncError(null)
    setSyncLoading(true)
    try {
      const response = await syncInboxBaileys(inboxId)
      setSyncResult(response.data as BaileysSync)
    } catch {
      setSyncError(t('inboxes.baileys.syncError'))
    } finally {
      setSyncLoading(false)
    }
  }

  async function handleGenerateQr(event: React.MouseEvent) {
    event.preventDefault()
    setBaileysQr(null)
    setBaileysStatus(null)
    const response = await getInboxBaileysQr(inboxId)
    const qrData = response.data as BaileysQrResponse
    if (qrData?.qr) {
      setBaileysQr(qrData.qr)
    } else if (qrData?.connected) {
      setBaileysConnected(true)
    } else {
      setBaileysStatus(qrData?.message ?? t('inboxes.baileys.qrError'))
    }
  }

  return (
    <div className='mt-4'>
      <h5>{t('inboxes.baileys.title')}</h5>

      {baileysChecking && (
        <span className='text-muted'>{t('inboxes.baileys.checking')}</span>
      )}

      {!baileysChecking && baileysConnected && (
        <div className='d-flex align-items-center gap-3'>
          <span className='text-success fw-semibold'>&#10003; {t('inboxes.baileys.connected')}</span>
          <button onClick={handleReconnect} className='btn btn-outline-secondary btn-sm'>
            {t('inboxes.baileys.reconnect')}
          </button>
          <button
            onClick={handleSync}
            className='btn btn-outline-primary btn-sm'
            disabled={syncLoading}
          >
            {syncLoading ? t('inboxes.baileys.syncing') : t('inboxes.baileys.syncGroups')}
          </button>
        </div>
      )}

      {syncResult && (
        <div className='mt-2'>
          <span className='text-muted small'>
            {t('inboxes.baileys.syncResult', { imported: syncResult.importedGroups, updated: syncResult.updatedGroups })}
          </span>
        </div>
      )}

      {syncError && (
        <div className='mt-2'>
          <span className='text-danger small'>{syncError}</span>
        </div>
      )}

      {!baileysChecking && baileysConnected === false && (
        <div>
          <button onClick={handleGenerateQr} className='btn btn-info'>
            {t('inboxes.baileys.generateQr')}
          </button>
        </div>
      )}

      {baileysQr && (
        <div className='mt-2'>
          <QRCodeSVG value={baileysQr} size={200} />
        </div>
      )}

      {baileysStatus && (
        <div>
          <p>{baileysStatus}</p>
        </div>
      )}
    </div>
  )
}

export default InboxBaileysPanel
