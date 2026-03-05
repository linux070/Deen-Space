import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * useAudio — cross-platform Arabic text-to-speech that works OFFLINE.
 * Uses the Web Speech API (SpeechSynthesis) built into modern browsers.
 *
 * Falls back gracefully on devices without Arabic voice support by
 * still calling speechSynthesis with the best available voice.
 */
export function useAudio() {
    const [speaking, setSpeaking] = useState(null) // id of currently speaking item
    const utteranceRef = useRef(null)
    const voiceRef = useRef(null)

    // Pre-select best Arabic voice on mount
    useEffect(() => {
        function pickVoice() {
            const voices = speechSynthesis.getVoices()
            // Prefer Arabic voices, then any voice as fallback
            const arabic = voices.find(v => v.lang.startsWith('ar'))
            voiceRef.current = arabic || voices[0] || null
        }

        pickVoice()
        // Voices may load asynchronously
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = pickVoice
        }

        return () => {
            speechSynthesis.cancel()
        }
    }, [])

    const speak = useCallback((text, id) => {
        // If already speaking this item, stop it
        if (speaking === id) {
            speechSynthesis.cancel()
            setSpeaking(null)
            return
        }

        // Cancel any ongoing speech
        speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'ar-SA'
        utterance.rate = 0.8 // Slightly slower for clarity
        utterance.pitch = 1.0

        if (voiceRef.current) {
            utterance.voice = voiceRef.current
        }

        utterance.onstart = () => setSpeaking(id)
        utterance.onend = () => setSpeaking(null)
        utterance.onerror = () => setSpeaking(null)

        utteranceRef.current = utterance
        speechSynthesis.speak(utterance)
    }, [speaking])

    const stop = useCallback(() => {
        speechSynthesis.cancel()
        setSpeaking(null)
    }, [])

    return { speak, stop, speaking }
}
