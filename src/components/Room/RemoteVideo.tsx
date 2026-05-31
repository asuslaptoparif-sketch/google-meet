'use client';

import React, { useEffect, useRef } from 'react';
import { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';

interface VideoProps {
  user: IAgoraRTCRemoteUser;
}

const RemoteVideo: React.FC<VideoProps> = ({ user }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.videoTrack && containerRef.current) {
      user.videoTrack.play(containerRef.current);
    }
  }, [user.videoTrack]);

  return (
    <div className="relative group overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl transition-all duration-300 hover:border-zinc-700 aspect-video">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {user.uid}
      </div>
    </div>
  );
};

export default RemoteVideo;
