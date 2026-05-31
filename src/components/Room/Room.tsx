'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAgora } from '@/hooks/useAgora';
import VideoGrid from './VideoGrid';
import Controls from './Controls';
import Sidebar from './Sidebar';

const Room = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomID = params.roomID as string;
  const userName = searchParams.get('name') || 'Anonymous';
  
  const {
    localVideoTrack,
    remoteUsers,
    toggleAudio,
    toggleVideo,
    shareScreen,
  } = useAgora(roomID, userName);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'participants'>('chat');
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!searchParams.get('name')) {
      router.push(`/?join=${roomID}`);
    }
  }, [searchParams, router, roomID]);

  const handleSendMessage = (text: string) => {
    // Agora RTC doesn't handle chat. 
    // For a full serverless experience on Vercel, 
    // you could use Agora RTM or a service like Pusher/Ably.
    console.log("Chat message (not implemented in Agora RTC):", text);
    const msgData = {
      text,
      senderName: userName,
      timestamp: new Date().toISOString(),
      isMe: true
    };
    setMessages((prev) => [...prev, msgData]);
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
          <VideoGrid 
            remoteUsers={remoteUsers} 
            localVideoTrack={localVideoTrack} 
            localName={userName} 
          />
        </div>

        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          activeTab={sidebarTab}
          peers={remoteUsers.map(u => ({ peerID: u.uid.toString(), peerName: u.uid.toString() }))}
          messages={messages}
          onSendMessage={handleSendMessage}
          localName={userName}
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
