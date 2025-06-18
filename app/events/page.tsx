'use client';

import { useState } from 'react';
import ContractEventsHistory from '@/components/ContractEventsHistory';

export default function EventsPage() {
  const [showOnlyUserEvents, setShowOnlyUserEvents] = useState(false);
  const [fromBlock, setFromBlock] = useState<string>('3319640');
  const [toBlock, setToBlock] = useState<string>('latest');
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState<{
    fromBlock: bigint;
    toBlock: bigint | 'latest';
    showOnlyUserEvents: boolean;
  }>({
    fromBlock: 3319640n,
    toBlock: 'latest',
    showOnlyUserEvents: false
  });

  const handleFromBlockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromBlock(e.target.value);
  };

  const handleToBlockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToBlock(e.target.value);
  };

  const handleToggleUserEvents = () => {
    setShowOnlyUserEvents(!showOnlyUserEvents);
  };

  const handleSearch = () => {
    setIsSearching(true);
    // Convert input values to the correct types
    const parsedFromBlock = fromBlock === '0' || fromBlock === '' ? 0n : BigInt(fromBlock);
    const parsedToBlock = toBlock === 'latest' ? 'latest' : BigInt(toBlock);
    
    setSearchParams({
      fromBlock: parsedFromBlock,
      toBlock: parsedToBlock,
      showOnlyUserEvents
    });
    
    // Reset searching state after a short delay to show the loading indicator
    setTimeout(() => setIsSearching(false), 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contract Event History</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter Options</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Note: Due to RPC provider limitations, events are fetched in chunks of 1000 blocks. 
          Fetching a large range may take some time.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div>
            <label htmlFor="fromBlock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Block
            </label>
            <input
              type="text"
              id="fromBlock"
              value={fromBlock}
              onChange={handleFromBlockChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>
          
          <div>
            <label htmlFor="toBlock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To Block
            </label>
            <input
              type="text"
              id="toBlock"
              value={toBlock}
              onChange={handleToBlockChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="latest"
            />
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOnlyUserEvents}
                onChange={handleToggleUserEvents}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Show only my events</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search Events'}
          </button>
        </div>
      </div>
      
      {!isSearching && (
        <ContractEventsHistory
          fromBlock={searchParams.fromBlock}
          toBlock={searchParams.toBlock}
          showOnlyUserEvents={searchParams.showOnlyUserEvents}
        />
      )}
    </div>
  );
}