import React from 'react';
import { useAppContext } from '../../context/AppContext';
import './UserDataTest.css';

const UserDataTest = () => {
  const { userProfile, viewingHistory, myList } = useAppContext();

  return (
    <div className="user-data-test">
      <h3>User Data Test</h3>
      <div className="user-info">
        <h4>Current User</h4>
        <p><strong>ID:</strong> {userProfile?.userId || 'N/A'}</p>
        <p><strong>Name:</strong> {userProfile?.name || 'N/A'}</p>
        <p><strong>Email:</strong> {userProfile?.email || 'N/A'}</p>
      </div>
      
      <div className="data-info">
        <h4>Data Status</h4>
        <p><strong>My List Items:</strong> {myList?.length || 0}</p>
        <p><strong>Watch History Items:</strong> {viewingHistory?.length || 0}</p>
      </div>
      
      {viewingHistory && viewingHistory.length > 0 && (
        <div className="history-preview">
          <h4>Recent Watch History</h4>
          <ul>
            {viewingHistory.slice(0, 3).map((item, index) => (
              <li key={index}>
                {item.title || item.name} ({item.first_air_date ? 'TV' : 'Movie'})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserDataTest;