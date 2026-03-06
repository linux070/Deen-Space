import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import TasbihCounter from '../components/TasbihCounter'
import PageHeader from '../components/PageHeader'

export default function TasbihPage() {
    const { theme } = useSettings()
    const navigate = useNavigate()

    return (
        <div className="pb-32 max-w-xl md:max-w-6xl mx-auto min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <PageHeader
                title="Digital Tasbih"
                subtitle="Keep Track of Your Dhikr"
                showBack={false}
                titleSerif={false}
                titleWeight={400}
                padding="px-6 pt-16 pb-12"
                subtitleCase="title"
            />


            <div className="flex-1 flex flex-col justify-start pt-4">
                <TasbihCounter />
            </div>
        </div>
    )
}
