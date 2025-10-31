import React, { useState } from 'react';
import { Candidate, Voter } from '../types';
import { CheckCircleIcon } from './icons';

interface VotingScreenProps {
  electionTitle: string;
  candidates: Candidate[];
  voters: Voter[];
  onVote: (voter: Voter, selectedCandidateIds: number[]) => void;
}

const VotingScreen: React.FC<VotingScreenProps> = ({ electionTitle, candidates, voters, onVote }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [voterInfoSubmitted, setVoterInfoSubmitted] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<number>>(new Set());
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  const handleVoterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Họ tên và Số di động không được để trống.');
      return;
    }
    if (!/^\d{10,11}$/.test(phone)) {
        setError('Số di động không hợp lệ.');
        return;
    }
    if (voters.some(v => v.phone === phone)) {
      setError('Số di động này đã được sử dụng để bỏ phiếu.');
      return;
    }
    setError(null);
    setVoterInfoSubmitted(true);
  };

  const handleCandidateToggle = (candidateId: number) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
      } else {
        newSet.add(candidateId);
      }
      return newSet;
    });
  };
  
  const handleVoteSubmit = () => {
      if (selectedCandidates.size === 0) {
          alert("Vui lòng chọn ít nhất một ứng cử viên.");
          return;
      }
      onVote({name, phone}, Array.from(selectedCandidates));
      setVoteSubmitted(true);
  }

  if (voteSubmitted) {
      return (
          <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
              <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mt-4">Cảm ơn bạn đã bỏ phiếu!</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Kết quả sẽ được công bố sau khi cuộc bỏ phiếu kết thúc.</p>
          </div>
      )
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{electionTitle}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
            {voterInfoSubmitted ? 'Chọn những người bạn tín nhiệm' : 'Vui lòng cung cấp thông tin để bỏ phiếu'}
        </p>
      </div>

      {!voterInfoSubmitted ? (
        <form onSubmit={handleVoterSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Họ và Tên</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số di động</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="09xxxxxxxx"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-transform transform hover:scale-105">
            Tiếp tục
          </button>
        </form>
      ) : (
        <div className="animate-fade-in space-y-6">
            <div className="space-y-4">
                {candidates.sort((a,b) => a.id - b.id).map(candidate => (
                    <div key={candidate.id}
                        onClick={() => handleCandidateToggle(candidate.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedCandidates.has(candidate.id) ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 ring-2 ring-blue-500' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-blue-400'}`}>
                        <label className="flex items-center space-x-4 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedCandidates.has(candidate.id)}
                                readOnly
                                className="h-6 w-6 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                            />
                            <span className="text-lg font-medium text-gray-800 dark:text-gray-200">{candidate.name}</span>
                        </label>
                    </div>
                ))}
            </div>
            <button
              onClick={handleVoteSubmit}
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 transition-transform transform hover:scale-105"
            >
              Gửi Phiếu Bầu ({selectedCandidates.size} đã chọn)
            </button>
        </div>
      )}
    </div>
  );
};

export default VotingScreen;
