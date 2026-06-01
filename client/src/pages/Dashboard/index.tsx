import { useState, useEffect } from 'react'
import { fetchLoggedUser } from '../../services/auth'
import SuperLicenseesCard from './cards/SuperLicenseesCard'
import SuperMessageVolumeCard from './cards/SuperMessageVolumeCard'
import SuperDeliveryRateCard from './cards/SuperDeliveryRateCard'
import SuperQueueCard from './cards/SuperQueueCard'
import SuperConversationsCard from './cards/SuperConversationsCard'
import LicenseeContactsCard from './cards/LicenseeContactsCard'
import LicenseeMessagesTodayCard from './cards/LicenseeMessagesTodayCard'
import LicenseeMessagesPerDayCard from './cards/LicenseeMessagesPerDayCard'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    fetchLoggedUser()
      .then(setUser)
      .finally(() => setLoadingUser(false))
  }, [])

  if (loadingUser) return <p>Carregando...</p>

  if (user?.isSuper) {
    return (
      <>
        <div className="row g-3">
          <div className="col-12 col-md-6"><SuperLicenseesCard /></div>
          <div className="col-12 col-md-6"><SuperMessageVolumeCard /></div>
          <div className="col-12 col-md-6"><SuperDeliveryRateCard /></div>
          <div className="col-12 col-md-6"><SuperQueueCard /></div>
          <div className="col-12"><SuperConversationsCard /></div>
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
