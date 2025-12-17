# Quick Firebase Initialization

## Option 1: Manual Setup (Firebase Console)

Follow the instructions in `SETUP.md` to manually create each document.

## Option 2: Script to Copy-Paste (Firebase Console)

Go to Firebase Console > Firestore Database > Start collection

### 1. Create `config` collection:
- Collection ID: `config`
- Document ID: `voting`
- Add fields:
  - `isOpen` (boolean): false
  - `currentSession` (number): 1

### 2. Create `participants` collection:

You'll need to create 20 documents. Here are the details:

**Document IDs and Data:**

| Doc ID | name | session | votes |
|--------|------|---------|-------|
| p1 | Participant 1 | 1 | 0 |
| p2 | Participant 2 | 1 | 0 |
| p3 | Participant 3 | 1 | 0 |
| p4 | Participant 4 | 1 | 0 |
| p5 | Participant 5 | 1 | 0 |
| p6 | Participant 6 | 2 | 0 |
| p7 | Participant 7 | 2 | 0 |
| p8 | Participant 8 | 2 | 0 |
| p9 | Participant 9 | 2 | 0 |
| p10 | Participant 10 | 2 | 0 |
| p11 | Participant 11 | 3 | 0 |
| p12 | Participant 12 | 3 | 0 |
| p13 | Participant 13 | 3 | 0 |
| p14 | Participant 14 | 3 | 0 |
| p15 | Participant 15 | 3 | 0 |
| p16 | Participant 16 | 4 | 0 |
| p17 | Participant 17 | 4 | 0 |
| p18 | Participant 18 | 4 | 0 |
| p19 | Participant 19 | 4 | 0 |
| p20 | Participant 20 | 4 | 0 |

**IMPORTANT:** You can customize the participant names to match your actual talent show participants!

## Testing the Setup

1. Visit `/control` - you should see Session 1 selected and voting closed
2. Click "Open Voting"
3. Visit `/vote` - you should see 5 participants for Session 1
4. Click on any participant to vote
5. Visit `/results` - you should see the votes reflected
6. Go back to `/control` and close voting
7. Click "Save & Close Session"
8. Change to Session 2
9. Repeat!

## Updating Participant Names

To change participant names to real names:
1. Go to Firebase Console > Firestore Database
2. Click on `participants` collection
3. Click on each document (p1, p2, etc.)
4. Edit the `name` field
5. Save

Or bulk edit via Firebase Console's batch operations or use a script if you have many to change.






