import React, { useMemo, useState } from 'react';
import { Candidate, Vote, Result, SortKey, SortOrder } from '../types';
import { PrintIcon, SortAscIcon, SortDescIcon } from './icons';

interface ResultsScreenProps {
  electionTitle: string;
  candidates: Candidate[];
  votes: Vote[];
}

const SortableHeader: React.FC<{
    label: string;
    sortKey: SortKey;
    currentSortKey: SortKey;
    sortOrder: SortOrder;
    onClick: (key: SortKey) => void;
    className?: string;
}> = ({ label, sortKey, currentSortKey, sortOrder, onClick, className }) => {
    const isActive = currentSortKey === sortKey;
    return (
        <th scope="col" className={`py-3.5 px-3 text-left text-sm font-semibold text-gray-900 dark:text-white ${className}`}>
            <button className="group inline-flex items-center" onClick={() => onClick(sortKey)}>
                {label}
                <span className={`ml-2 flex-none rounded ${isActive ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-400 invisible group-hover:visible'}`}>
                    {isActive && sortOrder === SortOrder.ASC ? <SortAscIcon className="h-5 w-5" /> : <SortDescIcon className="h-5 w-5" />}
                </span>
            </button>
        </th>
    );
};

const ResultsScreen: React.FC<ResultsScreenProps> = ({ electionTitle, candidates, votes }) => {
    const [sortKey, setSortKey] = useState<SortKey>(SortKey.PERCENTAGE);
    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);

  const results = useMemo<Result[]>(() => {
    const voteCounts = new Map<number, number>();
    candidates.forEach(c => voteCounts.set(c.id, 0));

    votes.forEach(vote => {
      vote.candidateIds.forEach(candidateId => {
        voteCounts.set(candidateId, (voteCounts.get(candidateId) || 0) + 1);
      });
    });

    const totalVotes = votes.length;

    const calculatedResults = candidates.map(candidate => ({
      ...candidate,
      votes: voteCounts.get(candidate.id) || 0,
      percentage: totalVotes > 0 ? ((voteCounts.get(candidate.id) || 0) / totalVotes) * 100 : 0,
    }));
    
    return calculatedResults.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA < valB) return sortOrder === SortOrder.ASC ? -1 : 1;
        if (valA > valB) return sortOrder === SortOrder.ASC ? 1 : -1;
        return 0;
    });

  }, [candidates, votes, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(prev => (prev === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC));
    } else {
      setSortKey(key);
      setSortOrder(SortOrder.DESC);
    }
  };

  const handlePrint = () => {
      window.print();
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-8 print:shadow-none print:rounded-none print:p-0">
      <div className="sm:flex sm:items-center sm:justify-between print:flex print:items-center print:justify-between">
        <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Kết Quả Bỏ Phiếu</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{electionTitle}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">Tổng số phiếu bầu: {votes.length}</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 print:hidden"
            >
                <PrintIcon className="h-5 w-5" />
                In kết quả
            </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-0 w-16">STT</th>
                  <SortableHeader label="Họ và Tên" sortKey={SortKey.NAME} currentSortKey={sortKey} sortOrder={sortOrder} onClick={handleSort} />
                  <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Số phiếu</th>
                  <SortableHeader label="Tỷ lệ" sortKey={SortKey.PERCENTAGE} currentSortKey={sortKey} sortOrder={sortOrder} onClick={handleSort} className="pr-4 sm:pr-0" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {results.map((person, index) => (
                  <tr key={person.id} className="odd:bg-gray-50 dark:odd:bg-gray-900/50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-0">{index + 1}</td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-800 dark:text-gray-200">{person.name}</td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-600 dark:text-gray-400 text-center font-mono">{person.votes}</td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-600 dark:text-gray-400 pr-4 sm:pr-0">
                        <div className="flex items-center gap-x-3">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${person.percentage.toFixed(1)}%` }}></div>
                            </div>
                            <span className="font-mono w-20 text-right">{person.percentage.toFixed(2)}%</span>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
