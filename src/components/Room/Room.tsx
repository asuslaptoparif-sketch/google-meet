'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWebRTC } from '@/hooks/useWebRTC';
import VideoGrid from './VideoGrid';
import Controls from './Controls';
import Sidebar from './Sidebar';
import { useSocket } from '@/context/SocketContext';

const Room = () => {
  const params = useParams();
  const router = useRouter();
  const roomID = params.roomID as string;
  const { socket } = useSocket();
  
  const {
    peers,
    localVideoRef,
    toggleAudio,
    toggleVideo,
    shareScreen,
  } = useWebRTC(roomID);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'participants'>('chat');
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data: any) => {
      setMessages((prev) => [...prev, { ...data, isMe: false }]);
    };

    socket.on('receive-message', handleMessage);
    return () => {
      socket.off('receive-message', handleMessage);
    };
  }, [socket]);

  const handleSendMessage = (text: string) => {
    if (socket) {
      const msgData = {
        text,
        senderName: 'You',
        timestamp: new Date().toISOString(),
      };
      socket.emit('send-message', msgData);
      setMessages((prev) => [...prev, { ...msgData, isMe: true }]);
    }
  };

  const handleLeave = () => {
    router.push('/');
  };

  const toggleSidebar = (tab: 'chat' | 'participants') => {
    if (sidebarOpen && sidebarTab === tab) {
      setSidebarOpen(false);
    } else {
      setSidebarTab(tab);
      setSidebarOpen(true);
    }
  };

  return (
    <div className="h-screen w-screen bg-zinc-950 flex flex-col overflow-hidden text-white font-sans">
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-bold text-xl italic">V</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight">Vision Call</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Room: {roomID}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        <div className={`flex-1 transition-all duration-500 ease-in-out ${sidebarOpen ? 'mr-80' : 'mr-0'}`}>
          <VideoGrid peers={peers} localVideoRef={localVideoRef} />
        </div>

        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          activeTab={sidebarTab}
          peers={peers}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Control Bar */}
      <Controls 
        onToggleAudio={toggleAudio} 
        onToggleVideo={toggleVideo} 
        onShareScreen={shareScreen} 
        onLeave={handleLeave}
        onToggleSidebar={toggleSidebar}
      />
    </div>
  );
};

export default Room;
