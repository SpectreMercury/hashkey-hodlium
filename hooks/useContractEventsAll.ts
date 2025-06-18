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

export interface StakeEvent {
  user: `0x${string}`;
  hskAmount: bigint;
  sharesAmount: bigint;
  stakeType: number; // Corresponds to StakeType enum (e.g., 0 for 30days, 1 for 90days etc.)
  lockEndTime: bigint;
  lockEndMonth: string; // YYYY-MM format from lockEndTime
  stakeId: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
  logIndex: number;
}

// Active stakes will be of type StakeEvent
export type ActiveStakeEvent = StakeEvent;

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

interface StakeLog extends Log {
  args: {
    user: `0x${string}`;
    hskAmount: bigint;
    sharesAmount: bigint;
    stakeType: number; // Solidity enum StakeType typically uint8
    lockEndTime: bigint;
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

// Utility function to get lockEndMonth string (YYYY-MM) from UTC timestamp
const getLockEndMonth = (lockEndTimeSeconds: bigint): string => {
  const milliseconds = Number(lockEndTimeSeconds) * 1000;
  const date = new Date(milliseconds);
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // getUTCMonth() is 0-indexed
  return `${year}-${month}`;
};

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

  const [unstakeEvents, setUnstakeEvents] = useState<UnstakeEvent[]>([]);
  const [stakeEvents, setStakeEvents] = useState<StakeEvent[]>([]);
  const [activeStakeEvents, setActiveStakeEvents] = useState<ActiveStakeEvent[]>([]);
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
      setStakeEvents([]);
      setActiveStakeEvents([]);

      try {
        // Get the latest block number if toBlock is 'latest'
        let resolvedToBlock: bigint;
        if (toBlock === 'latest') {
          resolvedToBlock = await publicClient.getBlockNumber();
        } else {
          resolvedToBlock = toBlock;
        }

        // Define event filters
        const unstakeEventSignature = parseAbiItem('event Unstake(address indexed user, uint256 sharesAmount, uint256 hskAmount, bool isEarlyWithdrawal, uint256 penalty, uint256 stakeId)');
        // Assuming StakeType in Solidity is an enum represented by uint8, and stakeId is not indexed in Stake event as per user's signature.
        const stakeEventSignature = parseAbiItem('event Stake(address indexed user, uint256 hskAmount, uint256 sharesAmount, uint8 stakeType, uint256 lockEndTime, uint256 stakeId)');

        // Prepare arrays to collect all events
        const collectedUnstakeEvents: UnstakeEvent[] = [];
        const collectedStakeEvents: StakeEvent[] = [];
        
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

          const stakeEventFilter = {
            address: contractAddress,
            event: stakeEventSignature,
            fromBlock: currentFromBlock,
            toBlock: chunkToBlock,
            args: userAddress ? { user: userAddress } : undefined,
          };

          try {
            // Fetch logs for both events concurrently
            const [unstakeLogsResult, stakeLogsResult] = await Promise.all([
              publicClient.getLogs(unstakeEventFilter),
              publicClient.getLogs(stakeEventFilter),
            ]);
            
            const processedUnstakeEvents = unstakeLogsResult.map(log => {
              const typedLog = log as unknown as UnstakeLog; // Keep as unknown for broader compatibility if strict types are not guaranteed
              return {
                user: typedLog.args.user,
                sharesAmount: typedLog.args.sharesAmount,
                hskAmount: typedLog.args.hskAmount,
                isEarlyWithdrawal: typedLog.args.isEarlyWithdrawal,
                penalty: typedLog.args.penalty,
                stakeId: typedLog.args.stakeId,
                blockNumber: typedLog.blockNumber ?? 0n, // Provide default for potentially null values
                transactionHash: typedLog.transactionHash ?? '0x' as `0x${string}`, // Default to '0x'
                logIndex: typedLog.logIndex ?? 0, // Default to 0
              };
            });
            console.log(`Fetched ${processedUnstakeEvents.length} Unstake events in this chunk.`);

            const processedStakeEvents = stakeLogsResult
              .map(log => {
                const typedLog = log as unknown as StakeLog; // Keep as unknown for broader compatibility
                return {
                  user: typedLog.args.user,
                  hskAmount: typedLog.args.hskAmount,
                  sharesAmount: typedLog.args.sharesAmount,
                  stakeType: typedLog.args.stakeType, // Assuming stakeType is uint8 from event
                  lockEndTime: typedLog.args.lockEndTime,
                  lockEndMonth: getLockEndMonth(typedLog.args.lockEndTime),
                  stakeId: typedLog.args.stakeId,
                  blockNumber: typedLog.blockNumber ?? 0n,
                  transactionHash: typedLog.transactionHash ?? '0x' as `0x${string}`,
                  logIndex: typedLog.logIndex ?? 0,
                };
              })
              .filter(event => event.stakeType != 4); // Filter for stakeType 4
            console.log(`Fetched ${processedStakeEvents.length} Stake events in this chunk.`);

            if (processedUnstakeEvents.length > 0) {
              collectedUnstakeEvents.push(...processedUnstakeEvents);
              setUnstakeEvents(prev => [...prev, ...processedUnstakeEvents]);
            }
            if (processedStakeEvents.length > 0) {
              collectedStakeEvents.push(...processedStakeEvents);
              setStakeEvents(prev => [...prev, ...processedStakeEvents]);
            }
          } catch (chunkError) {
            console.error(`Error fetching events for block range ${currentFromBlock}-${chunkToBlock}:`, chunkError);
          }

          currentFromBlock = chunkToBlock + 1n;
        }

        // Sort events by block number (newest first)
        collectedUnstakeEvents.sort((a, b) => Number(b.blockNumber - a.blockNumber));
        collectedStakeEvents.sort((a, b) => Number(b.blockNumber - a.blockNumber));

        setUnstakeEvents(collectedUnstakeEvents);
        setStakeEvents(collectedStakeEvents);

        // Determine active stakes
        const unstakedStakeIds = new Set(collectedUnstakeEvents.map(e => `${e.user.toLowerCase()}-${e.stakeId.toString()}`));
        const finalActiveStakes = collectedStakeEvents.filter(stakeEvent => {
          const key = `${stakeEvent.user.toLowerCase()}-${stakeEvent.stakeId.toString()}`;
          return !unstakedStakeIds.has(key);
        });
        // Active stakes are already sorted as they are filtered from sorted collectedStakeEvents
        setActiveStakeEvents(finalActiveStakes);

        // Download the unstake events as JSON
        setTimeout(() => {
          console.log(`Attempting to download ${collectedUnstakeEvents.length} Unstake events as JSON...`);
          downloadJson(collectedUnstakeEvents, `unstake-events-${fromBlock}-${resolvedToBlock}.json`);
          console.log(`Attempting to download ${collectedStakeEvents.length} Stake events as JSON...`);
          downloadJson(collectedStakeEvents, `stake-events-${fromBlock}-${resolvedToBlock}.json`);
          console.log(`Attempting to download ${finalActiveStakes.length} Active Stake events as JSON...`);
          downloadJson(finalActiveStakes, `active-stakes-${fromBlock}-${resolvedToBlock}.json`);
        }, 1000);

      } catch (err) {
        console.error('Error fetching contract events:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [publicClient, contractAddress, fromBlock, toBlock, userAddress]);

  return { unstakeEvents, stakeEvents, activeStakeEvents, isLoading, error };
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

    const unstakeEventSignature = parseAbiItem('event Unstake(address indexed user, uint256 sharesAmount, uint256 hskAmount, bool isEarlyWithdrawal, uint256 penalty, uint256 stakeId)');
    const stakeEventSignature = parseAbiItem('event Stake(address indexed user, uint256 hskAmount, uint256 sharesAmount, uint8 stakeType, uint256 lockEndTime, uint256 stakeId)');
    
    const allUnstakeEvents: UnstakeEvent[] = [];
    const allStakeEvents: StakeEvent[] = [];

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

      const stakeEventFilter = {
        address: contractAddress,
        event: stakeEventSignature,
        fromBlock: currentFromBlock,
        toBlock: chunkToBlock,
        args: userAddress ? { user: userAddress } : undefined,
      };

      try {
        const [unstakeLogsResult, stakeLogsResult] = await Promise.all([
          publicClient.getLogs(unstakeEventFilter),
          publicClient.getLogs(stakeEventFilter),
        ]);
        const processedUnstakeEvents = unstakeLogsResult.map(log => {
            const typedLog = log as unknown as UnstakeLog;
            return {
              user: typedLog.args.user,
              sharesAmount: typedLog.args.sharesAmount,
              hskAmount: typedLog.args.hskAmount,
              isEarlyWithdrawal: typedLog.args.isEarlyWithdrawal,
              penalty: typedLog.args.penalty,
              stakeId: typedLog.args.stakeId,
              blockNumber: typedLog.blockNumber ?? 0n,
              transactionHash: typedLog.transactionHash ?? '0x' as `0x${string}`,
              logIndex: typedLog.logIndex ?? 0,
            };
          });

        const processedStakeEvents = stakeLogsResult
          .map(log => {
            const typedLog = log as unknown as StakeLog;
            return {
              user: typedLog.args.user,
              hskAmount: typedLog.args.hskAmount,
              sharesAmount: typedLog.args.sharesAmount,
              stakeType: typedLog.args.stakeType,
              lockEndTime: typedLog.args.lockEndTime,
              lockEndMonth: getLockEndMonth(typedLog.args.lockEndTime),
              stakeId: typedLog.args.stakeId,
              blockNumber: typedLog.blockNumber ?? 0n,
              transactionHash: typedLog.transactionHash ?? '0x' as `0x${string}`,
              logIndex: typedLog.logIndex ?? 0,
            };
          })
          .filter(event => event.stakeType != 4); // Filter for stakeType 4

        allUnstakeEvents.push(...processedUnstakeEvents);
        allStakeEvents.push(...processedStakeEvents);
      } catch (chunkError) {
        console.error(`Error fetching events for block range ${currentFromBlock}-${chunkToBlock}:`, chunkError);
      }

      currentFromBlock = chunkToBlock + 1n;
    }
    
    allUnstakeEvents.sort((a, b) => Number(b.blockNumber - a.blockNumber));
    allStakeEvents.sort((a, b) => Number(b.blockNumber - a.blockNumber));

    const unstakedStakeIds = new Set(allUnstakeEvents.map(e => `${e.user.toLowerCase()}-${e.stakeId.toString()}`));
    const activeStakeEvents = allStakeEvents.filter(stakeEvent => {
      const key = `${stakeEvent.user.toLowerCase()}-${stakeEvent.stakeId.toString()}`;
      return !unstakedStakeIds.has(key);
    });

    return { unstakeEvents: allUnstakeEvents, stakeEvents: allStakeEvents, activeStakeEvents };
  } catch (err) {
    console.error('Error fetching contract events:', err);
    throw err;
  }
}
