# 🎄 Santa Gacha - Secret Santa App

A festive, animated web application for managing Secret Santa gift exchanges. Participants join via a link, add their wishlist, and then use a virtual Gacha machine to draw their match!

## 🚀 Quick Start Guide

### 1. The Host (Admin Dashboard)

- **URL:** `/#/participants`
- **Purpose:** This is your control center.
- **What to do here:**
  1.  Check the **Stats** (how many people joined).
  2.  Open **Settings** to set the **Target Count** (the machine stays locked until this number is reached).
  3.  Click the **"Invite"** or **"Copy Link"** button to send the join link to your group chat (WhatsApp, Telegram, etc.).
  4.  You can also **Simulate** the draw to test the machine animation.

### 2. The Guests (Joining)

- **URL:** `/#/join` (This is the link you copy from the Admin page)
- **Purpose:** For friends to sign up.
- **Action:**
  1.  Enter **Name**.
  2.  Enter **Wishlist** (e.g., "I like sci-fi books").
  3.  **Crucial:** Create a **4-digit PIN**. (They need this PIN to unlock their result later!).

### 3. The Main Event (Gacha Draw)

- **URL:** `/#/gacha`
- **Purpose:** The fun part!
- **Action:**
  1.  Once the target count is reached, the workshop unlocks.
  2.  Select your **Name** from the list.
  3.  Enter your **PIN** to verify identity.
  4.  Turn the knob to spin the machine and reveal your Secret Santa match!
  5.  The result is saved privately; you can log in again later to view it.

---

## 🛠 Setup & Deployment

### 1. Backend (MockAPI)

This app uses a free MockAPI backend to store data.

1. Go to [mockapi.io](https://mockapi.io) and create a project.
2. Create two resources:
   - **participants** (Fields: `name`, `wishlist`, `pin`, `isClaimed` (boolean), `drawnMatchId`)
   - **settings** (Fields: `targetCount` (number), `eventSummary`)
3. Copy your API Endpoint URL (e.g., `https://670b...mockapi.io/api/v1`).

### 2. Deployment (Vercel)

1. Import this repository to Vercel.
2. Go to **Settings > Environment Variables**.
3. Add `VITE_API_URL` with your MockAPI URL as the value.
4. **Important:** Go to **Deployment Protection** and disable "Vercel Authentication" so your friends can access it without logging in.

---

## 📂 Project Structure

- **`/pages/ParticipantsPage`**: Admin dashboard and list view.
- **`/pages/JoinPage`**: Form for adding new users.
- **`/pages/GachaPage`**: The animated simulator and draw logic.
- **`/components/ArcadeMachine`**: The core CSS/Framer Motion animation component.
- **`api.ts`**: Handles connection to MockAPI.

## 🎨 Credits

Built with React, Tailwind CSS, Framer Motion, and HeroIcons.
