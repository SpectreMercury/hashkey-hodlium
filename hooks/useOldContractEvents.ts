'use client';

import { useEffect, useState } from 'react';
import { usePublicClient, useChainId } from 'wagmi';
import { getContractAddresses } from '@/config/contracts';
import { 
  createPublicClient, 
  http,
  parseAbiItem, 
  type PublicClient,
  type Log
} from 'viem';
import { mainnet } from 'viem/chains';

export interface UnstakeEvent {
  user: `0x${string}`;
  sharesAmount: bigint;
  hskAmount: bigint;
  isEarlyWithdrawal: boolean;
  penalty: bigint;
  stakeId: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
  logIndex: number;
}


interface UnstakeLog extends Log {
  args: {
    user: `0x${string}`;
    sharesAmount: bigint;
    hskAmount: bigint;
    isEarlyWithdrawal: boolean;
    penalty: bigint;
    stakeId: bigint;
  };
}

// Extend globalThis to include publicClient
declare global {
  interface Window {
    publicClient?: PublicClient;
  }
}

// Constants
const MAX_BLOCK_RANGE = 1000; // Maximum block range allowed by the RPC provider

// Utility function to download data as JSON
const downloadJson = (data: any, filename: string = 'data.json') => {
  // Convert BigInts to strings for JSON compatibility
  const jsonString = JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value, 
    2 // Indent for readability
  );
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Updated useOldContractEvents hook
export function useOldContractEvents(
  fromBlock: bigint = 0n,
  toBlock: bigint | 'latest' = 'latest',
  userAddress?: `0x${string}`
) {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const contractAddress = getContractAddresses(chainId).stakingOldContract;

  // Only keep state for UnstakeEvents
  const [unstakeEvents, setUnstakeEvents] = useState<UnstakeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!publicClient || !contractAddress) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setUnstakeEvents([]);

      try {
        // Get the latest block number if toBlock is 'latest'
        let resolvedToBlock: bigint;
        if (toBlock === 'latest') {
          resolvedToBlock = await publicClient.getBlockNumber();
        } else {
          resolvedToBlock = toBlock;
        }

        // Define event filters
        // Only need Unstake event
        const unstakeEventSignature = parseAbiItem('event Unstake(address indexed user, uint256 sharesAmount, uint256 hskAmount, bool isEarlyWithdrawal, uint256 penalty, uint256 stakeId)');

        // Prepare arrays to collect all events
        const allUnstakeEvents: UnstakeEvent[] = [];

        // Fetch events in chunks
        let currentFromBlock = fromBlock;
        while (currentFromBlock <= resolvedToBlock) {
          const chunkToBlock = currentFromBlock + BigInt(MAX_BLOCK_RANGE) > resolvedToBlock 
            ? resolvedToBlock 
            : currentFromBlock + BigInt(MAX_BLOCK_RANGE - 1);

          console.log(`Fetching events from block ${currentFromBlock} to ${chunkToBlock}`);

          const unstakeEventFilter = {
            address: contractAddress,
            event: unstakeEventSignature,
            fromBlock: currentFromBlock,
            toBlock: chunkToBlock,
            args: userAddress ? { user: userAddress } : undefined,
          };

          try {
            // Fetch logs only for Unstake event
            const unstakeLogsResult = await publicClient.getLogs(unstakeEventFilter);
            
            const processedUnstakeEvents = unstakeLogsResult.map(log => {
              // Cast to UnstakeLog, assuming the ABI matches
              const typedLog = log as unknown as UnstakeLog;
              return {
                user: typedLog.args.user,
                // sharesAmount: typedLog.args.sharesAmount,
                hskAmount: typedLog.args.hskAmount,
                // isEarlyWithdrawal: typedLog.args.isEarlyWithdrawal,
                // penalty: typedLog.args.penalty,
                stakeId: typedLog.args.stakeId,
                blockNumber: typedLog.blockNumber ?? 0n,
                transactionHash: typedLog.transactionHash ?? '0x0' as `0x${string}`,
                // logIndex: typedLog.logIndex ?? 0,
              };
            });
            console.log(`Fetched ${processedUnstakeEvents.length} Unstake events in this chunk.`);

            allUnstakeEvents.push(...processedUnstakeEvents);
            setUnstakeEvents(prev => [...prev, ...processedUnstakeEvents]); // Update state incrementally if needed, or just set at the end
          } catch (chunkError) {
            console.error(`Error fetching events for block range ${currentFromBlock}-${chunkToBlock}:`, chunkError);
          }

          currentFromBlock = chunkToBlock + 1n;
        }

        // Sort events by block number (newest first)
        allUnstakeEvents.sort((a, b) => Number(b.blockNumber - a.blockNumber));

        // Set all event states
        setUnstakeEvents(allUnstakeEvents);

        // Download the unstake events as JSON
        setTimeout(() => {
          console.log(`Attempting to download ${allUnstakeEvents.length} Unstake events as JSON...`);
          downloadJson(allUnstakeEvents, `unstake-old-${fromBlock}-${resolvedToBlock}.json`);
        }, 1000);

        // Calculate total difference

      } catch (err) {
        console.error('Error fetching contract events:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [publicClient, contractAddress, fromBlock, toBlock, userAddress]);

  return { unstakeEvents, isLoading, error }; // Return only unstake state
}

// Utility function to fetch contract events (unchanged)
export async function fetchContractEvents(
  contractAddress: `0x${string}`,
  fromBlock: bigint = 4189965n,
  toBlock: bigint | 'latest' = 'latest',
  userAddress?: `0x${string}`,
  rpcUrl?: string
) {
  const client = rpcUrl 
    ? createPublicClient({
        chain: mainnet,
        transport: http(rpcUrl),
      })
    : undefined;

  const publicClient = client || (typeof window !== 'undefined' ? window.publicClient : undefined);

  if (!publicClient) {
    throw new Error('No public client available. Please provide an RPC URL or ensure a global client exists.');
  }

  try {
    let resolvedToBlock: bigint;
    if (toBlock === 'latest') {
      resolvedToBlock = await publicClient.getBlockNumber();
    } else {
      resolvedToBlock = toBlock;
    }

    // Only need Unstake event
    const unstakeEventSignature = parseAbiItem('event Unstake(address indexed user, uint256 sharesAmount, uint256 hskAmount, bool isEarlyWithdrawal, uint256 penalty, uint256 stakeId)');

    const allUnstakeEvents: UnstakeEvent[] = [];

    let currentFromBlock = fromBlock;
    while (currentFromBlock <= resolvedToBlock) {
      const chunkToBlock = currentFromBlock + BigInt(MAX_BLOCK_RANGE) > resolvedToBlock 
        ? resolvedToBlock 
        : currentFromBlock + BigInt(MAX_BLOCK_RANGE - 1);

      console.log(`Fetching events from block ${currentFromBlock} to ${chunkToBlock}`);

      const unstakeEventFilter = {
        address: contractAddress,
        event: unstakeEventSignature,
        fromBlock: currentFromBlock,
        toBlock: chunkToBlock,
        args: userAddress ? { user: userAddress } : undefined,
      };

      try {
        // Fetch logs only for Unstake event
        const unstakeLogsResult = await publicClient.getLogs(unstakeEventFilter);

        const processedUnstakeEvents = unstakeLogsResult.map((log) => {
          const typedLog = log as UnstakeLog;
          return {
            user: typedLog.args.user,
            sharesAmount: typedLog.args.sharesAmount,
            hskAmount: typedLog.args.hskAmount,
            isEarlyWithdrawal: typedLog.args.isEarlyWithdrawal,
            penalty: typedLog.args.penalty,
            stakeId: typedLog.args.stakeId,
            blockNumber: typedLog.blockNumber ?? 0n,
            transactionHash: typedLog.transactionHash ?? '0x0' as `0x${string}`,
            logIndex: typedLog.logIndex ?? 0,
          };
        });

        allUnstakeEvents.push(...processedUnstakeEvents);
      } catch (chunkError) {
        console.error(`Error fetching events for block range ${currentFromBlock}-${chunkToBlock}:`, chunkError);
      }

      currentFromBlock = chunkToBlock + 1n;
    }

    allUnstakeEvents.sort((a, b) => Number(b.blockNumber - a.blockNumber));

    return { unstakeEvents: allUnstakeEvents }; // Return only unstake events
  } catch (err) {
    console.error('Error fetching contract events:', err);
    throw err;
  }
}