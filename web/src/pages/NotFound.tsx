import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="d-flex justify-content-center align-items-center">
            <div className="text-center">
                <h1>404 - Page Not Found</h1>
                <p>The page you are looking for does not exist.</p>
                <Link to="/" className="btn btn-primary">Go back to Home</Link>
            </div>
        </div>
    );
};

export default NotFound;
