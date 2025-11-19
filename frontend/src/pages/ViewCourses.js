import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserProfileMenu from './UserProfileMenu';

const ViewCourse = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { course } = location.state || {};

  if (!course) {
    return <div className="text-center mt-5">No course data available.</div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-start mb-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          &larr; Back
        </button>
      </div>

      <div className="d-flex justify-content-end">
        <UserProfileMenu />
      </div>

      <h2>{course.title}</h2>
      <p>{course.description}</p>

      <h5 className="mt-4">Course Media</h5>
      {course.mediaUrl && (
        <iframe
          src={course.mediaUrl}
          width="100%"
          height="400"
          title="Course Media"
          className="mb-4"
        ></iframe>
      )}

      <button className="btn btn-warning">Take Quiz</button>
    </div>
  );
};

export default ViewCourse;
