'use client';

import { useAccount, useChainId, usePublicClient } from 'wagmi';
import { useState, useEffect, useCallback } from 'react';
import { getContractAddresses } from '@/config/contracts';
import { HashKeyChainStakingABI } from '@/constants/abi';

// VeHSK unlock ratios based on staking type
const UNLOCK_RATIOS = {
  FLEXIBLE: 1 / 365,          // 灵活质押 (14天提取)
  LOCKED_30_DAYS: 1.1 / 365,  // 30天锁仓
  LOCKED_90_DAYS: 1.5 / 365,  // 90天锁仓
  LOCKED_180_DAYS: 1.8 / 365, // 180天锁仓
  LOCKED_365_DAYS: 2 / 365    // 365天锁仓
};

// Interface for veHSK data
interface VeHskData {
  totalVeHsk: bigint;
  flexibleVeHsk: bigint;
  lockedVeHsk: bigint;
  dailyVeHskRate: bigint;
  isLoading: boolean;
  error: Error | null;
}

export function useVehsk() {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [veHskData, setVeHskData] = useState<VeHskData>({
    totalVeHsk: BigInt(0),
    flexibleVeHsk: BigInt(0),
    lockedVeHsk: BigInt(0),
    dailyVeHskRate: BigInt(0),
    isLoading: false,
    error: null,
  });

  // Helper to determine lock type based on days
  const getLockTypeInfo = useCallback((daysRemaining: number) => {
    if (daysRemaining > 180) {
      return { ratio: UNLOCK_RATIOS.LOCKED_365_DAYS, period: 365 };
    } else if (daysRemaining > 90) {
      return { ratio: UNLOCK_RATIOS.LOCKED_180_DAYS, period: 180 };
    } else if (daysRemaining > 30) {
      return { ratio: UNLOCK_RATIOS.LOCKED_90_DAYS, period: 90 };
    } else {
      return { ratio: UNLOCK_RATIOS.LOCKED_30_DAYS, period: 30 };
    }
  }, []);

  // Main function to fetch and calculate veHSK
  const fetchVeHskData = useCallback(async () => {
    if (!address || !publicClient) {
      setVeHskData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setVeHskData(prev => ({ ...prev, isLoading: true, error: null }));
      const contractAddress = getContractAddresses(chainId).stakingContract;
      const currentTime = BigInt(Math.floor(Date.now() / 1000));

      // Fetch both types of stake counts
      const [lockedStakeCount, flexibleStakeCount] = await Promise.all([
        publicClient.readContract({
          address: contractAddress,
          abi: HashKeyChainStakingABI,
          functionName: 'getUserLockedStakeCount',
          args: [address],
        }),
        publicClient.readContract({
          address: contractAddress,
          abi: HashKeyChainStakingABI,
          functionName: 'getUserFlexibleStakeCount',
          args: [address],
        })
      ]) as [bigint, bigint];

      // Calculate veHSK for locked staking positions
      let totalLockedVeHsk = BigInt(0);
      let totalDailyVeHskRate = BigInt(0);
      
      // Process locked stakes
      if (Number(lockedStakeCount) > 0) {
        const lockedStakePromises = Array.from({ length: Number(lockedStakeCount) }, (_, i) =>
          publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: HashKeyChainStakingABI,
            functionName: 'getLockedStakeInfo',
            args: [address, BigInt(i)],
          }).catch(error => {
            console.error(`Error fetching locked stake ${i}:`, error);
            return null;
          }) as Promise<[bigint, bigint, bigint, bigint, boolean, boolean]>
        );
        
        const lockedStakeResults = await Promise.all(lockedStakePromises);
        
        for (const stakeInfo of lockedStakeResults) {
          if (!stakeInfo || stakeInfo[4]) continue; // Skip if null or withdrawn
          
          const hskAmount = stakeInfo[1];
          const lockEndTime = stakeInfo[3];
          const isLocked = stakeInfo[5];
          
          // Determine lock period and unlock ratio
          let { ratio: unlockRatio, period: lockPeriodDays } = 
            isLocked && lockEndTime > currentTime 
              ? getLockTypeInfo(Number((lockEndTime - currentTime) / BigInt(86400))) 
              : { ratio: UNLOCK_RATIOS.LOCKED_30_DAYS, period: 30 };
          
          // Calculate elapsed days
          const startTime = lockEndTime - BigInt(lockPeriodDays * 86400);
          const elapsedTime = currentTime > startTime ? currentTime - startTime : BigInt(0);
          const elapsedDays = Number(elapsedTime / BigInt(86400));
          
          // Calculate daily veHSK rate with precision
          const scaleFactor = BigInt(1e8);
          const dailyVeHskAmount = (hskAmount * BigInt(Math.floor(unlockRatio * Number(scaleFactor)))) / scaleFactor;
          
          // Calculate total veHSK for this position
          const actualDays = Math.min(elapsedDays, lockPeriodDays);
          const positionVeHsk = dailyVeHskAmount * BigInt(actualDays);
          
          totalLockedVeHsk += positionVeHsk;
          
          // Add to daily rate if still active
          if (isLocked && lockEndTime > currentTime) {
            totalDailyVeHskRate += dailyVeHskAmount;
          }
        }
      }

      // Calculate veHSK for flexible staking positions
      let totalFlexibleVeHsk = BigInt(0);
      
      if (Number(flexibleStakeCount) > 0) {
        const flexibleStakePromises = Array.from({ length: Number(flexibleStakeCount) }, (_, i) =>
          publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: HashKeyChainStakingABI,
            functionName: 'getFlexibleStakeInfo',
            args: [address, BigInt(i)],
          }).catch(error => {
            console.error(`Error fetching flexible stake ${i}:`, error);
            return null;
          }) as Promise<[bigint, bigint, bigint, bigint, number]>
        );
        
        const flexibleStakeResults = await Promise.all(flexibleStakePromises);
        
        // Get current block for time estimation
        const currentBlock = await publicClient.getBlockNumber();
        const averageBlockTime = BigInt(2); // Assume 2 seconds per block
        
        for (const stakeInfo of flexibleStakeResults) {
          if (!stakeInfo || stakeInfo[4] !== 0) continue; // Skip if null or not active
          
          const hskAmount = stakeInfo[1];
          const stakeBlock = stakeInfo[3];
          
          // Estimate elapsed time since staking
          const blockDiff = currentBlock - stakeBlock;
          const estimatedElapsedSeconds = blockDiff * averageBlockTime;
          const estimatedElapsedDays = Number(estimatedElapsedSeconds / BigInt(86400));
          
          // Calculate daily veHSK amount
          const scaleFactor = BigInt(1e8);
          const dailyVeHskAmount = (hskAmount * BigInt(Math.floor(UNLOCK_RATIOS.FLEXIBLE * Number(scaleFactor)))) / scaleFactor;
          
          // Calculate total veHSK for this position (max 14 days for flexible staking)
          const actualDays = Math.min(estimatedElapsedDays, 14);
          const positionVeHsk = dailyVeHskAmount * BigInt(actualDays);
          
          totalFlexibleVeHsk += positionVeHsk;
          totalDailyVeHskRate += dailyVeHskAmount;
        }
      }

      // Calculate total veHSK
      const totalVeHsk = totalLockedVeHsk + totalFlexibleVeHsk;

      setVeHskData({
        totalVeHsk,
        flexibleVeHsk: totalFlexibleVeHsk,
        lockedVeHsk: totalLockedVeHsk,
        dailyVeHskRate: totalDailyVeHskRate,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error('Failed to fetch veHSK data:', error);
      setVeHskData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch veHSK data'),
      }));
    }
  }, [address, chainId, publicClient, getLockTypeInfo]);

  // Fetch initial data and set up auto-refresh
  useEffect(() => {
    fetchVeHskData();
    
    // Refresh every 5 minutes
    const intervalId = setInterval(fetchVeHskData, 300000);
    return () => clearInterval(intervalId);
  }, [fetchVeHskData]);

  // Include manual refresh function in the return value
  return {
    ...veHskData,
    refresh: fetchVeHskData
  };
}

export default useVehsk;