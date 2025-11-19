import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import UserProfileMenu from './UserProfileMenu';

const CoursePerformancePage = () => {
  const { courseId } = useParams(); 
  const navigate = useNavigate();
  const [studentsPerformance, setStudentsPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentPerformance();
  }, [courseId]);

  const fetchStudentPerformance = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get(`https://localhost:44344/api/Course/${courseId}/performances`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudentsPerformance(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching student performance data:', error);
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-end">
        <UserProfileMenu />
      </div>

      <div className="d-flex justify-content-start mb-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          &larr; Back
        </button>
      </div>

      <h2 className="text-center mb-4 text-primary font-weight-bold">Student Performance</h2>

      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {studentsPerformance.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead className="table-light">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Student Name</th>
                    <th scope="col">Date</th>
                    <th scope="col">Time</th>
                    <th scope="col">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsPerformance.map((student, index) => {
                    const [year, month, day] = student.takenDate.split('-').map(Number);
                    const [hour, minute, second] = student.takenTime.split(':').map(Number);
                    const fullDate = new Date(year, month - 1, day, hour, minute, second);

                    const formattedDate = fullDate.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    });

                    const formattedTime = fullDate.toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    });

                    return (
                      <tr key={`${student.studentName}-${student.takenDate}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{student.studentName}</td>
                        <td>{formattedDate}</td>
                        <td>{formattedTime}</td>
                        <td>
                          <span className="badge bg-info text-white">{student.tmarks}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted">No student performance data available.</p>
          )}
        </>
      )}
    </div>
  );
};

export default CoursePerformancePage;
