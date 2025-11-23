import React, { useState } from 'react';
import './SystemTester.css';
import { useAppContext } from '../../context/AppContext';

/**
 * System Tester Component
 * Use this to verify recommendation and notification systems are working
 * Open browser console (F12) to see detailed logs
 */
const SystemTester = () => {
  const { 
    addNotification, 
    viewingHistory, 
    notifications,
    addToViewingHistory,
    myList
  } = useAppContext();

  const [testResults, setTestResults] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  const addTestResult = (test, status, message) => {
    const result = {
      id: Date.now(),
      test,
      status, // 'pass' | 'fail' | 'info'
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev].slice(0, 20));
    
    const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : 'ℹ️';
    console.log(`${emoji} TEST [${test}]:`, message);
  };

  const runAllTests = async () => {
    console.log('🧪 RUNNING SYSTEM TESTS...');
    setTestResults([]);
    
    // Test 1: Notification System
    testNotificationSystem();
    
    // Test 2: Viewing History
    testViewingHistory();
    
    // Test 3: Recommendation Engine Data
    await testRecommendationEngine();
    
    // Test 4: My List
    testMyList();
    
    console.log('🏁 TESTS COMPLETE');
  };

  const testNotificationSystem = () => {
    console.log('\n📢 Testing Notification System...');
    
    try {
      // Test different notification types
      addNotification('Test notification: Success type', 'success');
      addTestResult('Notification System', 'pass', 'Success notification sent');
      
      setTimeout(() => {
        addNotification('Test notification: Error type', 'error');
        addTestResult('Notification System', 'pass', 'Error notification sent');
      }, 500);
      
      setTimeout(() => {
        addNotification('Test notification: Warning type', 'warning');
        addTestResult('Notification System', 'pass', 'Warning notification sent');
      }, 1000);
      
      setTimeout(() => {
        addNotification('Test notification: Info type', 'info');
        addTestResult('Notification System', 'pass', 'Info notification sent');
      }, 1500);
      
      addTestResult('Notification System', 'pass', `Current notifications: ${notifications.length}`);
      
    } catch (error) {
      addTestResult('Notification System', 'fail', error.message);
    }
  };

  const testViewingHistory = () => {
    console.log('\n📺 Testing Viewing History...');
    
    try {
      const historyCount = viewingHistory.length;
      
      if (historyCount === 0) {
        addTestResult('Viewing History', 'info', 'No viewing history yet. Watch a movie to populate.');
        console.log('⚠️ Viewing History is empty. Watch movies to test recommendations.');
      } else {
        addTestResult('Viewing History', 'pass', `Found ${historyCount} items in history`);
        
        // Log viewing history details
        console.log(`📊 Viewing History (${historyCount} items):`);
        viewingHistory.slice(0, 5).forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.title || item.name}`);
          console.log(`     Genres:`, item.genres?.map(g => g.name).join(', ') || 'N/A');
          console.log(`     Cast:`, item.credits?.cast?.slice(0, 3).map(c => c.name).join(', ') || 'N/A');
        });
        
        // Check for credits data
        const withCredits = viewingHistory.filter(item => item.credits).length;
        if (withCredits > 0) {
          addTestResult('Credits Data', 'pass', `${withCredits}/${historyCount} items have credits`);
        } else {
          addTestResult('Credits Data', 'fail', 'No credits data found. Watch movies to populate.');
        }
        
        // Check for genres
        const withGenres = viewingHistory.filter(item => item.genres?.length > 0).length;
        if (withGenres > 0) {
          addTestResult('Genre Data', 'pass', `${withGenres}/${historyCount} items have genres`);
        } else {
          addTestResult('Genre Data', 'fail', 'No genre data found');
        }
      }
      
    } catch (error) {
      addTestResult('Viewing History', 'fail', error.message);
    }
  };

  const testRecommendationEngine = async () => {
    console.log('\n🎬 Testing Recommendation Engine...');
    
    try {
      const historyCount = viewingHistory.length;
      
      if (historyCount === 0) {
        addTestResult('Recommendation Engine', 'info', 'No history - will show popular movies');
        return;
      }
      
      // Extract genres from history
      const genreCounts = {};
      viewingHistory.forEach(item => {
        (item.genres || []).forEach(genre => {
          genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
        });
      });
      
      const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => `${name} (${count})`);
      
      console.log('🎭 Top Genres:', topGenres.join(', '));
      addTestResult('Genre Analysis', 'pass', `Top genres: ${topGenres.join(', ')}`);
      
      // Extract actors/directors
      const peopleMap = new Map();
      viewingHistory.forEach(item => {
        if (item.credits) {
          // Directors
          (item.credits.crew || []).forEach(person => {
            if (person.job === 'Director') {
              const count = peopleMap.get(person.name) || 0;
              peopleMap.set(person.name, count + 1);
            }
          });
          // Actors
          (item.credits.cast || []).slice(0, 3).forEach(actor => {
            const count = peopleMap.get(actor.name) || 0;
            peopleMap.set(actor.name, count + 1);
          });
        }
      });
      
      const topPeople = Array.from(peopleMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => `${name} (${count})`);
      
      console.log('👥 Top People:', topPeople.join(', '));
      addTestResult('People Analysis', 'pass', `Top people: ${topPeople.join(', ')}`);
      
      // Extract production companies
      const companyMap = new Map();
      viewingHistory.forEach(item => {
        (item.production_companies || []).forEach(company => {
          const count = companyMap.get(company.name) || 0;
          companyMap.set(company.name, count + 1);
        });
      });
      
      const topCompanies = Array.from(companyMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => `${name} (${count})`);
      
      console.log('🏢 Top Companies:', topCompanies.join(', '));
      addTestResult('Company Analysis', 'pass', `Top companies: ${topCompanies.join(', ')}`);
      
      addTestResult('Recommendation Engine', 'pass', 'All recommendation data extracted successfully');
      
    } catch (error) {
      addTestResult('Recommendation Engine', 'fail', error.message);
    }
  };

  const testMyList = () => {
    console.log('\n⭐ Testing My List...');
    
    try {
      const listCount = myList.length;
      addTestResult('My List', 'pass', `${listCount} items in My List`);
      
      if (listCount > 0) {
        console.log(`📋 My List (${listCount} items):`);
        myList.slice(0, 5).forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.title || item.name}`);
        });
      }
      
    } catch (error) {
      addTestResult('My List', 'fail', error.message);
    }
  };

  const testRecommendationFiltering = () => {
    console.log('\n🔍 Testing Recommendation Filtering...');
    addNotification('Check console for filtering test results', 'info');
    
    console.log('To test filtering:');
    console.log('1. Go to Home page');
    console.log('2. Watch different movies (click and let them load)');
    console.log('3. Go to Recommendations page');
    console.log('4. Try filtering by:');
    console.log('   - Genre (should show dropdown with genres)');
    console.log('   - Actor/Director (should show people from your history)');
    console.log('   - Production Company (should show companies from history)');
    console.log('5. Watch console logs when filtering');
    
    addTestResult('Filter Test', 'info', 'Manual testing required - see console');
  };

  const clearAllTests = () => {
    setTestResults([]);
    console.clear();
    console.log('🧹 Test results cleared');
  };

  const simulateMovieWatch = () => {
    console.log('🎥 Simulating movie watch...');
    
    // Simulate a movie with full data
    const mockMovie = {
      id: Date.now(),
      title: 'Test Movie',
      genres: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' }
      ],
      credits: {
        cast: [
          { id: 1, name: 'Tom Hanks', character: 'Main Character' },
          { id: 2, name: 'Morgan Freeman', character: 'Supporting' }
        ],
        crew: [
          { id: 3, name: 'Christopher Nolan', job: 'Director' }
        ]
      },
      production_companies: [
        { id: 1, name: 'Warner Bros.' }
      ],
      overview: 'A test movie for system verification',
      backdrop_path: '/test.jpg',
      poster_path: '/test.jpg',
      vote_average: 8.5
    };
    
    addToViewingHistory(mockMovie);
    addNotification('Test movie added to viewing history', 'success');
    addTestResult('Movie Simulation', 'pass', 'Mock movie added to history');
    
    console.log('✅ Mock movie added. Now go to Recommendations to see it in action!');
  };

  if (!isVisible) {
    return (
      <button 
        className="system-tester-toggle"
        onClick={() => setIsVisible(true)}
        title="Open System Tester"
      >
        🧪 Test Systems
      </button>
    );
  }

  return (
    <div className="system-tester">
      <div className="system-tester-header">
        <h3>🧪 System Tester</h3>
        <button onClick={() => setIsVisible(false)}>✕</button>
      </div>

      <div className="system-tester-info">
        <p>Open browser console (F12) to see detailed logs</p>
      </div>

      <div className="system-tester-actions">
        <button onClick={runAllTests} className="btn-primary">
          🚀 Run All Tests
        </button>
        <button onClick={testNotificationSystem} className="btn-secondary">
          📢 Test Notifications
        </button>
        <button onClick={testRecommendationFiltering} className="btn-secondary">
          🔍 Test Filtering
        </button>
        <button onClick={simulateMovieWatch} className="btn-secondary">
          🎥 Add Test Movie
        </button>
        <button onClick={clearAllTests} className="btn-clear">
          🧹 Clear Results
        </button>
      </div>

      <div className="system-tester-stats">
        <div className="stat">
          <span className="stat-label">Viewing History:</span>
          <span className="stat-value">{viewingHistory.length} items</span>
        </div>
        <div className="stat">
          <span className="stat-label">Notifications:</span>
          <span className="stat-value">{notifications.length} active</span>
        </div>
        <div className="stat">
          <span className="stat-label">My List:</span>
          <span className="stat-value">{myList.length} items</span>
        </div>
      </div>

      <div className="system-tester-results">
        <h4>Test Results:</h4>
        {testResults.length === 0 ? (
          <p className="no-results">No tests run yet. Click "Run All Tests" to start.</p>
        ) : (
          testResults.map(result => (
            <div key={result.id} className={`test-result ${result.status}`}>
              <div className="result-header">
                <span className="result-icon">
                  {result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : 'ℹ️'}
                </span>
                <span className="result-test">{result.test}</span>
                <span className="result-time">{result.timestamp}</span>
              </div>
              <div className="result-message">{result.message}</div>
            </div>
          ))
        )}
      </div>

      <div className="system-tester-tips">
        <h4>💡 Tips:</h4>
        <ul>
          <li>Watch at least 3-5 movies to get good recommendations</li>
          <li>Check console logs (F12) for detailed information</li>
          <li>Notifications appear in top-right corner</li>
          <li>Recommendation filters work best with viewing history</li>
          <li>Look for emoji logs: 🎬 🔍 ✅ ❌ in console</li>
        </ul>
      </div>
    </div>
  );
};

export default SystemTester;
