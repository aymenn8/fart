"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

const fartSounds = [
  {
    name: "fart1",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fart1-LfFNLIwCKT7j3ZfjiqMpSgHhPppbdu.mp3",
  },
  {
    name: "fart2",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fart2-iOsG8FYrt33rtFeqFAXtneOome5UzG.mp3",
  },
  {
    name: "fart3",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fart3-HZ6QX2K2PC4WH18EO6nSxeTlpXAE2P.mp3",
  },
  {
    name: "fart4",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fart4-rsPVG47YG2QILS2gp41ntqAyQPGCcT.mp3",
  },
  {
    name: "fart5",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fart5-NLLq4dLSfSlzVqkvbe5VRt2xy1NpCo.mp3",
  },
];

const tokenAddress = "DP1AMvTpiXGAyLasJsiXBv6pFMTwufETtgK6kxRWpump";
const solInUSD = 186.27;

export default function FartSoundWebsite() {
  const [interactionEnabled, setInteractionEnabled] = useState(false);
  const [lastPlayed, setLastPlayed] = useState<number | null>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    audioRefs.current = fartSounds.map(() => new Audio());
    fartSounds.forEach((sound, index) => {
      if (audioRefs.current[index]) {
        audioRefs.current[index]!.src = sound.src;
      }
    });
    // Initialize WebSocket connection
    const ws = new WebSocket("wss://pumpportal.fun/api/data");

    ws.onopen = () => {
      console.log("Connected to PumpPortal");
      toast({
        title: "Connected!",
        description: "Listening for trades...",
      });
      // Subscribe to token trades
      const payload = {
        method: "subscribeTokenTrade",
        keys: [tokenAddress], // Replace with actual token address when available
      };
      ws.send(JSON.stringify(payload));
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data);

      if (data.type === "buy") {
        playRandomFart();
        setTrades((prev) =>
          [
            {
              amount: Math.round(data.tokenAmount),
              price: data.solAmount * solInUSD,
              timestamp: new Date().toLocaleTimeString(),
            },
            ...prev,
          ].slice(0, 5)
        );
      }
    };
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to PumpPortal",
        variant: "destructive",
      });
    };
    wsRef.current = ws;
    return () => {
      ws.close();
      audioRefs.current.forEach((audio) => audio?.pause());
    };
  }, [toast]);
  const playRandomFart = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * fartSounds.length);
    } while (randomIndex === lastPlayed && fartSounds.length > 1);
    const audio = audioRefs.current[randomIndex];
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
    setLastPlayed(randomIndex);
  };

  const enableInteraction = () => {
    setInteractionEnabled(true);
    playRandomFart();
    toast({
      title: "Interaction Enabled",
      description: "Now you can hear fart sounds!",
    });
  };

  return (
    <div className="bg-amber-900 min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-2xl mx-auto mb-8">
          <p className="text-amber-100 text-lg sm:text-2xl md:text-3xl text-center break-all bg-amber-800/50 p-4 rounded-lg border border-amber-700">
            Token Address: {tokenAddress}
          </p>
        </div>
        <Image
          src="/logo.png"
          alt="Fartman"
          width={300}
          height={300}
          className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 mb-8"
        />
        {!interactionEnabled ? (
          <Button
            onClick={enableInteraction}
            className="px-6 py-3 text-lg sm:text-xl bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg transform transition duration-200 hover:scale-105 w-full max-w-xs"
          >
            MAKE IT FART
          </Button>
        ) : (
          <div className="w-full max-w-md space-y-8 px-4">
            <h1 className="text-4xl font-bold text-center text-amber-100">
              Make It FART
            </h1>

            <Card className="p-4 bg-amber-800/50 border-amber-700">
              <h2 className="text-xl font-semibold text-amber-100 mb-2">
                Recent FART Token Trades
              </h2>
              {trades.length > 0 ? (
                <div className="space-y-2">
                  {trades.map((trade, index) => (
                    <div
                      key={index}
                      className="text-amber-200 text-sm flex justify-between"
                    >
                      <span>{trade.timestamp}</span>
                      <span>
                        {trade.amount} FART @ ${trade.price}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-amber-200 text-sm">No trades yet...</p>
              )}
            </Card>

            <Button
              onClick={playRandomFart}
              className="w-full px-6 py-3 text-lg sm:text-xl bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg transform transition duration-200 hover:scale-105"
            >
              Play Next Fart!
            </Button>

            <p className="text-center text-amber-200 text-sm sm:text-base">
              A random fart sound will play automatically when someone buys the
              <strong className="text-amber-400"> $FART</strong> token OR if you
              click the
              <strong className="text-amber-400"> $FART</strong> button!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
