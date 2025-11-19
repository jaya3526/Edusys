import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import UserProfileMenu from './UserProfileMenu';
import { useParams } from 'react-router-dom';

const AddQuiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [numQuestions, setNumQuestions] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleNumQuestionsChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setNumQuestions(value);
      const questionCount = value === '' ? 0 : parseInt(value, 10);
      setQuestions(
        new Array(questionCount).fill(null).map(() => ({
          question: '',
          options: ['', '', '', ''],
          correctAnswer: '',
        }))
      );
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    if (field === 'options') {
      updatedQuestions[index].options = value;
    } else {
      updatedQuestions[index][field] = value;
    }
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = JSON.parse(localStorage.getItem('user'));

      if (!courseId) {
        setError('Course ID not found. Please log in again.');
        return;
      }

      const data = {
        CourseId: courseId,
        QuizData: JSON.stringify(questions),
      };

      const token = localStorage.getItem('authToken');

      const response = await axios.post(
        `https://localhost:44344/api/Course/${courseId}/add`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message || 'Quiz added successfully!');
      setError('');
      navigate('/instructor-home');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error adding quiz');
      setMessage('');
    }
  };

  return (
    <Container className="mt-5">
       <div className="d-flex justify-content-end">
        <UserProfileMenu />
      </div>

      <h2 className="mb-4 text-center">Add a New Quiz</h2>
      <h4 className="text-center mb-4">If quiz already exists, it will override the quiz questions.</h4>

      <Form onSubmit={handleSubmit}>
        <Row className="mb-4">
          <Col>
            <Form.Group controlId="numQuestions">
              <Form.Label>Number of Questions:</Form.Label>
              <Form.Control
                type="text"
                value={numQuestions}
                onChange={handleNumQuestionsChange}
                placeholder="Enter number of questions"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {questions.map((question, index) => (
          <div key={index} className="question-card mb-4 p-4 border rounded shadow-sm">
            <h4 className="mb-3">Question {index + 1}</h4>

            <Form.Group>
              <Form.Label>Question Text:</Form.Label>
              <Form.Control
                type="text"
                value={question.question}
                onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                required
              />
            </Form.Group>

            {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((label, optionIndex) => (
              <Form.Group key={optionIndex} className="mt-2">
                <Form.Label>{label}:</Form.Label>
                <Form.Control
                  type="text"
                  value={question.options[optionIndex]}
                  onChange={(e) =>
                    handleQuestionChange(
                      index,
                      'options',
                      question.options.map((opt, i) =>
                        i === optionIndex ? e.target.value : opt
                      )
                    )
                  }
                  required
                  placeholder={`Enter ${label}`}
                />
              </Form.Group>
            ))}

            <Form.Group controlId={`correctAnswer-${index}`} className="mt-2">
              <Form.Label>Correct Answer (Option Number 1-4):</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="4"
                value={question.correctAnswer}
                onChange={(e) =>
                  handleQuestionChange(index, 'correctAnswer', e.target.value)
                }
                required
              />
            </Form.Group>
          </div>
        ))}

        <Button variant="primary" type="submit" className="mt-4 w-100">
          Add Quiz
        </Button>
      </Form>

      {message && <Alert variant="success" className="mt-3">{message}</Alert>}
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
    </Container>
  );
};

export default AddQuiz;
