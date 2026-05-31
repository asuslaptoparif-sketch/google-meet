'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Video, Mic, MicOff, VideoOff, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

function LandingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoomID = searchParams.get('join') || '';
  
  const [roomID, setRoomID] = useState(initialRoomID);
  const [userName, setUserName] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (initialRoomID) {
      setRoomID(initialRoomID);
    }
  }, [initialRoomID]);

  useEffect(() => {
    const getMedia = async () => {
      // If both are off, stop existing tracks and return
      if (!isVideoOn && !isAudioOn) {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: isVideoOn, 
          audio: isAudioOn 
        });
        
        // Stop old tracks if we are getting a new stream
        streamRef.current?.getTracks().forEach(track => track.stop());
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing media:', err);
      }
    };

    getMedia();

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [isVideoOn, isAudioOn]);

  const handleCreateRoom = () => {
    if (!userName.trim()) {
      alert('Please enter your name first');
      return;
    }
    const id = uuidv4();
    router.push(`/room/${id}?name=${encodeURIComponent(userName)}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('Please enter your name first');
      return;
    }
    if (roomID.trim()) {
      router.push(`/room/${roomID}?name=${encodeURIComponent(userName)}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="p-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="font-bold italic">V</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Vision</span>
        </div>
        <div className="flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">Solutions</a>
          <a href="#" className="hover:text-white transition-colors">Enterprise</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <button className="px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl font-bold tracking-tight leading-[1.1]">
              Premium video calls. <br />
              <span className="text-blue-500">Now free for everyone.</span>
            </h1>
            <p className="mt-6 text-xl text-zinc-400 max-w-lg leading-relaxed">
              Experience crystal clear audio and high-definition video with Vision. 
              Built for security, reliability, and ease of use.
            </p>
          </motion.div>

          <div className="space-y-4">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-zinc-500 mb-2 ml-1">Your Display Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white font-medium"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleCreateRoom}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-semibold transition-all shadow-lg shadow-blue-500/20"
            >
              <Video size={20} />
              New Meeting
            </button>
            
            <form onSubmit={handleJoinRoom} className="flex flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Enter room code"
                value={roomID}
                onChange={(e) => setRoomID(e.target.value)}
                className="flex-1 bg-zinc-900 border border-white/10 rounded-l-2xl px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <button 
                type="submit"
                className="px-6 bg-zinc-800 hover:bg-zinc-700 border border-white/10 border-l-0 rounded-r-2xl transition-all"
              >
                Join
              </button>
            </form>
          </div>

          <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-8">
            <div className="space-y-2">
              <Shield className="text-blue-500" size={20} />
              <h3 className="font-semibold">Secure</h3>
              <p className="text-xs text-zinc-500">End-to-end encryption for all meetings.</p>
            </div>
            <div className="space-y-2">
              <Zap className="text-blue-500" size={20} />
              <h3 className="font-semibold">Fast</h3>
              <p className="text-xs text-zinc-500">Ultra low-latency global network.</p>
            </div>
            <div className="space-y-2">
              <Globe className="text-blue-500" size={20} />
              <h3 className="font-semibold">Global</h3>
              <p className="text-xs text-zinc-500">Connect from anywhere in the world.</p>
            </div>
          </div>
        </div>

        {/* Right Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative aspect-video rounded-3xl bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl">
            {isVideoOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center border-4 border-zinc-600">
                  <VideoOff size={40} className="text-zinc-500" />
                </div>
              </div>
            )}

            {/* Preview Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
              <button 
                onClick={() => setIsAudioOn(!isAudioOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                  isAudioOn ? 'bg-zinc-800/80 border-white/10 hover:bg-zinc-700' : 'bg-red-500 border-transparent'
                }`}
              >
                {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button 
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                  isVideoOn ? 'bg-zinc-800/80 border-white/10 hover:bg-zinc-700' : 'bg-red-500 border-transparent'
                }`}
              >
                {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>}>
      <LandingPageContent />
    </Suspense>
  );
}
