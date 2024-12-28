import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For navigation

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  // Decode token to get the role (you may want to use jwt-decode for this)
  const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const userRole = decodedToken ? decodedToken.role : null;

  useEffect(() => {
    axios.get('http://localhost:5000/api/courses', {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the request header
      },
    })
      .then((response) => setCourses(response.data))
      .catch((error) => {
        console.error('Error fetching courses:', error);
        if (error.response && error.response.status === 401) {
          alert('Unauthorized! Please log in.');
          navigate('/login'); // Redirect to login if unauthorized
        }
      });
  }, [token, navigate]);

  // Handle course deletion
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token
        },
      });
      setCourses(courses.filter(course => course._id !== id));
      alert('Course deleted successfully!');
    } catch (error) {
      console.error('Error deleting course:', error);
      if (error.response && error.response.status === 401) {
        alert('Unauthorized! Please log in.');
        navigate('/login'); // Redirect to login if unauthorized
      }
    }
  };

  // Navigate to the AddCourse component for editing
  const handleEdit = (course) => {
    navigate('/add-course', { state: course });  // Pass course data to AddCourse
  };

  // Navigate to the AddCourse page to add a new course
  const handleAddCourse = () => {
    navigate('/add-course');  // Navigate to the AddCourse page without passing any state
  };

  return (
    <div className="container mt-4">
      <h2>Courses</h2>
      {userRole === 'admin' && (
        <button
          className="btn btn-success mb-4"
          onClick={handleAddCourse}  // Add Course button
        >
          Add Course
        </button>
      )}
      <div className="row">
        {courses.map((course) => (
          <div key={course._id} className="col-md-4 mb-4">
            <div className="card">
              {course.image && (
                <img
                  src={`http://localhost:5000${course.image}`}
                  className="card-img-top"
                  alt={course.title}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{course.title}</h5>
                <p className="card-text">${course.price}</p>
                {userRole === 'admin' && (
                  <>
                    <button
                      className="btn btn-primary me-2"
                      onClick={() => handleEdit(course)} // Edit button
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(course._id)} // Delete button
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;
