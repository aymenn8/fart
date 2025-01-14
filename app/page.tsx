"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

const fartSounds = [
  { name: 'fart1', src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fart1-LfFNLIwCKT7j3ZfjiqMpSgHhPppbdu.mp3' },
  { name: 'fart2', src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fart2-iOsG8FYrt33rtFeqFAXtneOome5UzG.mp3' },
  { name: 'fart3', src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fart3-HZ6QX2K2PC4WH18EO6nSxeTlpXAE2P.mp3' },
  { name: 'fart4', src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fart4-rsPVG47YG2QILS2gp41ntqAyQPGCcT.mp3' },
  { name: 'fart5', src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fart5-NLLq4dLSfSlzVqkvbe5VRt2xy1NpCo.mp3' },
]


export default function FartSoundWebsite() {
  const [lastPlayed, setLastPlayed] = useState<number | null>(null)
  const [trades, setTrades] = useState<any[]>([])
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([])
  const { toast } = useToast()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout
    let refreshInterval: NodeJS.Timeout

    const connectWebSocket = () => {
      audioRefs.current = fartSounds.map(() => new Audio())
      fartSounds.forEach((sound, index) => {
        if (audioRefs.current[index]) {
          audioRefs.current[index]!.src = sound.src
        }
      })

      // Initialize WebSocket connection
      const ws = new WebSocket('wss://pumpportal.fun/api/data')
    
      ws.onopen = () => {
        console.log('🟢 Connected to PumpPortal')
        toast({
          title: "Connected!",
          description: "Listening for trades...",
        })

        // Subscribe to token trades
        const payload = {
          method: "subscribeTokenTrade",
          keys: ["DP1AMvTpiXGAyLasJsiXBv6pFMTwufETtgK6kxRWpump"]
        }
        console.log('📤 Sending subscription payload:', payload)
        ws.send(JSON.stringify(payload))
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('📥 Received WebSocket message:', {
          type: data.type,
          tokenSymbol: data.tokenSymbol,
          amount: data.amount,
          price: data.price,
          timestamp: new Date().toLocaleTimeString(),
          fullData: data
        })
        
        if (data.type === 'trade' && data.tokenSymbol === 'FART') {
          console.log('🎵 Playing fart sound for FART token trade')
          playRandomFart()
          setTrades(prev => [{
            amount: data.amount,
            price: data.price,
            timestamp: new Date().toLocaleTimeString()
          }, ...prev].slice(0, 5))
        }
      }

      ws.onerror = (error) => {
        console.error('🔴 WebSocket error:', error)
        toast({
          title: "Connection Error",
          description: "Failed to connect to PumpPortal",
          variant: "destructive",
        })
      }

      ws.onclose = () => {
        console.log('🔵 WebSocket connection closed, attempting to reconnect...')
        // Attempt to reconnect after 5 seconds
        reconnectTimeout = setTimeout(connectWebSocket, 5000)
      }

      wsRef.current = ws
    }

    // Initial connection
    connectWebSocket()

    // Refresh connection every 5 minutes
    refreshInterval = setInterval(() => {
      console.log('🔄 Refreshing WebSocket connection...')
      if (wsRef.current) {
        wsRef.current.close()
      }
    }, 5 * 60 * 1000)

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
      audioRefs.current.forEach(audio => audio?.pause())
    }
  }, [toast])

  const playRandomFart = () => {
    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * fartSounds.length)
    } while (randomIndex === lastPlayed && fartSounds.length > 1)

    const audio = audioRefs.current[randomIndex]
    if (audio) {
      audio.currentTime = 0
      audio.play()
    }
    setLastPlayed(randomIndex)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-900 p-8">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-4xl font-bold text-center text-amber-100">Fart Sound Website</h1>
        
        <Card className="p-4 bg-amber-800/50 border-amber-700">
          <h2 className="text-xl font-semibold text-amber-100 mb-2">Recent FART Token Trades</h2>
          {trades.length > 0 ? (
            <div className="space-y-2">
              {trades.map((trade, index) => (
                <div key={index} className="text-amber-200 text-sm flex justify-between">
                  <span>{trade.timestamp}</span>
                  <span>{trade.amount} FART @ ${trade.price}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-amber-200 text-sm">No trades yet...</p>
          )}
        </Card>

        <Button 
          onClick={playRandomFart}
          className="w-full px-6 py-3 text-xl bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg transform transition duration-200 hover:scale-105"
        >
          Click to Fart!
        </Button>
        
        <p className="text-center text-amber-200">
          A random fart sound will play automatically when someone buys the FART token!
        </p>
      </div>
    </div>
  )
}

