
import React, { useState, useEffect } from 'react';
import './Profile.css';
import Navbar from './Navbar';
import { account } from './appwriteConfig';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '../ThemeContext'; 


const Profile = () => {
  const navigate = useNavigate();

  const { theme, toggleTheme } = useContext(ThemeContext);



  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableUser, setEditableUser] = useState({
    name: '',
    email: '',
    role: 'User',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await account.get();
        setUser({
          name: userData.name || 'No Name',
          email: userData.email,
          role: 'User',
        });
        setEditableUser({
          name: userData.name || 'No Name',
          email: userData.email,
          role: 'User',
        });
      } catch (error) {
        console.error('No active session, redirecting to login.');
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setEditableUser({ ...user });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableUser({ ...editableUser, [name]: value });
  };

  const handleSave = async () => {
    try {
      await account.updateName(editableUser.name);
      setUser(editableUser);
      setIsEditing(false);
      console.log('User updated:', editableUser);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  if (!user) return null; 

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <h2>User Profile</h2>
        <div className="profile-card">
          {isEditing ? (
            <>
              <p>
                <strong>Name:</strong>{' '}
                <input
                  type="text"
                  name="name"
                  value={editableUser.name}
                  onChange={handleChange}
                />
              </p>
              <p>
                <strong>Email:</strong> {editableUser.email}
              </p>
              <p>
                <strong>Role:</strong>{' '}
                <input
                  type="text"
                  name="role"
                  value={editableUser.role}
                  onChange={handleChange}
                />
              </p>
              <button className="btn" onClick={handleSave}>Save</button>
              <button className="btn-btn-secondary" onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <button className="edit-btn-p" onClick={handleEdit}>Edit Profile</button>
            </>
          )}
          <button
          style={{
            backgroundColor:'#3c6e71',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          onClick={toggleTheme}
        >
          Switch to {theme.name === 'light' ? 'Dark' : 'Light'} Mode
        </button>
          
        </div>
      </div>
    </>
  );
};

export default Profile;

