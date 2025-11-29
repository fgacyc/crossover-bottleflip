import { useFirestore, useFirestoreDocData } from "reactfire";
import { doc, collection, getDocs } from "firebase/firestore";
import { getCounterColor } from "../utils";
import { useEffect, useState } from "react";

interface CounterDisplayProps {
  counterId: "voice" | "move" | "mind" | "heart";
  rank?: number;
}

function CounterDisplay({ counterId, rank }: CounterDisplayProps) {
  const firestore = useFirestore();
  const counterRef = doc(firestore, "counters", counterId);

  const { status, data } = useFirestoreDocData(counterRef, {
    initialData: { value: 0 },
  });

  const getRankGlow = () => {
    if (!rank) return "";

    switch (rank) {
      case 1:
        return "ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)]";
      case 2:
        return "ring-4 ring-gray-300 shadow-[0_0_15px_rgba(209,213,219,0.7)]";
      case 3:
        return "ring-4 ring-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.6)]";
      case 4:
        return "ring-4 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]";
      default:
        return "";
    }
  };

  const getRankBadge = () => {
    if (!rank) return null;

    const badges = {
      1: { text: "1st Place", color: "bg-yellow-400 text-yellow-900" },
      2: { text: "2nd Place", color: "bg-gray-300 text-gray-900" },
      3: { text: "3rd Place", color: "bg-orange-600 text-white" },
      4: { text: "4th Place", color: "bg-blue-500 text-white" },
    };

    const badge = badges[rank as keyof typeof badges];
    if (!badge) return null;

    return (
      <div
        className={`absolute -top-0 left-1/2 -translate-x-1/2 ${badge.color} px-6 py-1 rounded-full text-center font-bold text-sm shadow-lg z-10`}
      >
        {badge.text}
      </div>
    );
  };

  return (
    <div className="relative pt-4">
      {getRankBadge()}

      <div
        className={`bg-linear-to-br ${getCounterColor(
          counterId
        )} rounded-2xl shadow-2xl flex flex-row items-center justify-between p-6 text-white transition-all duration-300 ${getRankGlow()}`}
      >
        <div className="flex flex-row items-center gap-4">
          <img
            className={`object-cover w-[120px] h-[120px] ${
              counterId === "mind"
                ? "scale-[0.93]"
                : counterId === "move"
                ? "scale-[0.95]"
                : ""
            }`}
            alt={counterId}
            src={`/${counterId}.png`}
          />
          <h2 className="text-2xl block lg:hidden font-bold capitalize">
            {counterId}
          </h2>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-8 py-4 min-w-[80px] flex items-center justify-center">
          {status === "loading" ? (
            <div className="text-3xl font-bold animate-pulse">...</div>
          ) : (
            <div className="text-4xl font-bold">{data?.value ?? 0}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Display() {
  const firestore = useFirestore();
  const [rankings, setRankings] = useState<Record<string, number>>({});

  const counters = [
    { id: "mind" as const },
    { id: "move" as const },
    { id: "voice" as const },
    { id: "heart" as const },
  ];

  useEffect(() => {
    const updateRankings = async () => {
      try {
        const countersRef = collection(firestore, "counters");
        const snapshot = await getDocs(countersRef);

        // Get all counters with their values
        const counterValues = snapshot.docs.map((doc) => ({
          id: doc.id,
          value: doc.data().value || 0,
        }));

        // Sort by value (highest first)
        counterValues.sort((a, b) => b.value - a.value);

        // Assign ranks (handle ties by giving same rank)
        const newRankings: Record<string, number> = {};
        let currentRank = 1;

        counterValues.forEach((counter, index) => {
          // If value is 0, don't assign a rank
          if (counter.value === 0) return;

          // Check if current value is same as previous (tie)
          if (index > 0 && counter.value === counterValues[index - 1].value) {
            // Same rank as previous
            newRankings[counter.id] = currentRank - 1;
          } else {
            newRankings[counter.id] = currentRank;
          }
          currentRank++;
        });

        setRankings(newRankings);
      } catch (error) {
        console.error("Error updating rankings:", error);
      }
    };

    updateRankings();

    // Check every 2 seconds for updates
    const interval = setInterval(updateRankings, 2000);

    return () => clearInterval(interval);
  }, [firestore]);

  // Sort counters by ranking (1st place at top)
  const sortedCounters = [...counters].sort((a, b) => {
    const rankA = rankings[a.id] || 999; // Unranked go to bottom
    const rankB = rankings[b.id] || 999;
    return rankA - rankB;
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 p-4 sm:p-8">
      <div className="max-w-2xl lg:max-w-4xl lg:mt-4 mx-auto space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-[100px] font-bold text-white text-center mb-8">
          Cluster Bottleflip
        </h1>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 scale-100 lg:scale-[200%] lg:mt-[220px]">
          {sortedCounters.map((counter) => (
            <CounterDisplay
              key={counter.id}
              counterId={counter.id}
              rank={rankings[counter.id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
