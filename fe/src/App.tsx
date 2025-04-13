/* eslint-disable no-useless-escape */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Builder } from './pages/Builder';
import { AppBar } from './components/AppBar';

function App() { 
  return (
    <BrowserRouter>
      <AppBar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<Builder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;