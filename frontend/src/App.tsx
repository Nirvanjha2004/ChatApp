
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
    } else {
      navigate('/home');
    }
  }, [navigate]);

  return <div>Loading...</div>;
};

export default App;
