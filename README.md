# Vision - Professional Video Calling Platform (Vercel Ready)

Vision is a high-performance, real-time video calling website built with Next.js and Agora RTC. It is designed to be hosted entirely on Vercel without the need for external signaling servers.

## 🏗 System Architecture

The application uses **Agora RTC** for high-quality, low-latency video and audio communication. By using a managed cloud provider like Agora, the entire application remains "serverless" from your perspective and can be deployed to Vercel in one click.

- **Frontend**: Next.js (App Router)
- **RTC**: Agora RTC SDK
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- An Agora account ([Sign up here](https://console.agora.io/))

### 1. Setup Environment Variables

Create a `.env.local` file in the root directory and add your Agora App ID:

```bash
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📦 Deployment to Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Add `NEXT_PUBLIC_AGORA_APP_ID` as an Environment Variable in the Vercel dashboard.
4. Deploy!

## 🛠 Key Features

- **Instant Meetings**: Create unique room IDs instantly.
- **Hardware Preview**: Test your camera and mic before joining.
- **Screen Sharing**: Switch between webcam and screen sharing seamlessly.
- **Responsive Grid**: Dynamic layout that adapts to any number of participants.
- **Premium UI**: Dark-themed, corporate-grade design using Tailwind and Framer Motion.
