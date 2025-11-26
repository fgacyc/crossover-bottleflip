import { useFirestore, useFirestoreDocData } from "reactfire";
import { doc } from "firebase/firestore";
import { Link } from "react-router-dom";

interface CounterDisplayProps {
  counterId: "voice" | "move" | "mind" | "heart";
  color: string;
  icon: string;
}

function CounterDisplay({ counterId, color, icon }: CounterDisplayProps) {
  const firestore = useFirestore();
  const counterRef = doc(firestore, "counters", counterId);

  const { status, data } = useFirestoreDocData(counterRef, {
    initialData: { value: 0 },
  });

  return (
    <Link
      to={`/control/${counterId}`}
      className={`bg-gradient-to-br ${color} rounded-2xl shadow-2xl p-8 text-white transform hover:scale-105 transition-all cursor-pointer`}
    >
      <div className="text-center">
        <div className="text-5xl mb-4">{icon}</div>
        <h2 className="text-3xl font-bold capitalize mb-2">{counterId}</h2>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-4">
          {status === "loading" ? (
            <div className="text-6xl font-bold animate-pulse">...</div>
          ) : (
            <div className="text-7xl font-bold">{data?.value ?? 0}</div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Display() {
  const counters = [
    { id: "voice" as const, color: "from-blue-600 to-blue-800", icon: "🔊" },
    { id: "move" as const, color: "from-green-600 to-green-800", icon: "🏃" },
    { id: "mind" as const, color: "from-purple-600 to-purple-800", icon: "🧠" },
    { id: "heart" as const, color: "from-red-600 to-red-800", icon: "❤️" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            Counter Dashboard
          </h1>
          <p className="text-xl text-blue-200">
            Click on any counter to access its controls
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {counters.map((counter) => (
            <CounterDisplay
              key={counter.id}
              counterId={counter.id}
              color={counter.color}
              icon={counter.icon}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-white">
            <p className="text-lg mb-2">Quick Links</p>
            <div className="flex gap-4 justify-center">
              {counters.map((counter) => (
                <Link
                  key={counter.id}
                  to={`/control/${counter.id}`}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors capitalize"
                >
                  {counter.icon} {counter.id}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
