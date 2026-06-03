import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VisualAssessment from './components/VisualAssessment';
import VoiceAssessment from './components/VoiceAssessment';
import Progress from './components/Progress';
import Reports from './components/Reports';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // GLOBAL STATE: Profiles and their Assessment History
  const [profiles, setProfiles] = useState([
    {
      id: 'p1',
      name: 'Aryan',
      age: 8,
      history: [
        // Baseline fake assessment to show initial graph
        {
          id: 'base1',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleString(), // 7 days ago
          score: 25,
          riskLevel: 'Low Risk',
          confidence: '89.5',
          type: 'Visual Scan',
          wpm: null,
          readingAccuracy: null
        },
        {
          id: 'base2',
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toLocaleString(), // 6 days ago
          score: null,
          riskLevel: 'Fluent',
          type: 'Voice Fluency',
          wpm: 72,
          readingAccuracy: 88
        }
      ]
    }
  ]);
  
  const [activeProfileId, setActiveProfileId] = useState('p1');
  
  // Derived state for the currently active profile
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  // Function to add a new child profile
  const addProfile = (name, age) => {
    const newProfile = {
      id: 'p' + Date.now(),
      name,
      age,
      history: []
    };
    setProfiles([...profiles, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  // Function to save a new assessment to the active profile
  const addAssessment = (assessmentData) => {
    setProfiles(prevProfiles => {
      return prevProfiles.map(p => {
        if (p.id === activeProfileId) {
          return {
            ...p,
            history: [...p.history, { 
              id: 'a' + Date.now(),
              date: new Date().toLocaleString(),
              ...assessmentData 
            }]
          };
        }
        return p;
      });
    });
    // Optional: Switch to dashboard or progress after taking an assessment
    // setActiveTab('progress');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        profiles={profiles}
        activeProfileId={activeProfileId}
        setActiveProfileId={setActiveProfileId}
        addProfile={addProfile}
      />
      
      <main className="flex-1 relative overflow-hidden flex flex-col pb-20 md:pb-0 order-first md:order-last">
        {activeTab === 'dashboard' && (
          <Dashboard 
            setActiveTab={setActiveTab} 
            activeProfile={activeProfile} 
          />
        )}
        {activeTab === 'visual-assessment' && (
          <VisualAssessment 
            addAssessment={addAssessment} 
            activeProfile={activeProfile} 
          />
        )}
        {activeTab === 'voice-assessment' && (
          <VoiceAssessment 
            addAssessment={addAssessment} 
            activeProfile={activeProfile} 
          />
        )}
        {activeTab === 'progress' && (
          <Progress 
            activeProfile={activeProfile} 
          />
        )}
        {activeTab === 'reports' && (
          <Reports 
            activeProfile={activeProfile} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
