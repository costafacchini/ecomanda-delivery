import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { getSectorBaileysStatus, getSectorBaileysQr, syncSectorBaileys } from '../../../../services/sector'

interface Props {
  sectorId: string
  isActive: boolean
}

// Sectors not in type-narrowing plan scope — minimal local types for API responses
interface BaileysStatusResponse {
  connected?: boolean
}

interface BaileysQrResponse {
  qr?: string
  connected?: boolean
  message?: string
}

function SectorBaileysPanel({ sectorId, isActive }: Props) {
  const [baileysQr, setBaileysQr] = useState<any>(null)
  const [baileysStatus, setBaileysStatus] = useState<any>(null)
  const [baileysConnected, setBaileysConnected] = useState<boolean | null>(null)
  const [baileysChecking, setBaileysChecking] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [syncError, setSyncError] = useState<any>(null)

  useEffect(() => {
    if (!isActive || !sectorId) return

    setBaileysChecking(true)
    getSectorBaileysStatus({ id: sectorId })
      .then((response) => {
        setBaileysConnected((response.data as BaileysStatusResponse)?.connected ?? false)
      })
      .catch(() => {
        setBaileysConnected(false)
      })
      .finally(() => {
        setBaileysChecking(false)
      })
  }, [isActive, sectorId])

  return (
    <div className='mt-4'>
      <h5>Conexão Baileys</h5>

      {baileysChecking && (
        <span className='text-muted'>Verificando conexão...</span>
      )}

      {!baileysChecking && baileysConnected && (
        <div className='d-flex align-items-center gap-3'>
          <span className='text-success fw-semibold'>&#10003; Conectado</span>
          <button
            onClick={async (event) => {
              event.preventDefault()
              setBaileysConnected(null)
              setBaileysQr(null)
              setBaileysStatus(null)
              const response = await getSectorBaileysQr({ id: sectorId })
              const qrData = response.data as BaileysQrResponse
              if (qrData?.qr) {
                setBaileysQr(qrData.qr)
                setBaileysConnected(false)
              } else {
                setBaileysStatus(qrData?.message ?? 'Erro ao gerar QR')
              }
            }}
            className='btn btn-outline-secondary btn-sm'
          >
            Reconectar
          </button>
          <button
            onClick={async (event) => {
              event.preventDefault()
              setSyncResult(null)
              setSyncError(null)
              setSyncLoading(true)
              try {
                const response = await syncSectorBaileys({ id: sectorId })
                setSyncResult(response.data)
              } catch {
                setSyncError('Erro ao sincronizar grupos')
              } finally {
                setSyncLoading(false)
              }
            }}
            className='btn btn-outline-primary btn-sm'
            disabled={syncLoading}
          >
            {syncLoading ? 'Sincronizando...' : 'Sincronizar Grupos'}
          </button>
        </div>
      )}

      {syncResult && (
        <div className='mt-2'>
          <span className='text-muted small'>
            Grupos importados: {syncResult.importedGroups} | Grupos atualizados: {syncResult.updatedGroups}
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
              const response = await getSectorBaileysQr({ id: sectorId })
              const qrData = response.data as BaileysQrResponse
              if (qrData?.qr) {
                setBaileysQr(qrData.qr)
              } else if (qrData?.connected) {
                setBaileysConnected(true)
              } else {
                setBaileysStatus(qrData?.message ?? 'Erro ao gerar QR')
              }
            }}
            className='btn btn-info'
          >
            Gerar QR Code
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

export default SectorBaileysPanel
