'use client';

import React, { useState } from 'react';
import { X, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'chat' | 'participants';
  peers: { peerID: string; peerName: string }[];
  messages: any[];
  onSendMessage: (text: string) => void;
  localName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  peers,
  messages,
  onSendMessage,
  localName
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 bottom-0 w-80 bg-zinc-900 border-l border-white/10 shadow-2xl z-40 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white capitalize">
              {activeTab}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'participants' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {localName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-white">{localName} (You)</span>
                </div>
                {peers.map((peer) => (
                  <div key={peer.peerID} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold text-sm">
                      {peer.peerName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-zinc-300">{peer.peerName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-4 mb-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-zinc-500 text-sm">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                          msg.isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1">
                          {msg.senderName || 'User'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-zinc-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button 
                    type="submit"
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
