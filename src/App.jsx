import { Routes, Route, Link } from 'react-router-dom';
import MainUploadPage from './MainUploadPage';
import GamePage from './GamePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainUploadPage />} />
      <Route path="/game" element={<GamePage />} />
    </Routes>
  );
}

export default App;