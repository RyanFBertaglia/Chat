import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./AuthContext";
import Home from './pages/Home';
import Chat from './pages/Chat';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
