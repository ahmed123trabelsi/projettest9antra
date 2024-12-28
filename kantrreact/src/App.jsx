import logo from './assets/logo.png';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import CourseList from './components/CourseList';
import AddCourse from './components/AddCourse';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';  // Ensure the custom styles are imported
import Login from './Login';
import Register from './Register';
import ProtectedRoute from './ProtectedRoute';
import { createContext, useEffect, useState } from 'react';
import ContactUs from './ContactUs';
export const AuthContext = createContext();
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication state on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // Set true if token exists
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login'); // Redirect to login page
  };
  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
    <div className="container-fluid p-0">
 
    <nav className="navbar navbar-light bg-light d-flex justify-content-between align-items-center px-3">
    {/* Left side: Logo */}
    <div className="d-flex align-items-center">
      <img
        src={logo}
        alt="Logo"
        className="me-2"
        style={{ width: '120px', height: '120px' }}
      />
    </div>

    {/* Right side: Authentication button */}
    <div>
      {isAuthenticated ? (
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <Link to="/register" className="btn btn-primary">
          Sign Up
        </Link>
      )}
    </div>
  </nav>
 
      {/* Apply custom margin using the custom CSS class */}
      <div className="custom-margin-top">
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/course" element={
        <ProtectedRoute allowedRoles={['admin', 'user']}>
          <CourseList />
        </ProtectedRoute>
      } />
      <Route path="/add-course" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AddCourse />
        </ProtectedRoute>
      } />
    </Routes>
      </div>
      <ContactUs></ContactUs>
    </div>
    </AuthContext.Provider>
  );
}

export default App;
