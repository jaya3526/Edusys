import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Main';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentHome from './pages/StudentHome';
import InstructorHome from './pages/InstructorHome'; 
import CourseDetails from './pages/CourseDetails';
import ViewCourse from './pages/ViewCourses';
import StudentCoursePage from './pages/StudentCoursePage';
import TakeQuiz from './pages/StudentTakeQuiz';
import CoursePerformancePage from './pages/CoursePerformancePage';
import AddQuiz from './pages/AddQuiz';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/student-home" element={<StudentHome />} />
      <Route path="/instructor-home" element={<InstructorHome />} /> 
      <Route path="/course/:id" element={<CourseDetails />} />
      <Route path="/view-course/:id" element={<ViewCourse />} />
      <Route path="/student-course/:courseId" element={<StudentCoursePage />} />
      <Route path="/take-quiz/:courseId" element={<TakeQuiz />} />
      <Route path="/course/:courseId/performance" element={<CoursePerformancePage />} />
      <Route path="/:courseId/add" element={<AddQuiz />} />
    </Routes>
  );
};

export default App;
