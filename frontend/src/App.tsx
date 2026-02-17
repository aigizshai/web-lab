import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { fetchProfile } from './features/auth/authSlice';
import { storage } from './utils/storage';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Events from './pages/Events/Events';
import Profile from './pages/Profile/Profile';
import CreateEvent from './pages/CreateEvent/CreateEvent';
import EditEvent from './pages/EditEvent/EditEvent';
import NotFound from './pages/NotFound/NotFound';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import './App.css';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Если есть токен, но пользователь не аутентифицирован в Redux – загружаем профиль
    if (storage.isAuthenticated() && !isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/events" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/events" replace /> : <Register />}
        />

        {/* Защищённые маршруты */}
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/new"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/edit/:id"
          element={
            <ProtectedRoute>
              <EditEvent />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;