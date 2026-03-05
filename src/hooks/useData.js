import { useState, useEffect } from 'react'

export function useData() {
    const [duas, setDuas] = useState([])
    const [asma, setAsma] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            fetch('/data/duas.json').then(r => r.json()),
            fetch('/data/asma.json').then(r => r.json()),
        ])
            .then(([d, a]) => {
                setDuas(d)
                setAsma(a)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    return { duas, asma, loading }
}
