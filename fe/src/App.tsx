/* eslint-disable no-useless-escape */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Home } from './pages/Home';
import { Builder } from './pages/Builder';
import { AppBar } from './components/AppBar';

function App() {
  // State for the logged-in user
  const [user, setUser] = useState<{
    username: string;
    name?: string;
    avatar?: string;
    email?: string;
  } | null>(null);

  return (
    <BrowserRouter>
      <AppBar user={user} setUser={setUser} />

      <Routes>
        {/* Pass user state to Home */}
        <Route path="/" element={<Home user={user} />} />
        <Route path="/builder" element={<Builder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;