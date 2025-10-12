import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { Web3Provider } from './contexts/Web3Context.jsx';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CreatePollPage from './pages/CreatePollPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MyVotes from './pages/MyVotes.jsx'; // ADD THIS IMPORT

function App() {
  return (
    <Router>
      <AuthProvider>
        <Web3Provider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/polls" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/create" element={<CreatePollPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/votes" element={<MyVotes />} /> {/* ADD THIS ROUTE */}
                <Route path="/poll/:id" element={<ResultsPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Web3Provider>
      </AuthProvider>
    </Router>
  );
}

export default App;