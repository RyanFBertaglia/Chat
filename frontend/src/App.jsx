import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Home from './pages/Home';
import Chat from './pages/Chat';
import MyAccount from './components/MyAccount';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/account" element={<MyAccount />} />
          <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
