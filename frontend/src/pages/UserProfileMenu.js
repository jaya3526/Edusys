import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const UserProfile = () => {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) setUser(userData);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="ms-auto me-3">
      <Dropdown align="end">
        <Dropdown.Toggle variant="outline-dark" id="dropdown-basic">
          <i className="bi bi-person-circle me-2" style={{ fontSize: '1.5rem' }}></i>
          {user.name}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Header>
            <strong>{user.name}</strong>
            <div className="text-muted">{user.email}</div>
          </Dropdown.Header>
          <Dropdown.Divider />
          <Dropdown.Item onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i> Logout
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default UserProfile;
