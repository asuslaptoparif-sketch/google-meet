'use client';

import React, { useState } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, ScreenShare, 
  Hand, MessageSquare, Users, PhoneOff, Settings,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ControlsProps {
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onShareScreen: () => void;
  onLeave: () => void;
  onToggleSidebar: (tab: 'chat' | 'participants') => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  onToggleAudio, 
  onToggleVideo, 
  onShareScreen, 
  onLeave,
  onToggleSidebar
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  const handleToggleAudio = () => {
    setIsMuted(!isMuted);
    onToggleAudio();
  };

  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    onToggleVideo();
  };

  const handleShareScreen = () => {
    setIsSharing(!isSharing);
    onShareScreen();
  };

  const ControlButton = ({ 
    icon: Icon, 
    onClick, 
    active = false, 
    danger = false,
    label
  }: { 
    icon: any; 
    onClick: () => void; 
    active?: boolean; 
    danger?: boolean;
    label: string;
  }) => (
    <div className="flex flex-col items-center gap-1 group">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn(
          "w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 shadow-lg border",
          active 
            ? "bg-white text-black border-transparent" 
            : "bg-zinc-800/80 text-white border-white/10 hover:bg-zinc-700",
          danger && "bg-red-500 hover:bg-red-600 border-transparent text-white"
        )}
      >
        <Icon size={20} strokeWidth={2} />
      </motion.button>
      <span className="text-[10px] font-medium text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
    </div>
  );

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 rounded-3xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl z-50">
      <div className="flex items-center gap-3 pr-4 border-r border-white/10">
        <ControlButton 
          icon={isMuted ? MicOff : Mic} 
          onClick={handleToggleAudio} 
          active={isMuted}
          label={isMuted ? "Unmute" : "Mute"}
        />
        <ControlButton 
          icon={isVideoOff ? VideoOff : Video} 
          onClick={handleToggleVideo} 
          active={isVideoOff}
          label={isVideoOff ? "Start Video" : "Stop Video"}
        />
      </div>

      <div className="flex items-center gap-3">
        <ControlButton 
          icon={ScreenShare} 
          onClick={handleShareScreen} 
          active={isSharing}
          label="Share Screen"
        />
        <ControlButton 
          icon={Hand} 
          onClick={() => setIsHandRaised(!isHandRaised)} 
          active={isHandRaised}
          label="Raise Hand"
        />
        <ControlButton 
          icon={MessageSquare} 
          onClick={() => onToggleSidebar('chat')} 
          label="Chat"
        />
        <ControlButton 
          icon={Users} 
          onClick={() => onToggleSidebar('participants')} 
          label="Participants"
        />
        <ControlButton 
          icon={Settings} 
          onClick={() => {}} 
          label="Settings"
        />
      </div>

      <div className="pl-4 border-l border-white/10">
        <ControlButton 
          icon={PhoneOff} 
          onClick={onLeave} 
          danger 
          label="End Call"
        />
      </div>
    </div>
  );
};

export default Controls;
