import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserProfileMenu from './UserProfileMenu';

const StudentTakeQuiz = () => {
  const { courseId } = useParams();
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseName, setCourseName] = useState('');
  const [score, setScore] = useState(null);
  const navigate = useNavigate();

  const getAuthToken = () => localStorage.getItem('authToken');

  const fetchQuizQuestions = async (courseId) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `https://localhost:44344/api/Course/${courseId}/quiz-questions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      const parsedQuizData = JSON.parse(data.quizData);

      const formattedQuestions = parsedQuizData.map((q, index) => {
        const correctIndex = parseInt(q.correctAnswer) - 1; 
        return {
          questionId: index + 1,
          questionText: q.question,
          options: q.options,
          correctOption: String.fromCharCode(65 + correctIndex), 
        };
      });

      setCourseName(data.courseName || '');
      setQuestions(formattedQuestions);

      setAnswers(
        formattedQuestions.map((q) => ({
          questionId: q.questionId,
          selectedOption: '',
        }))
      );

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizQuestions(courseId);
  }, [courseId]);

  const handleAnswerChange = (questionId, selectedOption) => {
    const updatedAnswers = answers.map((answer) =>
      answer.questionId === questionId ? { ...answer, selectedOption } : answer
    );
    setAnswers(updatedAnswers);
  };

  const calculateScore = async () => {
    let totalScore = 0;

    questions.forEach((q) => {
      const answer = answers.find((a) => a.questionId === q.questionId);
      if (answer && answer.selectedOption === q.correctOption) {
        totalScore++;
      }
    });

    setScore(totalScore);

    const token = getAuthToken();
    try {
      await axios.post(
        `https://localhost:44344/api/Course/${courseId}/submit-quiz`,
        {
          studentId: JSON.parse(localStorage.getItem('user')).userId,
          courseId,
          Marks: totalScore,
          takenTime: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate(`/student-course/${courseId}`, {
        state: { quizTaken: true, score: totalScore },
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  if (isLoading) return <div className="container mt-5 text-center">Loading questions...</div>;

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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{courseName || 'Course'} Quiz</h2>
      </div>

      {questions.map((q) => (
        <div key={q.questionId} className="mt-4 p-4 border rounded shadow-sm">
          <h4>{q.questionText}</h4>
          {q.options.map((opt, index) => {
            const optionLetter = String.fromCharCode(65 + index); 
            return (
              <div key={index} className="form-check">
                <input
                  type="radio"
                  id={`${q.questionId}-${optionLetter}`}
                  name={`question-${q.questionId}`}
                  value={optionLetter}
                  checked={
                    answers.find((a) => a.questionId === q.questionId)?.selectedOption === optionLetter
                  }
                  onChange={() => handleAnswerChange(q.questionId, optionLetter)}
                  className="form-check-input"
                />
                <label htmlFor={`${q.questionId}-${optionLetter}`} className="form-check-label">
                  {opt}
                </label>
              </div>
            );
          })}
        </div>
      ))}

      <button onClick={calculateScore} className="btn btn-primary mt-4 w-100">
        Submit Quiz
      </button>
    </div>
  );
};

export default StudentTakeQuiz;
