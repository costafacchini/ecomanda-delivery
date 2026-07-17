import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'
import { getDepartmentBaileysStatus, getDepartmentBaileysQr, syncDepartmentBaileys } from '../../../../services/department'

interface Props {
  departmentId: string
  isActive: boolean
}

// Departments not in type-narrowing plan scope — minimal local types for API responses
interface BaileysStatusResponse {
  connected?: boolean
}

interface BaileysQrResponse {
  qr?: string
  connected?: boolean
  message?: string
}

function DepartmentBaileysPanel({ departmentId, isActive }: Props) {
  const { t } = useTranslation()
  const [baileysQr, setBaileysQr] = useState<any>(null)
  const [baileysStatus, setBaileysStatus] = useState<any>(null)
  const [baileysConnected, setBaileysConnected] = useState<boolean | null>(null)
  const [baileysChecking, setBaileysChecking] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [syncError, setSyncError] = useState<any>(null)

  useEffect(() => {
    if (!isActive || !departmentId) return

    setBaileysChecking(true)
    getDepartmentBaileysStatus({ id: departmentId })
      .then((response) => {
        setBaileysConnected((response.data as BaileysStatusResponse)?.connected ?? false)
      })
      .catch(() => {
        setBaileysConnected(false)
      })
      .finally(() => {
        setBaileysChecking(false)
      })
  }, [isActive, departmentId])

  return (
    <div className='mt-4'>
      <h5>{t('departments.baileys.title')}</h5>

      {baileysChecking && (
        <span className='text-muted'>{t('departments.baileys.checking')}</span>
      )}

      {!baileysChecking && baileysConnected && (
        <div className='d-flex align-items-center gap-3'>
          <span className='text-success fw-semibold'>&#10003; {t('departments.baileys.connected')}</span>
          <button
            onClick={async (event) => {
              event.preventDefault()
              setBaileysConnected(null)
              setBaileysQr(null)
              setBaileysStatus(null)
              const response = await getDepartmentBaileysQr({ id: departmentId })
              const qrData = response.data as BaileysQrResponse
              if (qrData?.qr) {
                setBaileysQr(qrData.qr)
                setBaileysConnected(false)
              } else {
                setBaileysStatus(qrData?.message ?? t('departments.baileys.qrError'))
              }
            }}
            className='btn btn-outline-secondary btn-sm'
          >
            {t('departments.baileys.reconnect')}
          </button>
          <button
            onClick={async (event) => {
              event.preventDefault()
              setSyncResult(null)
              setSyncError(null)
              setSyncLoading(true)
              try {
                const response = await syncDepartmentBaileys({ id: departmentId })
                setSyncResult(response.data)
              } catch {
                setSyncError(t('departments.baileys.syncError'))
              } finally {
                setSyncLoading(false)
              }
            }}
            className='btn btn-outline-primary btn-sm'
            disabled={syncLoading}
          >
            {syncLoading ? t('departments.baileys.syncing') : t('departments.baileys.syncGroups')}
          </button>
        </div>
      )}

      {syncResult && (
        <div className='mt-2'>
          <span className='text-muted small'>
            {t('departments.baileys.syncResult', { imported: syncResult.importedGroups, updated: syncResult.updatedGroups })}
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
          <button
            onClick={async (event) => {
              event.preventDefault()
              setBaileysQr(null)
              setBaileysStatus(null)
              const response = await getDepartmentBaileysQr({ id: departmentId })
              const qrData = response.data as BaileysQrResponse
              if (qrData?.qr) {
                setBaileysQr(qrData.qr)
              } else if (qrData?.connected) {
                setBaileysConnected(true)
              } else {
                setBaileysStatus(qrData?.message ?? t('departments.baileys.qrError'))
              }
            }}
            className='btn btn-info'
          >
            {t('departments.baileys.generateQr')}
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

export default DepartmentBaileysPanel
