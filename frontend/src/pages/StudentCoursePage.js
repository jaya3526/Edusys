import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserProfileMenu from './UserProfileMenu';


const StudentCoursePage = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [course, setCourse] = useState(location.state?.course || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [quizTaken, setQuizTaken] = useState(false);
  const [score, setScore] = useState(null);

  const getAuthToken = () => localStorage.getItem('authToken');

  useEffect(() => {
    fetchCourseDetails();
    checkRegistrationStatus();
    checkQuizStatus();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`https://localhost:44344/api/Course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const response = await axios.get(
        `https://localhost:44344/api/Course/${courseId}/registration-status`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`
          }
        }
      );
      setIsRegistered(response.data.isRegistered);
    } catch (error) {
      console.error('Error checking registration status:', error);
      setIsRegistered(false);
    }
  };

  const checkQuizStatus = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const studentId = user?.userId;

      if (!studentId) {
        console.error('User ID not found.');
        return;
      }

      const response = await axios.get(
        `https://localhost:44344/api/Course/${courseId}/quiz-results`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`
          }
        }
      );

      const studentHasTakenQuiz = response.data.some(
        (quizResult) => quizResult.studentId === studentId
      );

      if (studentHasTakenQuiz) {
        setQuizTaken(true);
        const studentScore = response.data.find(
          (quizResult) => quizResult.studentId === studentId
        )?.score;
        setScore(studentScore || null);
      } else {
        setQuizTaken(false);
        setScore(null);
      }

    } catch (error) {
      console.error('Error checking quiz status:', error);
    }
  };
  const handleTakeQuiz = () => {
    console.log(course)
    navigate(`/take-quiz/${courseId}`);
  };

  const handleViewMedia = () => {
    if (course?.mediaUrl) {
      window.open(course.mediaUrl, '_blank');
    } else {
      alert('No media available for this course.');
    }
  };

  if (isLoading) return <div className="container mt-5 text-center">Loading...</div>;

  if (!isRegistered)
    return <div className="container mt-5 text-center text-danger">You are not registered for this course.</div>;

  return (
    <div className="container mt-5">
       <div className="d-flex justify-content-end">
       <UserProfileMenu />
       </div>
        <div className="d-flex justify-content-start mb-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/student-home')}>
          &larr; Back
        </button>
      </div>

      <div className="card mb-4 p-4 shadow-sm">
        <h5 className="card-title">Course Description</h5>
        <p className="card-text">{course?.description}</p>
        <p><strong>Instructor:</strong> {course?.instructorName}</p>
      </div>

      <div className="mt-4 d-flex flex-column flex-md-row justify-content-md-start gap-4">
        <button className="btn btn-primary w-100 w-md-auto" onClick={handleViewMedia}>
          View/Download Media
        </button>

        <button className="btn btn-success w-100 w-md-auto" onClick={handleTakeQuiz}>
          {quizTaken ? 'Retake Quiz' : 'Take Quiz'}
        </button>
      </div>

      {quizTaken && score !== null && (
        <div className="mt-3 alert alert-success">
          ✅ You have taken the quiz. Your score: <strong>{score}</strong>
        </div>
      )}
    </div>
  );
};

export default StudentCoursePage;
