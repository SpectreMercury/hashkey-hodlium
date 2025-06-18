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

export interface RequestUnstakeFlexibleEvent {
  user: `0x${string}`;
  stakeId: bigint;
  hskAmount: bigint;
  claimableBlock: bigint;
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

interface RequestUnstakeFlexibleLog extends Log {
  args: {
    user: `0x${string}`;
    stakeId: bigint;
    hskAmount: bigint;
    claimableBlock: bigint;
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

// Updated useContractEvents hook
export function useContractEvents(
  fromBlock: bigint = 0n,
  toBlock: bigint | 'latest' = 'latest',
  userAddress?: `0x${string}`
) {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const contractAddress = getContractAddresses(chainId).stakingContract;

  // Only keep state for UnstakeEvents
  const [unstakeEvents, setUnstakeEvents] = useState<UnstakeEvent[]>([]);
  const [requestUnstakeFlexibleEvents, setRequestUnstakeFlexibleEvents] = useState<RequestUnstakeFlexibleEvent[]>([]);
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
      setRequestUnstakeFlexibleEvents([]);

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
        const requestUnstakeFlexibleEventSignature = parseAbiItem('event RequestUnstakeFlexible(address indexed user, uint256 indexed stakeId, uint256 hskAmount, uint256 claimableBlock)');

        // Prepare arrays to collect all events
        const allUnstakeEvents: UnstakeEvent[] = [];
        const allRequestUnstakeFlexibleEvents: RequestUnstakeFlexibleEvent[] = [];

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

          const requestUnstakeFlexibleEventFilter = {
            address: contractAddress,
            event: requestUnstakeFlexibleEventSignature,
            fromBlock: currentFromBlock,
            toBlock: chunkToBlock,
            args: userAddress ? { user: userAddress } : undefined,
            // Note: If filtering by indexed stakeId is needed, add it here:
            // args: userAddress ? { user: userAddress, stakeId: /* your stakeId filter */ } : { stakeId: /* your stakeId filter */ },
          };

          try {
            // Fetch logs for both events concurrently
            const [unstakeLogsResult, requestUnstakeFlexibleLogsResult] = await Promise.all([
              publicClient.getLogs(unstakeEventFilter),
              publicClient.getLogs(requestUnstakeFlexibleEventFilter),
            ]);
            
            const processedUnstakeEvents = unstakeLogsResult.map(log => {
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

            const processedRequestUnstakeFlexibleEvents = requestUnstakeFlexibleLogsResult.map(log => {
              const typedLog = log as unknown as RequestUnstakeFlexibleLog;
              return {
                user: typedLog.args.user,
                stakeId: typedLog.args.stakeId,
                hskAmount: typedLog.args.hskAmount,
                // claimableBlock: typedLog.args.claimableBlock,
                blockNumber: typedLog.blockNumber ?? 0n,
                transactionHash: typedLog.transactionHash ?? '0x0' as `0x${string}`,
                // logIndex: typedLog.logIndex ?? 0,
              };
            });
            console.log(`Fetched ${processedRequestUnstakeFlexibleEvents.length} RequestUnstakeFlexible events in this chunk.`);

            allUnstakeEvents.push(...processedUnstakeEvents);
            allRequestUnstakeFlexibleEvents.push(...processedRequestUnstakeFlexibleEvents);
            setUnstakeEvents(prev => [...prev, ...processedUnstakeEvents]);
          } catch (chunkError) {
            console.error(`Error fetching events for block range ${currentFromBlock}-${chunkToBlock}:`, chunkError);
          }

          currentFromBlock = chunkToBlock + 1n;
        }

        // Sort events by block number (newest first)
        allUnstakeEvents.sort((a, b) => Number(b.blockNumber - a.blockNumber));
        allRequestUnstakeFlexibleEvents.sort((a, b) => Number(b.blockNumber - a.blockNumber));

        // Set all event states
        setUnstakeEvents(allUnstakeEvents);
        setRequestUnstakeFlexibleEvents(allRequestUnstakeFlexibleEvents);

        // Download the unstake events as JSON
        setTimeout(() => {
          console.log(`Attempting to download ${allUnstakeEvents.length} Unstake events as JSON...`);
          downloadJson(allUnstakeEvents, `unstake-events-${fromBlock}-${resolvedToBlock}.json`);
          console.log(`Attempting to download ${allRequestUnstakeFlexibleEvents.length} RequestUnstakeFlexible events as JSON...`);
          downloadJson(allRequestUnstakeFlexibleEvents, `request-unstake-flexible-events-${fromBlock}-${resolvedToBlock}.json`);
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

  return { unstakeEvents, requestUnstakeFlexibleEvents, isLoading, error }; // Return relevant state
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
    const requestUnstakeFlexibleEventSignature = parseAbiItem('event RequestUnstakeFlexible(address indexed user, uint256 indexed stakeId, uint256 hskAmount, uint256 claimableBlock)');

    const allUnstakeEvents: UnstakeEvent[] = [];
    const allRequestUnstakeFlexibleEvents: RequestUnstakeFlexibleEvent[] = [];

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

      const requestUnstakeFlexibleEventFilter = {
        address: contractAddress,
        event: requestUnstakeFlexibleEventSignature,
        fromBlock: currentFromBlock,
        toBlock: chunkToBlock,
        args: userAddress ? { user: userAddress } : undefined,
        // Note: Add stakeId filter if needed
      };

      try {
        // Fetch logs for both events concurrently
        const [unstakeLogsResult, requestUnstakeFlexibleLogsResult] = await Promise.all([
          publicClient.getLogs(unstakeEventFilter),
          publicClient.getLogs(requestUnstakeFlexibleEventFilter),
        ]);
        const processedUnstakeEvents = unstakeLogsResult.map((log) => {
          const typedLog = log as UnstakeLog; // Can be more specific now
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

        const processedRequestUnstakeFlexibleEvents = requestUnstakeFlexibleLogsResult.map((log) => {
          const typedLog = log as RequestUnstakeFlexibleLog;
          return {
            user: typedLog.args.user,
            stakeId: typedLog.args.stakeId,
            hskAmount: typedLog.args.hskAmount,
            claimableBlock: typedLog.args.claimableBlock,
            blockNumber: typedLog.blockNumber ?? 0n,
            transactionHash: typedLog.transactionHash ?? '0x0' as `0x${string}`,
            logIndex: typedLog.logIndex ?? 0,
          };
        });

        allUnstakeEvents.push(...processedUnstakeEvents);
        allRequestUnstakeFlexibleEvents.push(...processedRequestUnstakeFlexibleEvents);
      } catch (chunkError) {
        console.error(`Error fetching events for block range ${currentFromBlock}-${chunkToBlock}:`, chunkError);
      }

      currentFromBlock = chunkToBlock + 1n;
    }

    allUnstakeEvents.sort((a, b) => Number(b.blockNumber - a.blockNumber));
    allRequestUnstakeFlexibleEvents.sort((a, b) => Number(b.blockNumber - a.blockNumber));

    return { unstakeEvents: allUnstakeEvents, requestUnstakeFlexibleEvents: allRequestUnstakeFlexibleEvents }; // Return both event types
  } catch (err) {
    console.error('Error fetching contract events:', err);
    throw err;
  }
}
