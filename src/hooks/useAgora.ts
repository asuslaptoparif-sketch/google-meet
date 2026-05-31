'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AgoraRTC, { 
  IAgoraRTCClient, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
  ILocalVideoTrack
} from 'agora-rtc-sdk-ng';

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";

export const useAgora = (roomID: string, userName: string) => {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | ILocalVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const screenTrackRef = useRef<ILocalVideoTrack | null>(null);

  useEffect(() => {
    if (!APP_ID) {
      console.error("Agora App ID is missing. Please set NEXT_PUBLIC_AGORA_APP_ID in your environment variables.");
      return;
    }

    const init = async () => {
      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      
      agoraClient.on("user-published", async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteUsers((prev) => [...prev.filter(u => u.uid !== user.uid), user]);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      agoraClient.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "video") {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        }
      });

      agoraClient.on("user-left", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      try {
        // In a real app, you should fetch a token from your server
        // For testing, we use null for the token
        await agoraClient.join(APP_ID, roomID, null, null);
        
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);
        
        await agoraClient.publish([audioTrack, videoTrack]);
        setClient(agoraClient);
      } catch (error) {
        console.error("Agora join failed:", error);
      }
    };

    init();

    return () => {
      localAudioTrack?.close();
      localVideoTrack?.close();
      screenTrackRef.current?.close();
      client?.leave();
    };
  }, [roomID]);

  const toggleAudio = useCallback(async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!localAudioTrack.enabled);
    }
  }, [localAudioTrack]);

  const toggleVideo = useCallback(async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!localVideoTrack.enabled);
    }
  }, [localVideoTrack]);

  const shareScreen = useCallback(async () => {
    if (!client) return;

    try {
      if (!isScreenSharing) {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({}, "auto");
        screenTrackRef.current = screenTrack;
        
        if (localVideoTrack) {
          await client.unpublish(localVideoTrack);
        }
        
        await client.publish(screenTrack);
        setLocalVideoTrack(screenTrack);
        setIsScreenSharing(true);

        screenTrack.on("track-ended", () => {
          stopScreenShare();
        });
      } else {
        await stopScreenShare();
      }
    } catch (error) {
      console.error("Screen share failed:", error);
    }
  }, [client, isScreenSharing, localVideoTrack]);

  const stopScreenShare = useCallback(async () => {
    if (!client || !screenTrackRef.current) return;

    try {
      await client.unpublish(screenTrackRef.current);
      screenTrackRef.current.close();
      screenTrackRef.current = null;

      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      setLocalVideoTrack(videoTrack);
      await client.publish(videoTrack);
      setIsScreenSharing(false);
    } catch (error) {
      console.error("Stop screen share failed:", error);
    }
  }, [client]);

  return {
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    toggleAudio,
    toggleVideo,
    shareScreen,
    isScreenSharing,
  };
};
