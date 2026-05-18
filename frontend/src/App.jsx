import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import CreateAdModal from './components/CreateAdModal';
import Home from './pages/Home';
import AdDetail from './pages/AdDetail';
import CreateAd from './pages/CreateAd';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Conversation from './pages/Conversation';
import ResetPassword from './pages/ResetPassword';
import Payment from './pages/Payment';

const App = () => {
  const [modal, setModal] = useState(null); // 'login' | 'register' | 'createAd' | null

  const openLogin = () => setModal('login');
  const openRegister = () => setModal('register');
  const openCreateAd = () => setModal('createAd');
  const closeModal = () => setModal(null);

  return (
  <BrowserRouter>
    <AuthProvider>

      <div className="min-h-screen flex flex-col bg-gray-50">

        <Navbar
          onLoginClick={openLogin}
          onRegisterClick={openRegister}
          onCreateAdClick={openCreateAd}
        />

        {/* Modales */}
        {modal === 'login' && (
          <LoginModal
            onClose={closeModal}
            onSwitchToRegister={() => setModal('register')}
          />
        )}
        {modal === 'register' && (
          <RegisterModal
            onClose={closeModal}
            onSwitchToLogin={() => setModal('login')}
          />
        )}
        {modal === 'createAd' && (
          <CreateAdModal onClose={closeModal} />
        )}

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          <Routes>
            <Route path="/" element={<Home onLoginClick={openLogin} />} />
            <Route path="/ads/:id" element={<AdDetail onLoginClick={openLogin} />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/payment/:transactionId" element={<PrivateRoute><Payment /></PrivateRoute>} />
            <Route path="/create-ad" element={<PrivateRoute><CreateAd /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
            <Route path="/messages/:userId" element={<PrivateRoute><Conversation /></PrivateRoute>} />
          </Routes>
        </main>

        <footer className="border-t border-gray-200 py-6 bg-white w-full">
            <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xl font-bold text-gray-600">
                Click&Troc 2026
              </span>
              <div className="flex gap-6 text-xl italic text-gray-500">
                <a href="#" className="hover:text-gray-700">vie privée et cookies</a>
                <a href="#" className="hover:text-gray-700">mentions légales</a>
                <a href="#" className="hover:text-gray-700">Conditions générales de vente</a>
              </div>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-500 hover:text-blue-700 hover:border-blue-700">in</a>
                <a href="#" className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-500 hover:text-blue-700 hover:border-blue-700">f</a>
              </div>
            </div>
          </footer>

      </div>

    </AuthProvider>
  </BrowserRouter>
);
};

export default App;
