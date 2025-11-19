import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserProfileMenu from './UserProfileMenu';
import axios from 'axios';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authorization token is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`https://localhost:44344/api/Course/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setCourse(response.data);
          setTitle(response.data.title);
          setDescription(response.data.description);
          setMediaUrl(response.data.mediaUrl);
        } else {
          setError('Error loading course details.');
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        setError('Error loading course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleEditCourse = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (mediaFile) {
      formData.append('mediaFile', mediaFile);
    }

    try {
      await axios.put(`https://localhost:44344/api/Course/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditing(false);
      navigate('/instructor-home');
    } catch (error) {
      console.error('Failed to update course:', error);
      setError('Failed to update the course. Please try again later.');
    }
  };

  const handleDeleteCourse = async () => {
    const token = localStorage.getItem('authToken');
    try {
      await axios.delete(`https://localhost:44344/api/Course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/instructor-home');
    } catch (error) {
      console.error('Failed to delete course:', error);
      setError('Failed to delete the course. Please try again later.');
    }
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setTitle(course.title);
    setDescription(course.description);
    setMediaUrl(course.mediaUrl);
  };

  const handleViewMedia = () => {
    window.open(mediaUrl, '_blank');
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (error) return <div className="alert alert-danger text-center mt-5">{error}</div>;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          &larr; Back
        </button>
        <UserProfileMenu />
      </div>

      <h2 className="text-center mb-4">Course Details</h2>

      {isEditing ? (
        <form onSubmit={handleEditCourse}>
          <div className="card shadow-lg p-4">
            <h4 className="mb-3">Edit Course</h4>

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
              <label htmlFor="mediaFile" className="form-label">Upload New Media</label>
              <input
                type="file"
                className="form-control"
                id="mediaFile"
                onChange={(e) => setMediaFile(e.target.files[0])}
              />
              {mediaUrl && (
                <div className="mt-2">
                  <small>Current Media: <a href={mediaUrl} target="_blank" rel="noopener noreferrer">View</a></small>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-success" disabled={!title || !description}>
                Save Changes
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancelEditing}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="card shadow-lg p-4">
          <h4 className="mb-3">{course.title}</h4>
          <p>{course.description}</p>

          {mediaUrl && (
            <div className="mt-3">
              <button className="btn btn-info" onClick={handleViewMedia}>
                View Media
              </button>
            </div>
          )}

          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-warning" onClick={handleStartEditing}>
              Edit Course
            </button>
            <button className="btn btn-danger" onClick={handleDeleteCourse}>
              Delete Course
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
