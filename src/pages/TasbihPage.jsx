import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import TasbihCounter from '../components/TasbihCounter'
import PageHeader from '../components/PageHeader'

export default function TasbihPage() {
    const { theme } = useSettings()
    const navigate = useNavigate()

    return (
        <div className="pb-32 max-w-xl md:max-w-6xl mx-auto min-h-screen">
            <PageHeader
                title="Digital Tasbih"
                subtitle="Keep Track of Your Dhikr"
                showBack={false}
                titleSerif={false}
                titleWeight={400}
                padding="px-6 pt-10 pb-10"
                subtitleCase="title"
            />


            <div className="flex-1 flex flex-col justify-center">
                <TasbihCounter />
            </div>
        </div>
    )
}
