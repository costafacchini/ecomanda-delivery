import { useContext } from 'react'
import { AppContext } from '../../contexts/App'
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
  const { currentUser, activeLicensee } = useContext(AppContext)

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
    const licenseeId = activeLicensee?._id
    const needsBaileysSetup = currentUser.role === 'admin' && currentUser.licensee?.whatsappDefault === 'baileys'
    return (
      <>
        <div className="row g-3">
          {needsBaileysSetup && (
            <div className="col-12 col-md-6">
              <BaileysSetupCard licenseeId={currentUser.licensee._id} />
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
