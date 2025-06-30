// /home/leo/work/hashkey/hashkey-hodlium/hooks/useUnstakeRewardExporter.ts
'use client';

import { useEffect, useState } from 'react';
import { usePublicClient, useChainId } from 'wagmi';
import { getContractAddresses, ContractAddresses } from '@/config/contracts';
import { formatUnits, parseAbiItem, type PublicClient, formatEther } from 'viem';
import * as XLSX from 'xlsx'; // Import xlsx library
import type { UnstakeEvent, RequestUnstakeFlexibleEvent } from './useContractEvents';
import { HashKeyChainStakingABI } from '@/constants/abi'; // Import the correct ABI


// --- Interfaces ---
interface LockedUnstakeEventWithReward extends UnstakeEvent {
    reward: bigint | null; // Fetched reward, null if error
}

interface FlexibleStakeInfo {
    sharesAmount: bigint;
    hskAmount: bigint;
    currentHskValue: bigint;
    requestBlock: bigint;
    claimableBlock: bigint;
    isWithdrawn: boolean;
    reward: bigint | null; // Calculated reward
}

// Data structure for the Locked Unstake Excel export
interface FormattedExportData {
    User: string;
    'HSK Amount': number;
    'Stake ID': string;
    'Block Number': string;
    'Transaction Hash': string;
    Reward: number;
}

// Data structure for the Flexible Unstake Request Excel export
interface FormattedFlexibleExportData {
    User: string;
    'HSK Amount': number; // Formatted (Original staked amount)
    'Stake ID': string;
    'Request Block Number': string; // Block number when request was made (from event)
    'Transaction Hash': string; // Hash of the request transaction (from event)
    'Calculated Reward': number; // Formatted (currentHskValue - hskAmount)
    'Claimable Block': string; // Block number when funds can be claimed (from contract call)
}


/**
 * Exports data to an Excel file.
 * @param data Array of data objects for the Excel sheet.
 * @param filename Name of the Excel file to download (e.g., 'locked_unstake_rewards.xlsx').
 */
const exportUnstakeDataToExcel = (data: FormattedExportData[], filename: string = 'unstake_rewards.xlsx') => {
    try {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Unstake Rewards');

        // Write the file and trigger download
        XLSX.writeFile(workbook, filename);
        console.log(`Successfully triggered download for ${filename}`);
    } catch (error) {
        console.error("Error exporting data to Excel:", error);
    }
};

/**
 * Exports flexible unstake request data to an Excel file.
 * @param data Array of data objects for the Excel sheet.
 * @param filename Name of the Excel file to download (e.g., 'flexible_unstake_requests.xlsx').
 */
const exportFlexibleDataToExcel = (data: FormattedFlexibleExportData[], filename: string = 'flexible_unstake_requests.xlsx') => {
    try {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Flexible Unstake Requests');

        // Write the file and trigger download
        XLSX.writeFile(workbook, filename);
        console.log(`Successfully triggered download for ${filename}`);
    } catch (error) {
        console.error("Error exporting flexible data to Excel:", error);
    }
};


// --- The Hook ---

/**
 * Hook to fetch rewards/info for lists of UnstakeEvents (locked) and
 * RequestUnstakeFlexibleEvents, then export the data to separate Excel files.
 * @param unstakeEvents Array of UnstakeEvent objects (for locked stakes).
 * @param requestUnstakeFlexibleEvents Array of RequestUnstakeFlexibleEvent objects.
 */
export function useUnstakeRewardExporter(unstakeEvents: UnstakeEvent[], requestUnstakeFlexibleEvents: RequestUnstakeFlexibleEvent[]) {
    const chainId = useChainId();
    const publicClient = usePublicClient();
    // Use the *new* staking contract address for fetching rewards
    const contractAddress = getContractAddresses(chainId).stakingContract;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Only run if there are events and the client/address are available
        const hasLockedEvents = unstakeEvents && unstakeEvents.length > 0;
        const hasFlexibleEvents = requestUnstakeFlexibleEvents && requestUnstakeFlexibleEvents.length > 0;

        if ((!hasLockedEvents && !hasFlexibleEvents) || !publicClient || !contractAddress) {
            console.log("Exporter hook prerequisites not met or no events to process.");
            return;
        }

        const processAndExport = async () => {
            console.log(`Starting data fetch and export for ${unstakeEvents?.length ?? 0} locked and ${requestUnstakeFlexibleEvents?.length ?? 0} flexible unstake events...`);
            setIsLoading(true);
            setError(null);

            try {
                // 1. Fetch rewards for Locked Unstake events
                let eventsWithRewards: LockedUnstakeEventWithReward[] = [];
                const rewardPromises = unstakeEvents.map(event =>
                    publicClient.readContract({
                        address: contractAddress,
                        abi: HashKeyChainStakingABI, // Use the full ABI
                        functionName: 'getLockedStakeInfo', // Correct function name
                        args: [event.user, event.stakeId], // Pass user address and stakeId
                        // args: ['0xB607073D513a0Cb3577dD2Af665e034b7A9a8360', 0], // Pass user address and stakeId
                        
                    }).then(stakeInfoResult => {
                        const stakeInfo = stakeInfoResult as [bigint, bigint, bigint, bigint, boolean, boolean];
                        console.log(` event.hskAmount:`, event);
                        console.log(`Fetched stake info for stakeId ${stakeInfo[1]}:`, stakeInfo);
                        // Calculate reward: currentHskValue (index 2) - hskAmount (index 1)
                        // 34692446971816367069440  这是取回的  金额

                        // 
                        const calculatedReward = event.hskAmount - stakeInfo[1]; // Adjusted for penalty
                        console.log(`Fetched locked reward for stakeId ${event.stakeId}:`, calculatedReward);

                        return {
                            ...event,
                            reward: calculatedReward >= 0n ? calculatedReward : 0n // Ensure reward is not negative
                        };
                    }).catch(fetchError => {
                        console.error(`Failed to fetch reward for stakeId ${event.stakeId}, user ${event.user}:`, fetchError);
                        return {
                            ...event,
                            reward: null // Indicate error for this specific event
                        };
                    })
                );

                // 2. Fetch info for Flexible Unstake Request events
                let flexibleEventsWithInfo: (RequestUnstakeFlexibleEvent & { info: FlexibleStakeInfo | null })[] = [];
                const flexibleInfoPromises = requestUnstakeFlexibleEvents.map(event =>
                    publicClient.readContract({
                        address: contractAddress,
                        abi: HashKeyChainStakingABI,
                        functionName: 'getFlexibleStakeInfo', // Use the correct function
                        args: [event.user, event.stakeId],
                    }).then(flexibleInfoResult => {
                        const info = flexibleInfoResult as [bigint, bigint, bigint, bigint, bigint, boolean];
                        const calculatedReward = info[2] - info[1]; // currentHskValue - hskAmount
                        // console.log(`Fetched flexible info for stakeId ${event.stakeId}:`, info);
                        return {
                            ...event,
                            info: {
                                sharesAmount: info[0],
                                hskAmount: info[1],
                                currentHskValue: info[2],
                                requestBlock: info[3],
                                claimableBlock: info[4],
                                isWithdrawn: info[5],
                                reward: calculatedReward >= 0n ? calculatedReward : 0n
                            }
                        };
                    }).catch(fetchError => {
                        console.error(`Failed to fetch flexible info for stakeId ${event.stakeId}, user ${event.user}:`, fetchError);
                        return {
                            ...event,
                            info: null // Indicate error
                        };
                    })
                );

                // Wait for all fetches to complete
                [eventsWithRewards, flexibleEventsWithInfo] = await Promise.all([
                    Promise.all(rewardPromises),
                    Promise.all(flexibleInfoPromises)
                ]);
                console.log("Finished fetching data for both event types.");

                // 3. Prepare data for Locked Unstake Excel export
                const lockedDataToExport: FormattedExportData[] = eventsWithRewards.map(event => ({
                    'User': event.user,
                    'HSK Amount': Number(formatEther(event.hskAmount)), // Apply formatting
                    'Stake ID': event.stakeId.toString(),
                    'Block Number': event.blockNumber.toString(),
                    'Transaction Hash': event.transactionHash,
                    'Reward': Number(formatEther(event.reward ?? 0n)), // Apply formatting
                }));
                console.log("Formatted locked data prepared for export:", lockedDataToExport.length, "rows");

                // 4. Prepare data for Flexible Unstake Request Excel export
                const flexibleDataToExport: FormattedFlexibleExportData[] = flexibleEventsWithInfo
                    .filter(event => event.info !== null) // Filter out events where fetch failed
                    .map(event => ({
                        'User': event.user,
                        'HSK Amount': Number(formatEther(event.info!.hskAmount)), // Original staked amount
                        'Stake ID': event.stakeId.toString(),
                        'Request Block Number': event.blockNumber.toString(), // From the event log
                        'Transaction Hash': event.transactionHash, // From the event log
                        'Calculated Reward': Number(formatEther(event.info!.reward ?? 0n)), // Calculated reward
                        'Claimable Block': event.info!.claimableBlock.toString(), // From contract call
                    }));
                console.log("Formatted flexible data prepared for export:", flexibleDataToExport.length, "rows");

                // 5. Trigger Excel downloads
                if (lockedDataToExport.length > 0) {
                    exportUnstakeDataToExcel(lockedDataToExport, `locked_unstake_rewards_${Date.now()}.xlsx`);
                }
                if (flexibleDataToExport.length > 0) {
                    exportFlexibleDataToExcel(flexibleDataToExport, `flexible_unstake_requests_${Date.now()}.xlsx`);
                }

            } catch (err) {
                console.error('Error during reward fetching or export process:', err);
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setIsLoading(false);
                console.log("Export process finished.");
            }
        };

        // Debounce or add a trigger mechanism if needed, otherwise run immediately
        // For simplicity, running immediately when events are available.
        // Consider adding a button in your component to trigger this effect if needed.
        processAndExport();

    // Ensure dependencies are correct. Re-run if events, client, or contract address change.
    }, [unstakeEvents, requestUnstakeFlexibleEvents, publicClient, contractAddress, chainId]); // Added dependencies

    return { isLoading, error };
}
