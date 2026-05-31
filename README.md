# Vision - Professional Video Calling Platform

Vision is a high-performance, real-time video calling website built with Next.js, WebRTC, and Socket.io. It features a premium, corporate-grade UI/UX designed for seamless communication.

## 🏗 System Architecture

The application follows a client-server architecture for signaling and a peer-to-peer architecture for media streams:

1.  **Signaling Server (Node.js/Socket.io)**: Acts as a broker to exchange WebRTC offers, answers, and ICE candidates between participants.
2.  **Frontend (Next.js)**: Manages the UI, local media streams, and WebRTC peer connections using `simple-peer`.
3.  **Media Flow (WebRTC)**: Once signaling is complete, audio/video data flows directly between users (P2P), ensuring low latency and high quality.

### Folder Structure

```text
├── server/                 # Signaling Server
│   └── index.js            # Node.js + Socket.io logic
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── room/[id]/      # Meeting Room page
│   │   └── page.tsx        # Landing/Join page
│   ├── components/         # UI Components
│   │   └── Room/           # VideoGrid, Controls, Sidebar, etc.
│   ├── context/            # Global Socket Context
│   ├── hooks/              # WebRTC & Media logic (useWebRTC)
│   └── lib/                # Utilities (Tailwind merge, etc.)
├── public/                 # Static assets
└── package.json            # Dependencies & Scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 1. Install Dependencies

Run the following command in the root directory:

```bash
npm install
```

### 2. Start the Signaling Server

In a new terminal, run:

```bash
npm run server
```

The server will start on `http://localhost:8000`.

### 3. Start the Frontend

In another terminal, run:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🛠 Core Implementation Details

- **WebRTC Management**: Handled via a custom `useWebRTC` hook that manages peer connections, stream swaps for screen sharing, and device switching.
- **Dynamic Layout**: The `VideoGrid` component uses a responsive CSS grid that adjusts based on the number of active participants.
- **Signaling**: Socket.io handles `join-room`, `sending-signal`, and `returning-signal` events to establish P2P connections.

## 🔒 Production Considerations

For a production-ready deployment, consider:

1.  **STUN/TURN Servers**: Essential for P2P connections to work across different network configurations (firewalls, NATs).
2.  **SFU (Selective Forwarding Unit)**: For large meetings (10+ participants), a P2P mesh network becomes bandwidth-intensive. Services like **Agora.io**, **Daily.co**, or self-hosted solutions like **Mediasoup** are recommended.
3.  **Authentication**: Secure room access with JWT or OAuth.
