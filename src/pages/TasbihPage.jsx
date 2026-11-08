import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import TasbihCounter from '../components/TasbihCounter'
import PageHeader from '../components/PageHeader'

export default function TasbihPage() {
    const { theme } = useSettings()
    const navigate = useNavigate()

    return (
        <div className="pb-32 max-w-xl md:max-w-4xl mx-auto min-h-screen flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <PageHeader
                title="Digital Tasbih"
                subtitle="Keep Track of Your Dhikr"
                showBack={false}
                titleSerif={false}
                titleWeight={400}
                padding="px-6 pt-10 sm:pt-14 pb-2 sm:pb-4"
                subtitleCase="title"
            />

            <div className="flex-1 flex flex-col justify-start">
                <TasbihCounter />
            </div>
        </div>
    )
}
