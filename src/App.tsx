import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CounterControl from "./pages/CounterControl";
import Display from "./pages/Display";
import { FirestoreProvider, useFirebaseApp } from "reactfire";
import { getFirestore } from "firebase/firestore";

function App() {
  const firebaseApp = useFirebaseApp();
  const firestoreInstance = getFirestore(firebaseApp);
  return (
    <FirestoreProvider sdk={firestoreInstance}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/display" replace />} />
          <Route path="/display" element={<Display />} />
          <Route
            path="/control/voice"
            element={<CounterControl counterId="voice" />}
          />
          <Route
            path="/control/move"
            element={<CounterControl counterId="move" />}
          />
          <Route
            path="/control/mind"
            element={<CounterControl counterId="mind" />}
          />
          <Route
            path="/control/heart"
            element={<CounterControl counterId="heart" />}
          />
        </Routes>
      </BrowserRouter>
    </FirestoreProvider>
  );
}

export default App;
