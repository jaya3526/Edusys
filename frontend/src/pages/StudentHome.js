import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserProfileMenu from './UserProfileMenu';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [registrationStatus, setRegistrationStatus] = useState({});
  const navigate = useNavigate();

  const getAuthToken = () => localStorage.getItem('authToken');

  useEffect(() => {
    fetchCoursesAndStatuses();
  }, []);

  const fetchCoursesAndStatuses = async () => {
    const token = getAuthToken();
    if (!token) return alert('Please log in.');

    try {
      const coursesRes = await axios.get('https://localhost:44344/api/Course', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const coursesData = coursesRes.data;
      setCourses(coursesData);

      const statusRes = await Promise.all(
        coursesData.map(course =>
          axios
            .get(`https://localhost:44344/api/Course/${course.courseId}/registration-status`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then(res => ({ courseId: course.courseId, isRegistered: res.data.isRegistered }))
            .catch(() => ({ courseId: course.courseId, isRegistered: false }))
        )
      );

      const statusMap = {};
      statusRes.forEach(({ courseId, isRegistered }) => {
        statusMap[courseId] = isRegistered;
      });

      setRegistrationStatus(statusMap);
    } catch (error) {
      console.error('Error loading courses/statuses:', error);
    }
  };

  const handleRegister = async (courseId) => {
    const token = getAuthToken();
    try {
      const response = await axios.post(`https://localhost:44344/api/Course/${courseId}/register`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Registration successful!');
      updateSingleStatus(courseId);
      navigate(`/student-course/${courseId}`);
    } catch (error) {
      alert(`Registration failed: ${error.response?.data || 'Unknown error'}`);
    }
  };

  const updateSingleStatus = async (courseId) => {
    const token = getAuthToken();
    try {
      const res = await axios.get(
        `https://localhost:44344/api/Course/${courseId}/registration-status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRegistrationStatus(prev => ({
        ...prev,
        [courseId]: res.data.isRegistered,
      }));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleViewCourse = (course) => {
    navigate(`/student-course/${course.courseId}`, { state: { course } });
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-end mb-3">
        <UserProfileMenu />
      </div>
      
      <h2 className="text-center mb-4 text-uppercase font-weight-bold text-primary">Available Courses</h2>

      <div className="row">
        {courses.map((course) => (
          <div className="col-lg-4 col-md-6 mb-4" key={course.courseId}>
            <div className="card shadow-lg border-light rounded">
              <div className="card-body">
                <h5 className="card-title text-primary font-weight-bold">{course.title}</h5>
                <p className="card-text text-muted">{course.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {registrationStatus[course.courseId] ? (
                      <button
                        className="btn btn-success w-100"
                        onClick={() => handleViewCourse(course)}
                      >
                        Open Course
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => handleRegister(course.courseId)}
                      >
                        Register
                      </button>
                    )}
                  </div>
                  <div>
                    <i className="fas fa-book-open text-muted"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
