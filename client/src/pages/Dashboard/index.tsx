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

  if (!currentUser) return <p>Carregando...</p>

  if (currentUser.role === 'super' && !activeLicensee) {
    return (
      <>
        <div className="row g-3">
          <div className="col-12 col-md-6"><SuperLicenseesCard /></div>
          <div className="col-12 col-md-6"><SuperMessageVolumeCard /></div>
          <div className="col-12 col-md-6"><SuperDeliveryRateCard /></div>
          <div className="col-12 col-md-6"><SuperQueueCard /></div>
          <div className="col-12 col-md-6"><SuperConversationsCard /></div>
          <div className="col-12"><SuperOpenRoomsCard /></div>
        </div>
      </>
    )
  }

  if (currentUser.role === 'super' || currentUser.role === 'admin') {
    const licenseeId = activeLicensee?.id
    const licenseeObj = currentUser.licensee as { id?: string; whatsappDefault?: string } | string | null
    const licenseeObjId = typeof licenseeObj === 'object' && licenseeObj !== null ? licenseeObj.id : undefined
    const needsBaileysSetup = currentUser.role === 'admin' && (typeof licenseeObj === 'object' && licenseeObj !== null ? licenseeObj.whatsappDefault === 'baileys' : false)
    const [showBaileysCard, setShowBaileysCard] = useState(needsBaileysSetup)
    return (
      <>
        <div className="row g-3">
          {showBaileysCard && licenseeObjId && (
            <div className="col-12 col-md-6">
              <BaileysSetupCard licenseeId={licenseeObjId} onConnected={() => setShowBaileysCard(false)} />
            </div>
          )}
          <div className="col-12 col-md-6"><SuperMessageVolumeCard licensee={licenseeId} /></div>
          <div className="col-12 col-md-6"><SuperDeliveryRateCard licensee={licenseeId} /></div>
          <div className="col-12 col-md-6"><SuperQueueCard licensee={licenseeId} /></div>
          <div className="col-12 col-md-6"><SuperConversationsCard licensee={licenseeId} /></div>
          <div className="col-12"><SuperOpenRoomsCard licensee={licenseeId} /></div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="row g-3">
        <div className="col-12 col-md-4"><LicenseeContactsCard /></div>
        <div className="col-12 col-md-4"><LicenseeMessagesTodayCard /></div>
        <div className="col-12 col-md-4"><LicenseeMessagesPerDayCard /></div>
      </div>
    </>
  )
}
