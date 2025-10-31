import React, { useState } from 'react';
import { AppState, Candidate, Voter, Vote } from './types';
import SetupScreen from './components/SetupScreen';
import VotingScreen from './components/VotingScreen';
import ResultsScreen from './components/ResultsScreen';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [electionTitle, setElectionTitle] = useState<string>('Election');

  const handleSetupComplete = (title: string, newCandidates: Candidate[]) => {
    setElectionTitle(title);
    setCandidates(newCandidates);
    setAppState(AppState.VOTING);
  };
  
  const handleVote = (voter: Voter, selectedCandidateIds: number[]) => {
      setVoters(prev => [...prev, voter]);
      setVotes(prev => [...prev, { voterPhone: voter.phone, candidateIds: selectedCandidateIds }]);
  }
  
  const handleEndElection = () => {
      if (window.confirm("Are you sure you want to end the election? No more votes can be cast.")) {
          setAppState(AppState.RESULTS);
      }
  }

  const renderContent = () => {
    switch (appState) {
      case AppState.SETUP:
        return <SetupScreen onSetupComplete={handleSetupComplete} />;
      case AppState.VOTING:
        return <VotingScreen electionTitle={electionTitle} candidates={candidates} voters={voters} onVote={handleVote} />;
      case AppState.RESULTS:
        return <ResultsScreen electionTitle={electionTitle} candidates={candidates} votes={votes} />;
      default:
        return <div>Error: Invalid application state.</div>;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 font-sans text-gray-800 dark:text-gray-200">
      <main className="w-full">
        {renderContent()}
      </main>

      {appState === AppState.VOTING && (
        <div className="fixed bottom-4 right-4 print:hidden">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-white">Admin Controls</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Total Voters: {voters.length}</p>
                <button
                    onClick={handleEndElection}
                    className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
                >
                    End Election
                </button>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;
