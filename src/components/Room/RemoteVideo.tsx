'use client';

import React, { useEffect, useRef } from 'react';
import type Peer from 'simple-peer';

interface VideoProps {
  peer: any;
  peerID: string;
  peerName: string;
}

const RemoteVideo: React.FC<VideoProps> = ({ peer, peerName }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    peer.on('stream', (stream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [peer]);

  return (
    <div className="relative group overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl transition-all duration-300 hover:border-zinc-700">
      <video
        ref={ref}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {peerName}
      </div>
    </div>
  );
};

export default RemoteVideo;
