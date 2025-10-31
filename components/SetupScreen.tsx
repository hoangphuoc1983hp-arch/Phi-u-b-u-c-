import React, { useState, useCallback } from 'react';
import { Candidate } from '../types';
import { extractElectionDetailsFromImage } from '../services/geminiService';
import { UploadIcon, UsersIcon } from './icons';
import Spinner from './Spinner';

interface SetupScreenProps {
  onSetupComplete: (title: string, candidates: Candidate[]) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onSetupComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{ title: string, candidates: Candidate[] } | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setExtractedData(null);

    try {
      const result = await extractElectionDetailsFromImage(file);
      setExtractedData(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStartElection = () => {
    if (extractedData) {
      onSetupComplete(extractedData.title, extractedData.candidates);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-8">
      <div className="text-center">
        <UsersIcon className="mx-auto h-12 w-12 text-blue-500" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-4">Election Setup</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Upload the ballot paper image to begin.</p>
      </div>

      {!extractedData && (
        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center">
            <UploadIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
              {isLoading ? 'Processing...' : 'Click or Drag to Upload Ballot'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">PNG, JPG, or WEBP</p>
          </div>
        </div>
      )}

      {isLoading && <Spinner message="Analyzing ballot with AI... This may take a moment." />}
      
      {error && <div className="text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg text-center">{error}</div>}

      {extractedData && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">{extractedData.title}</h2>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-3">Extracted Candidates:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 max-h-60 overflow-y-auto pr-4">
              {extractedData.candidates.sort((a,b) => a.id - b.id).map((candidate) => (
                <li key={candidate.id} className="text-gray-600 dark:text-gray-300 truncate">
                  <span className="font-semibold">{candidate.id}.</span> {candidate.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex-1 w-full relative block cursor-pointer">
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={isLoading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="text-center w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                Upload a Different Image
              </div>
            </label>
            <button
              onClick={handleStartElection}
              className="flex-1 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all transform hover:scale-105"
            >
              Confirm and Start Election
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupScreen;
