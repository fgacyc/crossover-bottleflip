import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Results from "./pages/Results";
import Vote from "./pages/Vote";
import Control from "./pages/Control";
import { FirestoreProvider, useFirebaseApp } from "reactfire";
import { getFirestore } from "firebase/firestore";

function App() {
  const firebaseApp = useFirebaseApp();
  const firestoreInstance = getFirestore(firebaseApp);
  return (
    <FirestoreProvider sdk={firestoreInstance}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/vote" replace />} />
          <Route path="/results" element={<Results />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/control" element={<Control />} />
        </Routes>
      </BrowserRouter>
    </FirestoreProvider>
  );
}

export default App;
