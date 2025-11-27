import { useFirestore, useFirestoreDocData } from "reactfire";
import {
  doc,
  setDoc,
  updateDoc,
  increment,
  getDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface CounterControlProps {
  counterId: "voice" | "move" | "mind" | "heart";
}

export default function CounterControl({ counterId }: CounterControlProps) {
  const firestore = useFirestore();
  const counterRef = doc(firestore, "counters", counterId);

  // Get the counter data
  const { status, data, error } = useFirestoreDocData(counterRef, {
    initialData: { value: 0 },
  });

  // Debug state
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [writeStatus, setWriteStatus] = useState<string>("");

  const checkDb = async () => {
    try {
      // 1. Check specific document
      const docSnap = await getDoc(counterRef);

      // 2. Check collection
      const collRef = collection(firestore, "counters");
      const collSnap = await getDocs(collRef);
      const allDocs = collSnap.docs.map((d) => ({
        id: d.id,
        data: d.data(),
      }));

      setDebugInfo({
        exists: docSnap.exists(),
        id: counterId,
        rawData: docSnap.data(),
        collectionSize: collSnap.size,
        allDocuments: allDocs,
        error: null,
      });
    } catch (err: any) {
      setDebugInfo({ error: err.message, code: err.code });
    }
  };

  useEffect(() => {
    checkDb();
  }, [counterId, firestore]);

  const incrementCounter = async () => {
    try {
      await updateDoc(counterRef, {
        value: increment(1),
      });
    } catch (error) {
      console.error(error);
      // If document doesn't exist, create it first
      await setDoc(counterRef, { value: 1 });
    }
  };

  const decrementCounter = async () => {
    try {
      await updateDoc(counterRef, {
        value: increment(-1),
      });
    } catch (error) {
      console.error(error);
      await setDoc(counterRef, { value: -1 });
    }
  };

  const resetCounter = async () => {
    await setDoc(counterRef, { value: 0 });
  };

  const debugWrite = async () => {
    setWriteStatus("Attempting write...");
    try {
      const testRef = await addDoc(collection(firestore, "debug_tests"), {
        timestamp: new Date().toISOString(),
        device: navigator.userAgent,
        test: "If you see this, WRITES are working!",
      });
      setWriteStatus(`✅ Written to 'debug_tests/${testRef.id}'`);
      checkDb(); // Refresh debug info
    } catch (e: any) {
      setWriteStatus(`❌ Write Failed: ${e.message}`);
    }
  };

  const getCounterColor = () => {
    switch (counterId) {
      case "voice":
        return "from-blue-600 to-blue-800";
      case "move":
        return "from-green-600 to-green-800";
      case "mind":
        return "from-purple-600 to-purple-800";
      case "heart":
        return "from-red-600 to-red-800";
    }
  };

  const getCounterIcon = () => {
    switch (counterId) {
      case "voice":
        return "🔊";
      case "move":
        return "🏃";
      case "mind":
        return "🧠";
      case "heart":
        return "❤️";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <Link
          to="/display"
          className="inline-block mb-8 text-blue-300 hover:text-blue-200 transition-colors"
        >
          ← Back to Display
        </Link>

        <div
          className={`bg-gradient-to-br ${getCounterColor()} rounded-2xl shadow-2xl p-12 text-white`}
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{getCounterIcon()}</div>
            <h1 className="text-5xl font-bold capitalize mb-2">{counterId}</h1>
            <p className="text-xl opacity-90">Counter Controls</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8">
            {status === "loading" ? (
              <div className="text-center text-8xl font-bold animate-pulse">
                ...
              </div>
            ) : (
              <div className="text-center text-9xl font-bold">
                {data?.value ?? 0}
              </div>
            )}
            {error && (
              <div className="text-red-400 mt-2">Error: {error.message}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={incrementCounter}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-6 text-2xl font-semibold transition-all transform hover:scale-105 active:scale-95"
            >
              ➕ Count Up
            </button>
            <button
              onClick={decrementCounter}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-6 text-2xl font-semibold transition-all transform hover:scale-105 active:scale-95"
            >
              ➖ Count Down
            </button>
          </div>

          <button
            onClick={resetCounter}
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 text-lg font-semibold transition-all transform hover:scale-105 active:scale-95"
          >
            🔄 Reset Counter
          </button>
        </div>

        {/* Debug Section */}
        <div className="mt-8 p-4 bg-black/50 rounded-xl text-xs font-mono text-gray-300 overflow-auto max-h-60">
          <h3 className="text-white font-bold mb-2">🔍 Debug Info</h3>
          <div className="mb-4">
            <button 
              onClick={checkDb}
              className="mr-2 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded"
            >
              🔄 Refresh Data
            </button>
            <button 
              onClick={debugWrite}
              className="px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded"
            >
              ✍️ Test Write
            </button>
            <span className="ml-2 text-yellow-400">{writeStatus}</span>
          </div>
          
          {debugInfo ? (
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          ) : (
            <p>Loading debug info...</p>
          )}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          {(["voice", "move", "mind", "heart"] as const).map(
            (id) =>
              id !== counterId && (
                <Link
                  key={id}
                  to={`/control/${id}`}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors capitalize"
                >
                  {id}
                </Link>
              )
          )}
        </div>
      </div>
    </div>
  );
}
