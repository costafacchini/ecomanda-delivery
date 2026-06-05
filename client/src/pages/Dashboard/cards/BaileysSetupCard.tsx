import { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { getBaileysQr, getBaileysStatus } from '../../../services/licensee'

interface Props {
  licenseeId: string
  onConnected: () => void
}

export default function BaileysSetupCard({ licenseeId, onConnected }: Props) {
  const [qr, setQr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState('')
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const licensee = { id: licenseeId }

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  async function checkStatus(): Promise<boolean> {
    const res = await getBaileysStatus(licensee)
    if (res.data?.connected) {
      stopPolling()
      onConnected()
      return true
    }
    return false
  }

  async function generateQr() {
    setLoading(true)
    setQr(null)
    setStatusMessage('')
    const res = await getBaileysQr(licensee)
    setLoading(false)
    if (res.data?.qr) {
      setQr(res.data.qr)
    } else {
      setStatusMessage(res.data?.message || 'Erro ao gerar QR Code')
    }
  }

  useEffect(() => {
    async function init() {
      const isConnected = await checkStatus()
      if (!isConnected) {
        await generateQr()
        pollingRef.current = setInterval(checkStatus, 5000)
      }
      setLoading(false)
    }

    init()

    return () => stopPolling()
  }, [licenseeId])

  return (
    <div className='card border-warning'>
      <div className='card-header bg-warning text-dark fw-semibold'>
        Conectar WhatsApp
      </div>
      <div className='card-body text-center'>
        {loading && <p className='text-muted'>Gerando QR Code...</p>}

        {!loading && qr && (
          <>
            <p className='text-muted small mb-3'>
              Abra o WhatsApp no seu celular, vá em <strong>Aparelhos conectados</strong> e escaneie o código abaixo.
            </p>
            <QRCodeSVG value={qr} size={200} />
            <p className='text-muted small mt-3'>Aguardando conexão...</p>
          </>
        )}

        {!loading && !qr && statusMessage && (
          <p className='text-danger'>{statusMessage}</p>
        )}

        {!loading && (
          <button className='btn btn-outline-warning btn-sm mt-3' onClick={generateQr}>
            Gerar novo QR Code
          </button>
        )}
      </div>
    </div>
  )
}
