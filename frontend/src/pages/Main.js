import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container-fluid bg-light py-5">
   
      <header className="hero text-center text-white bg-primary py-5 rounded-3">
        <h1 className="display-3 fw-bold mb-3">Welcome to EduSync</h1>
        <p className="lead mb-4">Your centralized platform for smarter learning & teaching</p>
        <div className="d-flex justify-content-center">
          <Link to="/login" className="btn btn-lg btn-light mx-3 shadow-lg">Login</Link>
          <Link to="/register" className="btn btn-lg btn-outline-light mx-3 shadow-lg">Register</Link>
        </div>
      </header>

      <section className="features py-5">
        <div className="container">
          <h2 className="text-center mb-5">Why EduSync?</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card shadow-lg h-100">
                <div className="card-body">
                  <h5 className="card-title">Students</h5>
                  <p className="card-text">Enroll, learn, and attempt quizzes with a personalized dashboard.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card shadow-lg h-100">
                <div className="card-body">
                  <h5 className="card-title">Instructors</h5>
                  <p className="card-text">Upload content, manage quizzes, and view analytics easily.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card shadow-lg h-100">
                <div className="card-body">
                  <h5 className="card-title">Secure Access</h5>
                  <p className="card-text">JWT authentication and role-based navigation for secure learning.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
