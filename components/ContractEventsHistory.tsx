'use client';

import { useState } from 'react';
import { useContractEvents } from '@/hooks/useContractEventsAll';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';

interface ContractEventsHistoryProps {
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  showOnlyUserEvents?: boolean;
}

export default function ContractEventsHistory({
  fromBlock = 0n,
  toBlock = 'latest',
  showOnlyUserEvents = false,
}: ContractEventsHistoryProps) {
  const { address, isConnected } = useAccount();
  const { stakeEvents, unstakeEvents, isLoading, error } = useContractEvents(
    fromBlock,
    toBlock,
    showOnlyUserEvents && isConnected ? address : undefined
  );
  
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  
  // Format date from block timestamp
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };
  
  // Format HSK amount
  const formatHSK = (amount: bigint) => {
    return parseFloat(formatEther(amount)).toFixed(4);
  };
  
  // Get stake type name
  const getStakeTypeName = (stakeType: number) => {
    switch (stakeType) {
      case 0: return '30 Days';
      case 1: return '90 Days';
      case 2: return '180 Days';
      case 3: return '365 Days';
      default: return 'Unknown';
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
        <p className="text-center">Loading contract events...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900">
        <p className="text-center text-red-600 dark:text-red-300">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
      <h2 className="text-xl font-bold mb-4">Contract Event History</h2>
      
      {/* Tab navigation */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 ${activeTab === 'stake' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('stake')}
        >
          Stake Events ({stakeEvents.length})
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'unstake' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('unstake')}
        >
          Unstake Events ({unstakeEvents.length})
        </button>
      </div>
      
      {/* Events table */}
      <div className="overflow-x-auto">
        {activeTab === 'stake' ? (
          stakeEvents.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">sharesAmount (HSK)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">hskAmount (HSK)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stake Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lock End Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stake ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tx Hash</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {stakeEvents.map((event, index) => (
                  <tr key={`${event.transactionHash}-${event.logIndex}`} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {event.user.slice(0, 6)}...{event.user.slice(-4)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatHSK(event.sharesAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatHSK(event.hskAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getStakeTypeName(event.stakeType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(event.lockEndTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {event.stakeId.toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <a 
                        href={`https://explorer.hsk.xyz/tx/${event.transactionHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {event.transactionHash.slice(0, 6)}...{event.transactionHash.slice(-4)}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-4">No stake events found.</p>
          )
        ) : unstakeEvents.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">sharesAmount (HSK)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">hskAmount (HSK)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Early Withdrawal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Penalty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stake ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {unstakeEvents.map((event, index) => (
                <tr key={`${event.transactionHash}-${event.logIndex}`} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {event.user.slice(0, 6)}...{event.user.slice(-4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatHSK(event.sharesAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatHSK(event.hskAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {event.isEarlyWithdrawal ? (
                      <span className="text-red-500">Yes</span>
                    ) : (
                      <span className="text-green-500">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatHSK(event.penalty)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {event.stakeId.toString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <a 
                      href={`https://explorer.hsk.xyz/tx/${event.transactionHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {event.transactionHash.slice(0, 6)}...{event.transactionHash.slice(-4)}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-4">No unstake events found.</p>
        )}
      </div>
    </div>
  );
}