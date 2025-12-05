import { useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, query, where, orderBy } from "firebase/firestore";
import { getButtonColor, type CounterId } from "../utils";

type Participant = {
  id: string;
  name: string;
  votes: number;
  session: number;
  cluster: CounterId;
};

function ParticipantDisplay({
  participant,
}: Readonly<{
  participant: Participant;
  rank?: number;
}>) {
  return (
    <div className="relative pt-4">
      <div
        className={`bg-slate-600 rounded-2xl shadow-2xl flex flex-row items-center justify-between p-4 text-white transition-all duration-300`}
      >
        <div className="flex flex-col">
          <h2 className="text-xl font-bold">{participant.name}</h2>
          <p className="text-sm opacity-75">Session {participant.session}</p>
          <div className="flex flex-row items-center gap-1.5 mt-1">
            {participant.cluster.split(",").map((cluster) => (
              <div
                key={cluster}
                className={`text-sm capitalize rounded-full px-2 py-px ${getButtonColor(
                  cluster as CounterId
                )}`}
              >
                {cluster}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-8 py-4 min-w-[80px] flex items-center justify-center">
          <div className="text-4xl font-bold">{participant.votes ?? 0}</div>
        </div>
      </div>
    </div>
  );
}

export default function Results() {
  const firestore = useFirestore();

  const configRef = collection(firestore, "config");
  const { data: configData } = useFirestoreCollectionData(configRef, {
    initialData: [],
  });

  const currentSession = configData?.[0]?.currentSession || 1;

  const participantsRef = collection(firestore, "participants");
  const participantsQuery = query(
    participantsRef,
    where("session", "==", currentSession),
    orderBy("votes", "desc")
  );

  const { status, data: participants } = useFirestoreCollectionData(
    participantsQuery,
    {
      initialData: [],
      idField: "id",
    }
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Voting Results
          </h1>
          <p className="text-xl text-blue-200">Session {currentSession}</p>
        </div>

        {status === "loading" && (
          <div className="text-white text-center text-xl">Loading...</div>
        )}

        {status === "success" && (
          <div className="space-y-3">
            {participants.map((participant) => (
              <ParticipantDisplay
                key={participant.id}
                participant={participant as Participant}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
