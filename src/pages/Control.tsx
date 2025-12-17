import { useFirestore, useFirestoreCollectionData } from "reactfire";
import {
  collection,
  doc,
  updateDoc,
  setDoc,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { useState } from "react";

// Create 20 participants (5 per session)
const seedData = [
  // Session 1
  {
    id: "p1",
    name: "VO-ICE 这甜蜜大家庭",
    session: 1,
    votes: 0,
    cluster: "voice",
  },
  {
    id: "p2",
    name: "Tan Jia Inn",
    session: 1,
    votes: 0,
    cluster: "move",
  },
  {
    id: "p3",
    name: "宋宁 Eliya Shoong Ning",
    session: 1,
    votes: 0,
    cluster: "move",
  },
  {
    id: "p4",
    name: "梁媛芝 Leong Yune Zi",
    session: 1,
    votes: 0,
    cluster: "voice",
  },
  {
    id: "p5",
    name: "卢怡萱 Goh Yi Xuan",
    session: 1,
    votes: 0,
    cluster: "move",
  },
  {
    id: "p6",
    name: "官喬㜯 Princella Gisselle Kuan",
    session: 1,
    votes: 0,
    cluster: "heart",
  },
  {
    id: "p7",
    name: "罗一杰 Low Ee Jay",
    session: 1,
    votes: 0,
    cluster: "mind",
  },
  // Session 2
  {
    id: "p8",
    name: "郑宇胜 Teh Yi Shern",
    session: 2,
    votes: 0,
    cluster: "move",
  },
  {
    id: "p9",
    name: "Cycle",
    session: 2,
    votes: 0,
    cluster: "move",
  },
  {
    id: "p10",
    name: "Eternity Girl",
    session: 2,
    votes: 0,
    cluster: "mind",
  },
  {
    id: "p11",
    name: "雙影忍者 Twin Ninjas",
    session: 2,
    votes: 0,
    cluster: "move",
  },
  {
    id: "p12",
    name: "黄子辰 Wee Zee Chen",
    session: 2,
    votes: 0,
    cluster: "voice",
  },
  {
    id: "p13",
    name: "4VE",
    session: 2,
    votes: 0,
    cluster: "heart,voice",
  },
];

export default function Control() {
  const firestore = useFirestore();
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  // Get voting config
  const configRef = collection(firestore, "config");
  const { data: configData } = useFirestoreCollectionData(configRef, {
    initialData: [],
    idField: "id",
  });

  const config = configData?.[0] || { isOpen: false, currentSession: 1 };
  const configDocId = configData?.[0]?.id || "voting";

  const toggleVoting = async () => {
    const configDocRef = doc(firestore, "config", configDocId);
    await updateDoc(configDocRef, {
      isOpen: !config.isOpen,
    });
  };

  const toggleShowResults = async () => {
    const configDocRef = doc(firestore, "config", configDocId);
    await updateDoc(configDocRef, {
      showResults: !config.showResults,
    });
  };

  const changeSession = async (sessionNumber: number) => {
    const configDocRef = doc(firestore, "config", configDocId);
    await updateDoc(configDocRef, {
      currentSession: sessionNumber,
      isOpen: false, // Close voting when changing sessions
    });
  };

  const saveAndCloseSession = async () => {
    setSaving(true);
    try {
      // Get current session participants
      const participantsRef = collection(firestore, "participants");
      const participantsQuery = query(
        participantsRef,
        where("session", "==", config.currentSession)
      );
      const snapshot = await getDocs(participantsQuery);

      const participants = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        votes: doc.data().votes || 0,
      }));

      // Save to sessions collection
      const sessionResultRef = doc(
        firestore,
        "sessions",
        `session_${config.currentSession}`
      );
      await setDoc(sessionResultRef, {
        sessionNumber: config.currentSession,
        timestamp: new Date().toISOString(),
        participants,
      });

      // Close voting
      const configDocRef = doc(firestore, "config", configDocId);
      await updateDoc(configDocRef, {
        isOpen: false,
      });

      alert(`Session ${config.currentSession} saved successfully!`);
    } catch (error) {
      console.error("Error saving session:", error);
      alert("Failed to save session");
    } finally {
      setSaving(false);
    }
  };

  const resetCurrentSession = async () => {
    if (
      !confirm("Reset all votes for current session? This cannot be undone.")
    ) {
      return;
    }

    try {
      const participantsRef = collection(firestore, "participants");
      const participantsQuery = query(
        participantsRef,
        where("session", "==", config.currentSession)
      );
      const snapshot = await getDocs(participantsQuery);

      const updates = snapshot.docs.map((doc) =>
        updateDoc(doc.ref, { votes: 0 })
      );
      await Promise.all(updates);

      alert("Session votes reset!");
    } catch (error) {
      console.error("Error resetting votes:", error);
    }
  };

  const cleanAndSeedDatabase = async () => {
    if (
      !confirm(
        "⚠️ DESTRUCTIVE ACTION ⚠️\n\nThis will:\n1. DELETE all participants\n2. DELETE all saved sessions\n3. Create fresh seed data\n\nThis cannot be undone. Continue?"
      )
    ) {
      return;
    }

    setCleaning(true);
    try {
      // Step 1: Delete all participants
      const participantsSnapshot = await getDocs(
        collection(firestore, "participants")
      );
      const deleteBatch1 = writeBatch(firestore);
      participantsSnapshot.docs.forEach((doc) => deleteBatch1.delete(doc.ref));
      await deleteBatch1.commit();

      // Step 2: Delete all sessions
      const sessionsSnapshot = await getDocs(collection(firestore, "sessions"));
      const deleteBatch2 = writeBatch(firestore);
      sessionsSnapshot.docs.forEach((doc) => deleteBatch2.delete(doc.ref));
      await deleteBatch2.commit();

      // Step 3: Seed fresh data
      const batch = writeBatch(firestore);

      // Create config document
      const configRef = doc(firestore, "config", "voting");
      batch.set(configRef, {
        isOpen: false,
        currentSession: 1,
        showResults: false,
      });

      seedData.forEach((participant) => {
        const participantRef = doc(firestore, "participants", participant.id);
        batch.set(participantRef, {
          name: participant.name,
          session: participant.session,
          votes: participant.votes,
          cluster: participant.cluster,
        });
      });

      await batch.commit();

      alert(
        "Database cleaned and seeded successfully! ✅\n\n- All old data deleted\n- Config created\n- 20 participants created"
      );
    } catch (error) {
      console.error("Error cleaning and seeding database:", error);
      alert("Failed to clean and seed database. Check console for errors.");
    } finally {
      setCleaning(false);
    }
  };

  const seedDatabase = async () => {
    if (
      !confirm(
        "This will create all initial data (config + 20 participants). Existing data will be overwritten. Continue?"
      )
    ) {
      return;
    }

    setSeeding(true);
    try {
      const batch = writeBatch(firestore);

      // Create config document
      const configRef = doc(firestore, "config", "voting");
      batch.set(configRef, {
        isOpen: false,
        currentSession: 1,
        showResults: false,
      });

      seedData.forEach((participant) => {
        const participantRef = doc(firestore, "participants", participant.id);
        batch.set(participantRef, {
          name: participant.name,
          session: participant.session,
          votes: participant.votes,
          cluster: participant.cluster,
        });
      });

      await batch.commit();

      alert(
        "Database seeded successfully! ✅\n\n- Config created\n- 20 participants created\n\nYou can now customize participant names in Firebase Console."
      );
    } catch (error) {
      console.error("Error seeding database:", error);
      alert("Failed to seed database. Check console for errors.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Voting Control Panel
        </h1>

        {/* Status Card */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Voting Status</h2>
              <p className="text-blue-200">Session {config.currentSession}</p>
            </div>
            <div className="flex gap-2">
              <div
                className={`px-4 py-1 rounded-full font-bold text-sm ${
                  config.isOpen
                    ? "bg-green-500 text-white animate-pulse"
                    : "bg-red-500 text-white"
                }`}
              >
                {config.isOpen ? "OPEN" : "CLOSED"}
              </div>
              <div
                className={`px-4 py-1 rounded-full font-bold text-sm ${
                  config.showResults
                    ? "bg-blue-500 text-white animate-pulse"
                    : "bg-gray-500 text-white"
                }`}
              >
                {config.showResults ? "SHOWING" : "HIDDEN"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={toggleVoting}
              className={`py-2.5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 ${
                config.isOpen
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {config.isOpen ? "Close Voting" : "Open Voting"}
            </button>

            <button
              onClick={toggleShowResults}
              className={`py-2.5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 ${
                config.showResults
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {config.showResults ? "Hide Results" : "Show Results"}
            </button>
          </div>
        </div>

        {/* Session Selection */}
        <div className="bg-slate-800 rounded-2xl p-4 mb-4 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-2">Select Session</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            {[1, 2].map((session) => (
              <button
                key={session}
                onClick={() => changeSession(session)}
                disabled={config.isOpen}
                className={`py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  config.currentSession === session
                    ? "bg-blue-600 text-white ring-2 ring-blue-400"
                    : "bg-slate-700 hover:bg-slate-600 text-white"
                }`}
              >
                Session {session}
              </button>
            ))}
          </div>
          {config.isOpen && (
            <p className="text-yellow-400 text-sm mt-4 text-center">
              Close voting to change sessions
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-slate-800 rounded-2xl p-4 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-2">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={saveAndCloseSession}
              disabled={saving || config.isOpen}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              {saving ? "Saving..." : "💾 Save & Close Session"}
            </button>

            <button
              onClick={resetCurrentSession}
              disabled={config.isOpen}
              className="w-full py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              Reset Current Session Votes
            </button>
          </div>
        </div>

        {/* Database Setup */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border-2 border-yellow-500">
          <h2 className="text-2xl font-bold text-white mb-2">Database Setup</h2>
          <p className="text-sm text-yellow-200 mb-4">
            ⚠️ Use this to initialize the database on first setup
          </p>

          <div className="space-y-3">
            <button
              onClick={seedDatabase}
              disabled={seeding || cleaning}
              className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              {seeding
                ? "Seeding Database..."
                : "🌱 Seed Database (Update/Create)"}
            </button>
            <p className="text-xs text-gray-400">
              Updates existing participants or creates new ones. Does not delete
              old data.
            </p>

            <button
              onClick={cleanAndSeedDatabase}
              disabled={seeding || cleaning}
              className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              {cleaning
                ? "Cleaning & Seeding..."
                : "🗑️ Clean & Seed (Delete All First)"}
            </button>
            <p className="text-xs text-red-300">
              ⚠️ DESTRUCTIVE: Deletes all participants and sessions, then
              creates fresh data.
            </p>
          </div>
        </div>

        {/* Quick Links */}
      </div>
    </div>
  );
}
