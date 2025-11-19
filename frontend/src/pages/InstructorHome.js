import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserProfileMenu from './UserProfileMenu';
import { Link, useNavigate } from 'react-router-dom';

const InstructorHome = () => {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get('https://localhost:44344/api/Course/instructor', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setErrorMessage('Failed to load courses. Please try again later.');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const instructorName = localStorage.getItem('userName');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (mediaFile) formData.append('mediaFile', mediaFile);
    formData.append('instructorName', instructorName);

    try {
      await axios.post('https://localhost:44344/api/Course', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowForm(false);
      setTitle('');
      setDescription('');
      setMediaFile(null);
      fetchCourses();
    } catch (error) {
      console.error('Failed to create course:', error);
      setErrorMessage('Failed to create course. Please try again.');
    }
  };

  const handleViewPerformance = (courseId) => {
    navigate(`/course/${courseId}/performance`);
  };

  const handleAddQuiz = (courseId) => {
    navigate(`/${courseId}/add`);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-end">
        <UserProfileMenu />
      </div>

      <h2 className="mb-4 text-center text-primary fw-bold">Instructor Dashboard</h2>

      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {!showForm && (
        <div className="text-end mb-4">
          <button className="btn btn-success" onClick={() => setShowForm(true)}>
            Add New Course
          </button>
        </div>
      )}

      {showForm && (
        <div className="card mb-4 mx-auto shadow" style={{ maxWidth: '600px' }}>
          <div className="card-body">
            <h5 className="card-title text-center text-success">Create a New Course</h5>
            <form onSubmit={handleCreateCourse}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Course Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Course Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="mediaFile" className="form-label">Upload Course Media</label>
                <input
                  type="file"
                  className="form-control"
                  id="mediaFile"
                  onChange={(e) => setMediaFile(e.target.files[0])}
                  required
                />
              </div>
              {mediaFile && (
                <div className="mb-3">
                  <p><strong>Selected file:</strong> {mediaFile.name}</p>
                </div>
              )}
              <div className="d-flex justify-content-between">
                <button type="submit" className="btn btn-primary">Create Course</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h3 className="text-center mb-4">Your Courses</h3>
      <div className="row">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.courseId} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-primary">{course.title}</h5>
                  <p className="card-text">{course.description}</p>
                  <div className="mt-auto d-flex flex-column gap-2">
                    <Link to={`/course/${course.courseId}`} className="btn btn-info w-100">
                      View Course
                    </Link>
                    <button
                      className="btn btn-warning w-100"
                      onClick={() => handleViewPerformance(course.courseId)}
                    >
                      View Student Performance
                    </button>
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => handleAddQuiz(course.courseId)}
                    >
                      Add Quiz
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p className="text-muted">No courses found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorHome;
