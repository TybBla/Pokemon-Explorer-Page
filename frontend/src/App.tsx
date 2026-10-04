import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import FavoritesPage from './pages/FavoritesPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <HashRouter>
      <div className="flex min-h-screen flex-col">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
