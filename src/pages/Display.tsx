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
        return "ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.8)]";
      case 2:
        return "ring-4 ring-gray-300 shadow-[0_0_25px_rgba(209,213,219,0.7)] ";
      case 3:
        return "ring-4 ring-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.6)]";
      case 4:
        return "ring-4 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]";
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
        className={`absolute -top-8 left-1/2 -translate-x-1/2 ${badge.color} px-10 py-1 rounded-full text-center font-bold text-[40px] shadow-lg z-10`}
      >
        {badge.text}
      </div>
    );
  };

  return (
    <div className="relative">
      {getRankBadge()}

      <div
        className={`bg-linear-to-br min-w-[714px] min-h-[530px] max-w-[714px] max-h-[530px] ${getCounterColor(
          counterId
        )} rounded-4xl shadow-2xl flex flex-row items-center justify-center text-white w-full transition-all duration-300 ${getRankGlow()}`}
      >
        <div className="flex h-full flex-row items-center gap-4 justify-center">
          <img
            className={`mb-4 object-cover w-[390px] h-[390px] ${
              counterId === "mind"
                ? "scale-[0.93]"
                : counterId === "move"
                ? "scale-[0.95]"
                : ""
            }`}
            alt={counterId}
            src={`/${counterId}.png`}
          />
          <div className="bg-white/10 w-[250px] flex flex-row items-center justify-center mx-auto backdrop-blur-sm rounded-xl p-6">
            {status === "loading" ? (
              <div className="text-6xl font-bold animate-pulse">...</div>
            ) : (
              <div className="text-[200px] font-bold">{data?.value ?? 0}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Display() {
  const firestore = useFirestore();
  const [rankedCounters, setRankedCounters] = useState<string[]>([]);

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

        const newRankedCounters = [...rankedCounters];

        snapshot.docs.forEach((doc) => {
          const value = doc.data().value;
          const counterId = doc.id;
          const isInArray = newRankedCounters.includes(counterId);

          if (value >= 7 && !isInArray) {
            // Counter reached 7 and not yet in array - add it
            newRankedCounters.push(counterId);
          } else if (value < 7 && isInArray) {
            // Counter dropped below 7 - remove from array
            const index = newRankedCounters.indexOf(counterId);
            newRankedCounters.splice(index, 1);
          }
        });

        setRankedCounters(newRankedCounters);
      } catch (error) {
        console.error("Error updating rankings:", error);
      }
    };

    updateRankings();

    // Check every 2 seconds for updates
    const interval = setInterval(updateRankings, 2000);

    return () => clearInterval(interval);
  }, [firestore, rankedCounters]);

  return (
    <div className="min-w-[4000px] min-h-[1000px] bg-[url('/L5_BG.jpg')] bg-cover bg-center p-8">
      <div className="flex mt-[200px] flex-row items-center max-w-[3000px] mx-auto w-full justify-center gap-12">
        {counters.map((counter) => {
          const rankIndex = rankedCounters.indexOf(counter.id);
          const rank = rankIndex >= 0 ? rankIndex + 1 : undefined;

          return (
            <CounterDisplay
              key={counter.id}
              counterId={counter.id}
              rank={rank}
            />
          );
        })}
      </div>
    </div>
  );
}
