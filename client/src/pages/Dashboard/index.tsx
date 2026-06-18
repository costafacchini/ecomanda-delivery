import { useState } from 'react'
import { useApp } from '../../contexts/App'
import SuperLicenseesCard from './cards/SuperLicenseesCard'
import SuperMessageVolumeCard from './cards/SuperMessageVolumeCard'
import SuperDeliveryRateCard from './cards/SuperDeliveryRateCard'
import SuperQueueCard from './cards/SuperQueueCard'
import SuperConversationsCard from './cards/SuperConversationsCard'
import SuperOpenRoomsCard from './cards/SuperOpenRoomsCard'
import LicenseeContactsCard from './cards/LicenseeContactsCard'
import LicenseeMessagesTodayCard from './cards/LicenseeMessagesTodayCard'
import LicenseeMessagesPerDayCard from './cards/LicenseeMessagesPerDayCard'
import BaileysSetupCard from './cards/BaileysSetupCard'

export default function Dashboard() {
  const { currentUser, activeLicensee } = useApp()

  const licenseeObj = currentUser?.licensee as { id?: string; whatsappDefault?: string; chatDefault?: string } | string | null | undefined
  const [connectedLicensees, setConnectedLicensees] = useState<Set<string>>(new Set())

  if (!currentUser) {
    return (
      <div className="d-flex justify-content-center py-5 text-muted">
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
        Carregando...
      </div>
    )
  }

  function renderCards() {
    if (currentUser!.role === 'super' && !activeLicensee) {
      return (
        <div className="row g-3">
          <div className="col-12 col-md-8"><SuperMessageVolumeCard /></div>
          <div className="col-12 col-md-4 d-flex flex-column gap-3">
            <SuperDeliveryRateCard />
            <SuperQueueCard />
            <SuperConversationsCard />
          </div>
          <div className="col-12"><SuperLicenseesCard /></div>
          <div className="col-12"><SuperOpenRoomsCard /></div>
        </div>
      )
    }

    if (currentUser!.role === 'super' || currentUser!.role === 'admin') {
      const licenseeId = activeLicensee?.id
      const licenseeObjId = typeof licenseeObj === 'object' && licenseeObj !== null ? licenseeObj.id : undefined
      const targetLicenseeId = licenseeId ?? licenseeObjId
      const usesLocalChat = activeLicensee
        ? activeLicensee.chatDefault === 'local'
        : typeof licenseeObj === 'object' && licenseeObj !== null && licenseeObj.chatDefault === 'local'
      const usesBaileys = activeLicensee
        ? activeLicensee.whatsappDefault === 'baileys'
        : typeof licenseeObj === 'object' && licenseeObj !== null && licenseeObj.whatsappDefault === 'baileys'
      const showBaileysCard = usesBaileys && targetLicenseeId != null && !connectedLicensees.has(targetLicenseeId)
      return (
        <div className="row g-3">
          {showBaileysCard && targetLicenseeId && (
            <div className="col-12">
              <BaileysSetupCard
                licenseeId={targetLicenseeId}
                onConnected={() => setConnectedLicensees((prev) => new Set(prev).add(targetLicenseeId))}
              />
            </div>
          )}
          <div className="col-12 col-md-8"><SuperMessageVolumeCard licensee={licenseeId} /></div>
          <div className="col-12 col-md-4 d-flex flex-column gap-3">
            <SuperDeliveryRateCard licensee={licenseeId} />
            <SuperQueueCard licensee={licenseeId} />
            <SuperConversationsCard licensee={licenseeId} />
          </div>
          {usesLocalChat && <div className="col-12"><SuperOpenRoomsCard licensee={licenseeId} /></div>}
        </div>
      )
    }

    return (
      <div className="row g-3">
        <div className="col-12 col-md-4"><LicenseeContactsCard /></div>
        <div className="col-12 col-md-4"><LicenseeMessagesTodayCard /></div>
        <div className="col-12 col-md-4"><LicenseeMessagesPerDayCard /></div>
      </div>
    )
  }

  return (
    <>
      <h3 className="mb-3">Dashboard</h3>
      {renderCards()}
    </>
  )
}
