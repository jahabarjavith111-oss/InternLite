import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RecruiterHeader = ({ subtitle, primaryAction }) => {
    const { user } = useAuth();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <header className="recruiter-header">
            <div className="recruiter-header-left">
                <div>
                    <h1 className="recruiter-header-title">{greeting}, {user?.name?.split(' ')[0] || 'Recruiter'} 👋</h1>
                    {subtitle && <p className="recruiter-header-subtitle">{subtitle}</p>}
                </div>
            </div>
            <div className="recruiter-header-right">
                {primaryAction && (
                    <Link to="/recruiter/post-internship" className="btn btn-primary">
                        + Post Internship
                    </Link>
                )}
            </div>
        </header>
    );
};

export default RecruiterHeader;
