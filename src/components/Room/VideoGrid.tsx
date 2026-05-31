'use client';

import React from 'react';
import RemoteVideo from './RemoteVideo';
import type Peer from 'simple-peer';

interface VideoGridProps {
  peers: { peerID: string; peerName: string; peer: any }[];
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  localName: string;
}

const VideoGrid: React.FC<VideoGridProps> = ({ peers, localVideoRef, localName }) => {
  const totalParticipants = peers.length + 1;

  const getGridCols = () => {
    if (totalParticipants === 1) return 'grid-cols-1';
    if (totalParticipants === 2) return 'grid-cols-1 md:grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-2';
    if (totalParticipants <= 6) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <div className={`grid ${getGridCols()} gap-4 p-4 h-full w-full overflow-y-auto content-center`}>
      {/* Local Video */}
      <div className="relative group overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl transition-all duration-300 hover:border-zinc-700">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover scale-x-[-1]"
        />
        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-medium text-white">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          {localName} (You)
        </div>
      </div>

      {/* Peer Videos */}
      {peers.map((peerObj) => (
        <RemoteVideo 
          key={peerObj.peerID} 
          peer={peerObj.peer} 
          peerID={peerObj.peerID} 
          peerName={peerObj.peerName}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
