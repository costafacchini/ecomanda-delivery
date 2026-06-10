import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { getSetorBaileysStatus, getSetorBaileysQr, syncSetorBaileys } from '../../../../services/setor'

interface Props {
  setorId: string
  isActive: boolean
}

function SetorBaileysPanel({ setorId, isActive }: Props) {
  const [baileysQr, setBaileysQr] = useState<any>(null)
  const [baileysStatus, setBaileysStatus] = useState<any>(null)
  const [baileysConnected, setBaileysConnected] = useState<boolean | null>(null)
  const [baileysChecking, setBaileysChecking] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [syncError, setSyncError] = useState<any>(null)

  useEffect(() => {
    if (!isActive || !setorId) return

    setBaileysChecking(true)
    getSetorBaileysStatus({ id: setorId })
      .then((response) => {
        setBaileysConnected(response.data?.connected ?? false)
      })
      .catch(() => {
        setBaileysConnected(false)
      })
      .finally(() => {
        setBaileysChecking(false)
      })
  }, [isActive, setorId])

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
              const response = await getSetorBaileysQr({ id: setorId })
              if (response.data?.qr) {
                setBaileysQr(response.data.qr)
                setBaileysConnected(false)
              } else {
                setBaileysStatus(response.data?.message ?? 'Erro ao gerar QR')
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
                const response = await syncSetorBaileys({ id: setorId })
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
              const response = await getSetorBaileysQr({ id: setorId })
              if (response.data?.qr) {
                setBaileysQr(response.data.qr)
              } else if (response.data?.connected) {
                setBaileysConnected(true)
              } else {
                setBaileysStatus(response.data?.message ?? 'Erro ao gerar QR')
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

export default SetorBaileysPanel
