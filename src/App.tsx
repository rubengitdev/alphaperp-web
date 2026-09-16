import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Terminal } from './pages/Terminal';
import { Docs } from './pages/Docs';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import './index.css';

import Landing from './pages/Landing';

function App() {
  return (
    <Routes>
      <Route path="/" element={<><Navbar variant="landing" /><Landing /></>} />
      <Route path="/terminal" element={<><Navbar variant="terminal" /><Terminal /></>} />
      <Route path="/docs" element={<><Navbar variant="landing" /><Docs /></>} />
      <Route path="/terms" element={<><Navbar variant="landing" /><Terms /></>} />
      <Route path="/privacy" element={<><Navbar variant="landing" /><Privacy /></>} />
    </Routes>
  );
}

export default App;
