import { useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useMemo } from "react";

export default function MainScreen() {
  const firestore = useFirestore();

  const configRef = collection(firestore, "config");
  const { data: configData } = useFirestoreCollectionData(configRef, {
    initialData: [],
  });

  const currentSession = configData?.[0]?.currentSession || 1;
  const showResults = configData?.[0]?.showResults || false;

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

  const maxVotes = useMemo(() => {
    if (participants.length === 0) return 0;
    return Math.max(...participants.map((p) => p.votes || 0));
  }, [participants]);

  const getClusterColor = (cluster: string) => {
    if (!cluster) return "#6366f1"; // default blue

    const clusterMap: Record<string, string> = {
      voice: "#eab308", // yellow
      move: "#22c55e", // green
      mind: "#3b82f6", // blue
      heart: "#ef4444", // red
    };

    // Handle multiple clusters (e.g., "heart,voice")
    const firstCluster = cluster.split(",")[0].trim();
    return clusterMap[firstCluster] || "#6366f1";
  };

  return (
    <div
      className="w-[2432px] h-[1024px] flex flex-col justify-center p-12 overflow-hidden"
      style={{ fontSize: "16px" }}
    >
      <video
        src="https://cms.fgacyc.com/uploads/bg_05018047d6.mov"
        autoPlay
        muted
        loop
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div className="relative z-10 bg-black/50 backdrop-blur-sm p-6 rounded-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-8xl font-bold text-white mb-4">Results</h1>
        </div>

        {status === "loading" && (
          <div className="text-white text-center text-6xl mt-32">
            Loading...
          </div>
        )}

        {status === "success" && (
          <div className="space-y-8">
            {participants
              .sort(
                (a, b) =>
                  Number(a.id.replace("p", "")) - Number(b.id.replace("p", ""))
              )
              .map((participant, index) => {
                const actualPercentage =
                  maxVotes > 0 ? (participant.votes / maxVotes) * 100 : 0;
                const displayPercentage = showResults ? actualPercentage : 0;
                const barColor = getClusterColor(participant.cluster);

                return (
                  <div key={participant.id} className="flex items-center gap-8">
                    {/* Rank Badge */}
                    <div className="w-24 shrink-0">
                      <div className="text-5xl font-bold text-gray-500 text-center">
                        {index + 1}
                      </div>
                    </div>

                    {/* Participant Name */}
                    <div className="w-[500px] shrink-0">
                      <h2 className="text-4xl font-bold text-white truncate">
                        {participant.name}
                      </h2>
                    </div>

                    {/* Bar Chart */}
                    <div className="flex-1 relative">
                      <div className="w-full h-20 bg-slate-300/30 rounded-2xl overflow-hidden relative">
                        {/* Animated Bar */}
                        {
                          <div
                            className="h-full rounded-2xl transition-all duration-1000 ease-out flex items-center justify-end px-8"
                            style={{
                              width: `${displayPercentage}%`,
                              backgroundColor: barColor,
                              boxShadow: `0 0 30px ${barColor}80`,
                            }}
                          >
                            {displayPercentage > 0 && (
                              <span className="text-5xl font-bold text-white drop-shadow-lg">
                                {showResults ? participant.votes || 0 : 0}
                              </span>
                            )}
                          </div>
                        }

                        {/* Vote count - always show on right when results are hidden or bar is small */}
                        {(displayPercentage < 15 || !showResults) && (
                          <div className="absolute right-8 top-1/2 -translate-y-1/2">
                            <span className="text-5xl font-bold text-white drop-shadow-lg">
                              {showResults ? participant.votes || 0 : 0}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
