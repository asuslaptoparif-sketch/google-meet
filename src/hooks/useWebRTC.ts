'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type Peer from 'simple-peer';
import { useSocket } from '@/context/SocketContext';

interface PeerRef {
  peerID: string;
  peerName: string;
  peer: any;
}

export const useWebRTC = (roomID: string, userName: string) => {
  const { socket } = useSocket();
  const [peers, setPeers] = useState<PeerRef[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const peersRef = useRef<PeerRef[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const createPeer = useCallback(async (userToSignal: string, callerID: string, callerName: string, stream: MediaStream) => {
    const Peer = (await import('simple-peer')).default;
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal: any) => {
      socket?.emit('sending-signal', { userToSignal, callerID, callerName, signal });
    });

    return peer;
  }, [socket]);

  const addPeer = useCallback(async (incomingSignal: any, callerID: string, stream: MediaStream) => {
    const Peer = (await import('simple-peer')).default;
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket?.emit('returning-signal', { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        socket.emit('join-room', { roomID, userName });

        const availableDevices = await navigator.mediaDevices.enumerateDevices();
        setDevices(availableDevices);

        socket.on('all-users', async (users: { id: string, name: string }[]) => {
          const peers: PeerRef[] = [];
          for (const user of users) {
            const peer = await createPeer(user.id, socket.id!, userName, stream);
            peersRef.current.push({ peerID: user.id, peerName: user.name, peer });
            peers.push({ peerID: user.id, peerName: user.name, peer });
          }
          setPeers(peers);
        });

        socket.on('user-joined', async (payload: { signal: any; callerID: string; callerName: string }) => {
          const peer = await addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({ peerID: payload.callerID, peerName: payload.callerName, peer });
          setPeers((prev) => [...prev, { peerID: payload.callerID, peerName: payload.callerName, peer }]);
        });

        socket.on('receiving-returned-signal', (payload: { signal: Peer.SignalData; id: string }) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          if (item) {
            item.peer.signal(payload.signal);
          }
        });

        socket.on('user-left', (id: string) => {
          const peerObj = peersRef.current.find((p) => p.peerID === id);
          if (peerObj) {
            peerObj.peer.destroy();
          }
          const peers = peersRef.current.filter((p) => p.peerID !== id);
          peersRef.current = peers;
          setPeers(peers);
        });
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    };

    init();

    return () => {
      socket.off('all-users');
      socket.off('user-joined');
      socket.off('receiving-returned-signal');
      socket.off('user-left');
      localStream?.getTracks().forEach(track => track.stop());
      peersRef.current.forEach(p => p.peer.destroy());
    };
  }, [roomID, socket, createPeer, addPeer]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }, [localStream]);

  const shareScreen = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        localStream.removeTrack(videoTrack);
        localStream.addTrack(screenTrack);
        
        // Update local video ref
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // Replace track in all peers
        peersRef.current.forEach(({ peer }) => {
          peer.replaceTrack(videoTrack, screenTrack, localStream);
        });

        screenTrack.onended = () => {
          stopScreenShare(screenTrack, videoTrack);
        };
      }
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  }, [localStream]);

  const stopScreenShare = useCallback(async (screenTrack: MediaStreamTrack, oldVideoTrack: MediaStreamTrack) => {
    try {
      // Re-enable the old webcam track or get a new one
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const newVideoTrack = stream.getVideoTracks()[0];

      if (localStream) {
        localStream.removeTrack(screenTrack);
        localStream.addTrack(newVideoTrack);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        peersRef.current.forEach(({ peer }) => {
          peer.replaceTrack(screenTrack, newVideoTrack, localStream);
        });
      }
      screenTrack.stop();
    } catch (err) {
      console.error('Error stopping screen share:', err);
    }
  }, [localStream]);

  const changeDevice = useCallback(async (type: 'videoinput' | 'audioinput', deviceId: string) => {
    try {
      const constraints = {
        [type === 'videoinput' ? 'video' : 'audio']: { deviceId: { exact: deviceId } },
        [type === 'videoinput' ? 'audio' : 'video']: true,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      const newTrack = type === 'videoinput' ? newStream.getVideoTracks()[0] : newStream.getAudioTracks()[0];

      if (localStream) {
        const oldTrack = type === 'videoinput' ? localStream.getVideoTracks()[0] : localStream.getAudioTracks()[0];
        localStream.removeTrack(oldTrack);
        localStream.addTrack(newTrack);

        if (localVideoRef.current && type === 'videoinput') {
          localVideoRef.current.srcObject = localStream;
        }

        peersRef.current.forEach(({ peer }) => {
          peer.replaceTrack(oldTrack, newTrack, localStream);
        });
      }
    } catch (err) {
      console.error('Error changing device:', err);
    }
  }, [localStream]);

  return {
    peers,
    localStream,
    localVideoRef,
    toggleAudio,
    toggleVideo,
    shareScreen,
    changeDevice,
    devices,
  };
};

export type DeviceType = 'videoinput' | 'audioinput';

async function getConnectedDevices(type: DeviceType) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === type);
}
