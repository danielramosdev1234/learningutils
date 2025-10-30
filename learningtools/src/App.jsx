import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeUser } from './store/slices/userSlice';
import TrainerSelector from './components/TrainerSelector';
import IncentiveModal from './components/IncentiveModal';
import { Analytics } from '@vercel/analytics/react';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Carrega dados do usuário ao iniciar
    dispatch(initializeUser());
  }, [dispatch]);

  return (
    <>
      <TrainerSelector />
      <IncentiveModal />
      <Analytics />
    </>
  );
}

export default App;