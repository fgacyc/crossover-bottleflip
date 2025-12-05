# Talent Show Voting App - Setup Guide

## Firebase Collections Structure

### 1. `config` Collection
Single document (ID: `voting`) with:
```json
{
  "isOpen": false,
  "currentSession": 1
}
```

### 2. `participants` Collection
20 documents (5 per session), example structure:
```json
{
  "name": "Participant Name",
  "session": 1,
  "votes": 0
}
```

**Document IDs:** `p1`, `p2`, `p3`, ..., `p20`

**Session Distribution:**
- Session 1: p1-p5
- Session 2: p6-p10
- Session 3: p11-p15
- Session 4: p16-p20

### 3. `sessions` Collection
Created automatically when saving sessions. Example:
```json
{
  "sessionNumber": 1,
  "timestamp": "2024-01-01T12:00:00Z",
  "participants": [
    { "id": "p1", "name": "Participant 1", "votes": 15 },
    ...
  ]
}
```

## Initial Setup Script

Run this in Firebase Console > Firestore > Start Collection:

### Create Config Document:
1. Collection ID: `config`
2. Document ID: `voting`
3. Fields:
   - `isOpen` (boolean): `false`
   - `currentSession` (number): `1`

### Create Participants:
For each participant (p1 through p20), create documents in `participants` collection:

**Session 1:**
- p1: { name: "Participant 1", session: 1, votes: 0 }
- p2: { name: "Participant 2", session: 1, votes: 0 }
- p3: { name: "Participant 3", session: 1, votes: 0 }
- p4: { name: "Participant 4", session: 1, votes: 0 }
- p5: { name: "Participant 5", session: 1, votes: 0 }

**Session 2:**
- p6: { name: "Participant 6", session: 2, votes: 0 }
- p7: { name: "Participant 7", session: 2, votes: 0 }
- p8: { name: "Participant 8", session: 2, votes: 0 }
- p9: { name: "Participant 9", session: 2, votes: 0 }
- p10: { name: "Participant 10", session: 2, votes: 0 }

**Session 3:**
- p11: { name: "Participant 11", session: 3, votes: 0 }
- p12: { name: "Participant 12", session: 3, votes: 0 }
- p13: { name: "Participant 13", session: 3, votes: 0 }
- p14: { name: "Participant 14", session: 3, votes: 0 }
- p15: { name: "Participant 15", session: 3, votes: 0 }

**Session 4:**
- p16: { name: "Participant 16", session: 4, votes: 0 }
- p17: { name: "Participant 17", session: 4, votes: 0 }
- p18: { name: "Participant 18", session: 4, votes: 0 }
- p19: { name: "Participant 19", session: 4, votes: 0 }
- p20: { name: "Participant 20", session: 4, votes: 0 }

## Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read
    match /{document=**} {
      allow read: if true;
    }
    
    // Only allow writes to participants votes
    match /participants/{participantId} {
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['votes']);
    }
    
    // Only allow writes to config and sessions from control panel
    // (In production, you'd want proper authentication here)
    match /config/{configId} {
      allow write: if true;
    }
    
    match /sessions/{sessionId} {
      allow write: if true;
    }
  }
}
```

## Pages

1. **Results** (`/results`): Shows current session voting results
2. **Vote** (`/vote`): Public voting page (locked when `isOpen` is false)
3. **Control** (`/control`): Admin panel to manage sessions

## Workflow

1. Go to `/control`
2. Select current session (1-4)
3. Click "Open Voting"
4. Share `/vote` link with audience
5. Audience votes
6. View live results at `/results`
7. Click "Close Voting"
8. Click "Save & Close Session"
9. Move to next session
10. Repeat steps 3-9

## Notes

- Saved session data is stored in `sessions` collection
- Votes can be reset for current session
- Voting must be closed to change sessions
- Results show highest votes at the top

