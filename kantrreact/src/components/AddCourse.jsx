import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';  // For navigation and state


const AddCourse = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const courseToEdit = location.state; // Get course data passed from CourseList
  const token = localStorage.getItem('token');
  useEffect(() => {
    if (courseToEdit) {
      setTitle(courseToEdit.title);
      setPrice(courseToEdit.price);
      // Set image (this will not display the image, only set the value)
      setImage(null); // You can handle displaying the image preview if needed
    }
  }, [courseToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('image', image);

    try {
      if (courseToEdit) {
        // Update existing course
        await axios.put(`http://localhost:5000/api/courses/${courseToEdit._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' ,
          Authorization: `Bearer ${token}` },
        });
        alert('Course updated successfully!');
      } else {
        // Add new course
        await axios.post('http://localhost:5000/api/courses', formData, {
          headers: { 'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` },
        });
        alert('Course added successfully!');
      }
      setTitle('');
      setPrice('');
      setImage(null);
      navigate('/course');  // Redirect to the course list after adding or updating the course
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>{courseToEdit ? 'Edit Course' : 'Add a Course'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            type="number"
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Image</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {courseToEdit ? 'Update Course' : 'Add Course'}
        </button>
      </form>
    </div>
  );
};

export default AddCourse;
