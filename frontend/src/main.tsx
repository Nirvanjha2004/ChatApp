
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Signin from './page/signin';
import Chat from './page/home';
import App from './App.tsx';

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Signin />} />
      <Route path="/home" element={<Chat />} />
    </Routes>
  </Router>,
  document.getElementById('root')
);
