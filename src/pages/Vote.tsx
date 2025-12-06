import { useFirestore, useFirestoreCollectionData } from "reactfire";
import {
  collection,
  doc,
  increment,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { TiTick } from "react-icons/ti";

export default function Vote() {
  const [selectedParticipant, setSelectedParticipant] = useState<string[]>([]);
  const [sessionsVoted, setSessionsVoted] = useState<number[]>([]);
  const [clicked, setClicked] = useState(false);
  const firestore = useFirestore();

  // Get voting config
  const configRef = collection(firestore, "config");
  const { data: configData } = useFirestoreCollectionData(configRef, {
    initialData: [],
  });

  const isOpen = configData?.[0]?.isOpen || false;
  const currentSession = configData?.[0]?.currentSession || 1;

  // Get participants for current session
  const participantsRef = collection(firestore, "participants");
  const participantsQuery = query(
    participantsRef,
    where("session", "==", currentSession)
  );

  const { status, data: participants } = useFirestoreCollectionData(
    participantsQuery,
    {
      initialData: [],
      idField: "id",
    }
  );

  const handleSelectParticipant = (participantId: string) => {
    if (selectedParticipant.includes(participantId)) {
      setSelectedParticipant(
        selectedParticipant.filter((id) => id !== participantId)
      );
    } else {
      setSelectedParticipant([...selectedParticipant, participantId]);
    }
  };

  const handleVote = async () => {
    setClicked(true);
    if (clicked) return;
    if (!isOpen) return;

    try {
      const batch = writeBatch(firestore);
      selectedParticipant.forEach((participantId) => {
        const participantRef = doc(firestore, "participants", participantId);
        batch.update(participantRef, { votes: increment(1) });
      });
      await batch.commit();
      alert("Vote successful!");
      setSessionsVoted([...sessionsVoted, currentSession]);
      localStorage.setItem("voted", currentSession);
    } catch (error) {
      console.error("Error voting:", error);
      alert("Error voting: " + error);
    } finally {
      setSelectedParticipant([]);
    }
  };

  useEffect(() => {
    const votedSessions = localStorage.getItem("voted");
    if (votedSessions) {
      setSessionsVoted(votedSessions.split(",").map(Number));
    }
  }, []);

  if (sessionsVoted.includes(currentSession)) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 p-4 flex flex-col justify-center">
        <div className="w-full mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              {`You have already vote
              for this session.`}
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Voting is Closed
          </h1>
          <p className="text-xl text-blue-200">
            Please wait for the voting session to open
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 p-4 flex flex-col justify-between">
      <div className="w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Cast Your Vote
          </h1>
          <p className="text-xl text-green-400 animate-pulse">
            ✓ Voting is Open
          </p>
        </div>

        {status === "loading" && (
          <div className="text-white text-center text-xl">
            Loading participants...
          </div>
        )}
        {status === "success" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants
              .sort(
                (a, b) =>
                  Number(a.id.replace("p", "")) - Number(b.id.replace("p", ""))
              )
              .map((participant) => (
                <button
                  key={participant.id}
                  onClick={() => handleSelectParticipant(participant.id)}
                  className={`${
                    selectedParticipant.includes(participant.id)
                      ? "border-green-600"
                      : "border-white"
                  } bg-linear-to-br border from-slate-800 via-slate-900 to-slate-800 relative rounded-2xl shadow-2xl p-6 text-white transition-all duration-200 transform hover:scale-105 active:scale-95`}
                >
                  {selectedParticipant.includes(participant.id) && (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex flex-col items-center justify-center absolute -top-2 -right-2">
                      <TiTick color="white" size={30} />
                    </div>
                  )}
                  <div className="flex flex-row items-center text-center">
                    <div
                      className={`mr-2 rounded-full w-5 h-5 font-bold flex flex-col items-center justify-center ${
                        selectedParticipant.includes(participant.id)
                          ? "bg-green-600"
                          : "bg-white"
                      } text-black text-sm`}
                    >
                      {participant.id.replace("p", "")}
                    </div>
                    <p className="text-lg font-medium absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
                      {participant.name}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
      <button
        onClick={handleVote}
        disabled={selectedParticipant.length === 0 || clicked}
        className="w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed mb-16 rounded-xl font-bold text-xl transition-all transform hover:scale-105 bg-green-600 hover:bg-green-700 text-white"
      >
        {selectedParticipant.length > 0 ? "Vote" : "No participants selected"}
      </button>
    </div>
  );
}
