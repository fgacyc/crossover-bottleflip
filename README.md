# Talent Show Voting Application

A real-time voting application for talent shows with 4 sessions of 5 participants each (20 total participants).

## 🎯 Features

- **Real-time Voting**: Live vote counting with Firebase Firestore
- **Session Management**: 4 separate voting sessions (5 participants each)
- **Locked Voting**: Control when audience can vote
- **Results Display**: Live leaderboard with rankings
- **Session Archives**: Save results after each session
- **Responsive Design**: Works on desktop and mobile

## 📱 Pages

### 1. Results Page (`/results`)
- Displays current session's voting results
- Highest votes appear at the top
- Shows rank badges for top 3
- Updates in real-time

### 2. Vote Page (`/vote`)
- Public-facing page for audience voting
- Locked when voting is closed
- One-click voting for each participant
- Shows current vote counts

### 3. Control Page (`/control`)
- Admin panel for managing voting
- Toggle voting on/off
- Switch between sessions (1-4)
- Save session results
- Reset votes for current session

## 🚀 Quick Start

### 1. Install Dependencies
```bash
yarn install
```

### 2. Configure Firebase

Update your `.env.local` with Firebase credentials:
```env
VITE_API_KEY=your-api-key
VITE_AUTH_DOMAIN=your-auth-domain
VITE_PROJECT_ID=your-project-id
VITE_STORAGE_BUCKET=your-storage-bucket
VITE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_APP_ID=your-app-id
```

### 3. Initialize Firebase Data

Follow the instructions in `FIREBASE_INIT.md` to create the required Firestore collections:
- `config`: Voting state configuration
- `participants`: 20 participants across 4 sessions

### 4. Run the Application
```bash
yarn dev
```

### 5. Deploy
```bash
yarn build
```

## 📊 Firestore Structure

### Collections

**`config`**
```json
{
  "isOpen": false,
  "currentSession": 1
}
```

**`participants`**
```json
{
  "name": "Participant Name",
  "session": 1,
  "votes": 0
}
```

**`sessions`** (auto-created when saving)
```json
{
  "sessionNumber": 1,
  "timestamp": "2024-01-01T12:00:00Z",
  "participants": [...]
}
```

## 🎭 Workflow

1. **Setup**: Initialize Firebase data (see `FIREBASE_INIT.md`)
2. **Pre-Event**: Customize participant names in Firebase Console
3. **During Event**:
   - Go to `/control`
   - Select Session 1
   - Click "Open Voting"
   - Display `/results` on a projector/screen
   - Share `/vote` link with audience (QR code recommended)
   - Monitor votes in real-time
   - Close voting when done
   - Save session results
   - Move to next session
4. **Post-Event**: Review saved sessions in Firestore

## 🎨 Customization

### Participant Names
Edit in Firebase Console > `participants` collection

### Colors
Modify in `src/utils.ts` - uses session-based colors:
- Session 1: Yellow theme
- Session 2: Green theme
- Session 3: Blue theme
- Session 4: Red theme

### Ranking Badges
Edit in `src/pages/Results.tsx` and `src/pages/Vote.tsx`

## 🔒 Security

Current setup allows public voting. For production:

1. Update Firestore Rules (see `SETUP.md`)
2. Add authentication for control panel
3. Implement vote limiting (one vote per user)
4. Add rate limiting

## 📦 Tech Stack

- React + TypeScript
- Firebase Firestore
- ReactFire (Firebase React bindings)
- React Router
- Tailwind CSS
- Vite

## 🤝 Contributing

This is a custom talent show voting application. Customize as needed for your event!

## 📄 License

MIT
