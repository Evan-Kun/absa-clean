import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.scss';
import Home from './pages/home/Home';
import Profile from './pages/profile/Profile';
import PageContent from './pages/pageContent/PageContent';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import { LinearProgress } from '@mui/material';
import { createContext, useEffect, useState } from 'react';
import { useUser } from './context/UserContext';
import ComponyProfile from './pages/profile/Componyprofile';
import ChangePwd from './pages/changePassword/ChangePwd';
import { header_menu } from './services/utils';

export const LoadingContext = createContext<any>(false);

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const { getAllSkills, getOrganizations } = useUser();

  useEffect(() => {
    getAllSkills();
    getOrganizations();
  }, [])

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      <Router>
        <Header />
        {loading && <LinearProgress color='primary' />}
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<PageContent pageName={header_menu.HOMEPAGE} />} />
            <Route path="/home" element={<PageContent pageName={header_menu.HOMEPAGE} />} />
            <Route path="/profile/:sysName" element={<Profile />} />
            <Route path="/organization/:id" element={<Home />} />
            <Route path="/page/:pageName" element={<PageContent />} />
            <Route path="/org/:sysName" element={<ComponyProfile />} />
            <Route path="/account/fp/:token" element={<ChangePwd />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </LoadingContext.Provider>
  );
}

export default App;
