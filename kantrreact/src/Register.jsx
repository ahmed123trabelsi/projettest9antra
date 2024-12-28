import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link for navigation

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '', role: 'user' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/register', formData);
      alert('Registration successful');
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
 
        <button type="submit" className="btn btn-primary">Register</button>
      </form>

      {/* Sign In Link */}
      <div className="mt-3">
        <p>Already have an account? <Link to="/login" className="btn btn-link">Sign In</Link></p>
      </div>
    </div>
  );
};

export default Register;
