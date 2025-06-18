'use client';

import { useState, useCallback } from 'react';
import { usePublicClient, useChainId } from 'wagmi';
import { formatEther } from 'viem';
import { getContractAddresses } from '@/config/contracts';
import { HashKeyChainStakingABI } from '@/constants/abi'; // Assuming this is the correct ABI for stakingContract
import rawActiveStakesData from './active-stakes-3319640-7937113.json'; // Import the JSON data

/**
 * APR Configuration
 * key: stakeType (from your StakeEvent definition)
 * value: APR, unit is basis points (e.g., 500 for 5% APR)
 * Please adjust these values according to your contract logic.
 */
const APR_CONFIG: Record<number, number> = {
  0: 41,  // Example: StakeType 0 (e.g., 30 days) -> 5% APR
  1: 135,  // Example: StakeType 1 (e.g., 90 days) -> 7% APR
  2: 245, // Example: StakeType 2 (e.g., 180 days) -> 10% APR
  3: 495, // Example: StakeType 3 (e.g., 365 days) -> 12% APR
};

const SECONDS_IN_YEAR = BigInt(365 * 24 * 60 * 60);
const BASIS_POINTS_DENOMINATOR = 10000n; // 100% = 10000 basis points

// Interface for the raw stake data as it comes from the JSON file
interface JsonStakeData {
  user: `0x${string}`;
  hskAmount: string;
  sharesAmount: string;
  stakeType: number;
  lockEndTime: string;
  lockEndMonth: string;
  stakeId: string;
  blockNumber: string;
  transactionHash: `0x${string}`;
  logIndex: number;
}

// Interface for the processed stake data including new fields
export interface ProcessedStakeData extends JsonStakeData {
  earnedReward: string;           // Already earned reward (as string)
  estimatedRemainingReward: string; // Estimated future reward (as string)
  totalEstimatedReward: string;   // Sum of earned and estimated future (as string)
  processingError?: string;       // Optional error message if processing failed for this item
}

// Interface for reward summaries
export interface RewardSummary {
  byStakeType: {
    monthly30Reward?: string;   // Corresponds to stakeType 0
    monthly90Reward?: string;   // Corresponds to stakeType 1
    monthly180Reward?: string;  // Corresponds to stakeType 2
    monthly365Reward?: string;  // Corresponds to stakeType 3
    [key: string]: string | undefined; // For any other unmapped stake types
  };
  totalMonthlyReward: string; // Total estimated reward for this month across all types
}

export interface YearlyRewardSummary {
  [year: string]: string; // Total estimated reward for this year
}

export interface AllSummaries {
  monthlySummaries: {
    [lockEndMonth: string]: RewardSummary;
  };
  yearlySummaries: YearlyRewardSummary;
  grandTotalReward: string; // Grand total of all estimated rewards
}

// Mapping from stakeType to descriptive key for summaries
const stakeTypeToRewardKey: Record<number, keyof RewardSummary['byStakeType']> = {
  0: 'monthly30Reward',
  1: 'monthly90Reward',
  2: 'monthly180Reward',
  3: 'monthly365Reward',
};

// Utility function to download data as JSON (copied from useContractEventsAll.ts for encapsulation)
const downloadJson = (data: any, filename: string = 'data.json') => {
  const jsonString = JSON.stringify(
    data,
    (key, value) => (typeof value === 'bigint' ? value.toString() : value),
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

export function useProcessAndDownloadStakes() {
  const chainId = useChainId();
  const publicClient = usePublicClient();

  const [processedData, setProcessedData] = useState<ProcessedStakeData[]>([]);
  const [rewardSummaries, setRewardSummaries] = useState<AllSummaries | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const processAndDownload = useCallback(async (
    stakesToProcess: JsonStakeData[] = rawActiveStakesData as JsonStakeData[],
    outputFilename: string = `processed-active-stakes-${Date.now()}.json`
  ) => {
    if (!publicClient) {
      setError(new Error("Public client is not available."));
      console.error("Public client is not available.");
      return;
    }
    const contractAddress = getContractAddresses(chainId).stakingContract;
    if (!contractAddress) {
        setError(new Error("Staking contract address not found for the current chain."));
        console.error("Staking contract address not found for the current chain.");
        return;
    }

    setIsLoading(true);
    setError(null);
    const results: ProcessedStakeData[] = [];
    const currentTimeSeconds = BigInt(Math.floor(Date.now() / 1000));

    for (const stake of stakesToProcess) {
      const userAddress = stake.user;
      const stakeIdBI = BigInt(stake.stakeId);
      const hskAmountBI = BigInt(stake.hskAmount); // This is the original principal amount
      const lockEndTimeBI = BigInt(stake.lockEndTime);

      try {
        // 1. Get already earned reward using getStakeReward
        const rewardInfo = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: HashKeyChainStakingABI,
          functionName: 'getStakeReward',
          args: [userAddress, stakeIdBI],
        }) as [bigint, bigint, bigint, bigint]; // [originalAmount, reward, actualReward, totalValue]
        
        const earnedReward = rewardInfo[1]; // `reward` is the already accumulated reward

        // 2. Estimate remaining reward
        let estimatedRemainingReward = 0n;
        const aprInBasisPoints = BigInt(APR_CONFIG[stake.stakeType] || 0);

        if (aprInBasisPoints > 0n && lockEndTimeBI > currentTimeSeconds) {
          const remainingTimeInSeconds = lockEndTimeBI - currentTimeSeconds;
          if (remainingTimeInSeconds > 0n) {
            // Estimated Reward = Principal * APR_per_second * Remaining_Seconds
            // APR_per_second = (APR_in_basis_points / BASIS_POINTS_DENOMINATOR) / SECONDS_IN_YEAR
            estimatedRemainingReward = (hskAmountBI * aprInBasisPoints * remainingTimeInSeconds) / (BASIS_POINTS_DENOMINATOR * SECONDS_IN_YEAR);
          }
        }
        
        const totalEstimatedReward = earnedReward + estimatedRemainingReward;

        results.push({
          ...stake,
          earnedReward: earnedReward.toString(),
          estimatedRemainingReward: estimatedRemainingReward.toString(),
          totalEstimatedReward: totalEstimatedReward.toString(),
        });
      } catch (e: any) {
        console.error(`Error processing stake ID ${stake.stakeId} for user ${userAddress}:`, e.message);
        results.push({
          ...stake,
          earnedReward: '0',
          estimatedRemainingReward: '0',
          totalEstimatedReward: '0',
          processingError: e.message || 'Failed to process stake',
        });
      }
    }

    setProcessedData(results);
    setIsLoading(false);

    // Trigger download of the processed data
    downloadJson(results, outputFilename);
    console.log(`Processed data ready for download as ${outputFilename}`);

    // Now, calculate summaries
    const monthlySummaries: AllSummaries['monthlySummaries'] = {};
    const yearlySummaries: AllSummaries['yearlySummaries'] = {};
    let grandTotalRewardBI = 0n;

    for (const stake of results) {
      if (stake.processingError) continue; // Skip stakes that had errors

      const lockEndMonth = stake.lockEndMonth; // YYYY-MM
      const year = lockEndMonth.substring(0, 4);
      const stakeType = stake.stakeType;
      const totalEstimatedRewardBI = BigInt(stake.totalEstimatedReward);

      grandTotalRewardBI += totalEstimatedRewardBI;

      // Initialize month summary if not exists
      if (!monthlySummaries[lockEndMonth]) {
        monthlySummaries[lockEndMonth] = {
          byStakeType: {}, // Will store Ether amounts as strings
          totalMonthlyReward: '0', // Will store Ether amounts as strings
        };
      }

      // Sum by stake type for the month
      const rewardKey = stakeTypeToRewardKey[stakeType];
      if (rewardKey) {
        // Accumulate in BigInt (wei) first, reading from the temporary _wei suffixed key
        const currentSumForTypeWei = BigInt((monthlySummaries[lockEndMonth].byStakeType as any)[rewardKey + '_wei'] || '0');
        (monthlySummaries[lockEndMonth].byStakeType as any)[rewardKey + '_wei'] = (currentSumForTypeWei + totalEstimatedRewardBI).toString(); // Store wei sum temporarily
      } else {
        // Handle unmapped stake types if necessary, e.g., by logging or using a generic key
        console.warn(`Unmapped stakeType encountered for summary: ${stakeType}`);
      }

      // Sum total for the month
      // Read from the temporary _wei suffixed key, or '0' if it doesn't exist yet
      const currentMonthSumWei = BigInt((monthlySummaries[lockEndMonth] as any).totalMonthlyReward_wei || '0');
      (monthlySummaries[lockEndMonth] as any).totalMonthlyReward_wei = (currentMonthSumWei + totalEstimatedRewardBI).toString(); // Store wei sum temporarily

      // Yearly sums will also be accumulated in wei and converted later
      const currentYearSumWei = BigInt((yearlySummaries as any)[year + '_wei'] || '0');
      (yearlySummaries as any)[year + '_wei'] = (currentYearSumWei + totalEstimatedRewardBI).toString();
    }

    const allSummariesData: AllSummaries = {
      monthlySummaries,
      yearlySummaries,
      grandTotalReward: grandTotalRewardBI.toString(),
    };

    // Convert all wei amounts in summaries to Ether strings
    for (const month in allSummariesData.monthlySummaries) {
      const monthSummary = allSummariesData.monthlySummaries[month];
      for (const typeKey in monthSummary.byStakeType) {
        if (typeKey.endsWith('_wei')) {
          const etherKey = typeKey.replace('_wei', '') as keyof RewardSummary['byStakeType'];
          monthSummary.byStakeType[etherKey] = formatEther(BigInt((monthSummary.byStakeType as any)[typeKey]));
          delete (monthSummary.byStakeType as any)[typeKey]; // remove temporary wei key
        }
      }
      monthSummary.totalMonthlyReward = formatEther(BigInt((monthSummary as any).totalMonthlyReward_wei));
      delete (monthSummary as any).totalMonthlyReward_wei;
    }

    for (const year in allSummariesData.yearlySummaries) {
      if (year.endsWith('_wei')) {
        const etherKey = year.replace('_wei', '');
        allSummariesData.yearlySummaries[etherKey] = formatEther(BigInt(allSummariesData.yearlySummaries[year]));
        delete allSummariesData.yearlySummaries[year];
      }
    }
    allSummariesData.grandTotalReward = formatEther(grandTotalRewardBI);

    setRewardSummaries(allSummariesData);

    // Trigger download for summaries
    downloadJson(allSummariesData, `reward-summaries-${Date.now()}.json`);
    console.log(`Reward summaries ready for download as reward-summaries-${Date.now()}.json`);

  }, [publicClient, chainId]);

  return {
    processedData, // The data after processing
    isLoading,
    error,
    processAndDownload, // Function to trigger processing and download
    rewardSummaries, // The calculated summaries
  };
}