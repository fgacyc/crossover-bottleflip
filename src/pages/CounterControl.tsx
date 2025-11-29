import { useFirestore, useFirestoreDocData } from "reactfire";
import { doc, setDoc, updateDoc, increment } from "firebase/firestore";

import { TiMinus, TiPlus } from "react-icons/ti";
import {
  getButtonColor,
  getCounterColor,
  getCounterColorLight,
} from "../utils";

interface CounterControlProps {
  counterId: "voice" | "move" | "mind" | "heart";
}

export default function CounterControl({ counterId }: CounterControlProps) {
  const firestore = useFirestore();
  const counterRef = doc(firestore, "counters", counterId);

  // Get the counter data
  const { status, data } = useFirestoreDocData(counterRef, {
    initialData: { value: 0 },
  });

  const incrementCounter = async () => {
    try {
      await updateDoc(counterRef, {
        value: increment(1),
      });
    } catch {
      // If document doesn't exist, create it first
      await setDoc(counterRef, { value: 1 });
    }
  };

  const decrementCounter = async () => {
    if (data?.value === 0) return;
    try {
      await updateDoc(counterRef, {
        value: increment(-1),
      });
    } catch {
      await setDoc(counterRef, { value: -1 });
    }
  };

  return status === "success" ? (
    <div
      className={`min-h-screen bg-linear-to-br ${getCounterColor(
        counterId
      )} flex flex-col items-center justify-center p-12`}
    >
      <div className="rounded-xl bg-white py-1 px-2 max-w-2xl w-full gap-1 flex flex-col">
        <p className="text-center text-2xl font-bold">
          {counterId.toUpperCase()}
        </p>
        <div
          className={`${getCounterColorLight(
            counterId
          )} bg-linear-to-br rounded-t-xl py-1 px-2`}
        >
          <p className="text-center text-[100px] font-bold">
            {data?.value ?? 0}
          </p>
        </div>
        <div className="flex flex-row items-center w-full gap-0.5 pb-1">
          <button
            onClick={decrementCounter}
            className={`${getButtonColor(
              counterId
            )} flex flex-row justify-center w-full px-4 py-2 rounded-bl-md`}
          >
            <TiMinus color="white" size={40} />
          </button>
          <button
            onClick={incrementCounter}
            className={`${getButtonColor(
              counterId
            )} flex flex-row justify-center w-full px-4 py-2 rounded-br-md`}
          >
            <TiPlus color="white" size={40} />
          </button>
        </div>
      </div>
    </div>
  ) : (
    <>Loading...</>
  );
}
