// Example Usage in a React Component (e.g., a dedicated export page/component)
'use client'; // Ensure this is marked as a client component
import React, { useState, useEffect } from 'react';
import { useUnstakeRewardExporter } from '@/hooks/useUnstakeRewardExporter';
import type { UnstakeEvent, RequestUnstakeFlexibleEvent } from '@/hooks/useContractEvents';
import { usePublicClient, useChainId } from 'wagmi';
import { getContractAddresses } from '@/config/contracts';
import { HashKeyChainStakingABI } from '@/constants/abi';
// Import both JSON data files
import unstakeData from '@/hooks/unstake-events-3319640-8594288.json';
import requestUnstakeFlexibleData from '@/hooks/request-unstake-flexible-events-3319640-8594288.json';
import { formatEther } from 'viem';

interface EnrichedUnstakeEvent extends UnstakeEvent {
    blockBalance?: bigint;
    totalPooledHSK?: bigint;
    difference?: bigint;
}

interface EnrichedRequestUnstakeFlexibleEvent extends RequestUnstakeFlexibleEvent {
    blockBalance?: bigint;
    totalPooledHSK?: bigint;
    difference?: bigint;
}

function UnstakeExporterComponent() {
    // Assuming unstakeData is the imported JSON array conforming to UnstakeEvent[]
    // You might fetch this data dynamically instead
    const [lockedEventsToExport, setLockedEventsToExport] = useState<EnrichedUnstakeEvent[]>([]);
    const [flexibleEventsToExport, setFlexibleEventsToExport] = useState<EnrichedRequestUnstakeFlexibleEvent[]>([]);

    const publicClient = usePublicClient();
    const chainId = useChainId();
    const contractAddress = getContractAddresses(chainId).stakingContract;

    // Load data on mount (or based on some trigger)
    useEffect(() => {
        const enrichEvents = async () => {
            if (!publicClient || !contractAddress) return;

            // Convert string numbers from JSON to BigInt and enrich locked events
            const parsedAndEnrichedLockedEvents = await Promise.all(
                (unstakeData as any[]).map(async (event) => {
                    const blockNumber = BigInt(event.blockNumber);
                    let blockBalance = BigInt(0);
                    let totalPooledHSK = BigInt(0);
                    let difference = BigInt(0);

                    try {
                        // Fetch contract balance at the specific block number
                        blockBalance = await publicClient.getBalance({
                            address: contractAddress,
                            blockNumber: blockNumber,
                        });

                        // Fetch totalPooledHSK at the specific block number
                        totalPooledHSK = await publicClient.readContract({
                            address: contractAddress,
                            abi: HashKeyChainStakingABI,
                            functionName: 'totalPooledHSK',
                            blockNumber: blockNumber,
                        });
                        difference = blockBalance - totalPooledHSK;
                    } catch (e) {
                        console.error(`Error fetching data for block ${blockNumber}:`, e);
                    }

                    return {
                        ...event,
                        user: event.user,
                        stakeId: BigInt(event.stakeId),
                        hskAmount: formatEther(event.hskAmount),
                        penalty: formatEther(event.penalty || 0),
                        blockNumber: blockNumber,
                        isEarlyWithdrawal: Boolean(event.isEarlyWithdrawal),
                        blockBalance: formatEther(blockBalance),
                        totalPooledHSK: formatEther(totalPooledHSK),
                        difference: formatEther(difference),
                    };
                })
            );
            setLockedEventsToExport(parsedAndEnrichedLockedEvents);

            // Parse flexible event data and enrich
            const parsedAndEnrichedFlexibleEvents = await Promise.all(
                (requestUnstakeFlexibleData as any[]).map(async (event) => {
                    const blockNumber = BigInt(event.blockNumber);
                    let blockBalance = BigInt(0);
                    let totalPooledHSK = BigInt(0);
                    let difference = BigInt(0);

                    try {
                        // Fetch contract balance at the specific block number
                        blockBalance = await publicClient.getBalance({
                            address: contractAddress,
                            blockNumber: blockNumber,
                        });

                        // Fetch totalPooledHSK at the specific block number
                        totalPooledHSK = await publicClient.readContract({
                            address: contractAddress,
                            abi: HashKeyChainStakingABI,
                            functionName: 'totalPooledHSK',
                            blockNumber: blockNumber,
                        });
                        difference = blockBalance - totalPooledHSK;
                    } catch (e) {
                        console.error(`Error fetching data for block ${blockNumber}:`, e);
                    }

                    return {
                        ...event,
                        user: event.user,
                        stakeId: BigInt(event.stakeId),
                        hskAmount: formatEther(event.hskAmount),
                        claimableBlock: BigInt(event.claimableBlock || 0),
                        blockNumber: blockNumber,
                        blockBalance: formatEther(blockBalance),
                        totalPooledHSK: formatEther(totalPooledHSK),
                        difference: formatEther(difference),
                    };
                })
            );
            setFlexibleEventsToExport(parsedAndEnrichedFlexibleEvents);
        };

        enrichEvents();
    }, [publicClient, contractAddress, chainId]);

    // Use the exporter hook, passing both arrays
    const { isLoading, error } = useUnstakeRewardExporter(lockedEventsToExport, flexibleEventsToExport);

    // Optional: Add a button to manually trigger if you don't want auto-export
    // const [triggerExport, setTriggerExport] = useState(false);
    // const { isLoading, error } = useUnstakeRewardExporter(eventsToExport, triggerExport);
    // <button onClick={() => setTriggerExport(true)} disabled={isLoading}>Export Rewards</button>

    return (
        <div>
            <h2>Unstake Reward Exporter</h2>
            {isLoading && <p>Loading rewards and generating Excel file...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
            {!isLoading && !error && (lockedEventsToExport.length > 0 || flexibleEventsToExport.length > 0) && (
                <p>Excel export process initiated for {lockedEventsToExport.length} locked and {flexibleEventsToExport.length} flexible events.</p>
            )}
            {lockedEventsToExport.length === 0 && flexibleEventsToExport.length === 0 && !isLoading && (
                 <p>Waiting for unstake event data...</p>
            )}
            <h3>Locked Events</h3>
            {lockedEventsToExport.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                            <th style={{ padding: '8px', textAlign: 'left' }}>user</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Stake ID</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>HSK Amount</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Penalty</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Block Number</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Block Balance</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Total Pooled HSK</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Difference</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lockedEventsToExport.map((event, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.user.toString()}</td>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.stakeId.toString()}</td>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.hskAmount.toString()}</td>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.penalty.toString()}</td>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.blockNumber.toString()}</td>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.blockBalance?.toString()}</td>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.totalPooledHSK?.toString()}</td>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.difference?.toString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No locked events to display.</p>
            )}

            <h3 style={{ marginTop: '30px' }}>Flexible Events</h3>
            {flexibleEventsToExport.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                            <th style={{ padding: '8px', textAlign: 'left' }}>user</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Stake ID</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>HSK Amount</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Claimable Block</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Block Number</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Block Balance</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Total Pooled HSK</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Difference</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flexibleEventsToExport.map((event, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.user.toString()}</td>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.stakeId.toString()}</td>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.hskAmount.toString()}</td>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.claimableBlock.toString()}</td>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.blockNumber.toString()}</td>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.blockBalance?.toString()}</td>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.totalPooledHSK?.toString()}</td>
                                <td style={{ padding: '8px', textAlign: 'left' }}>{event.difference?.toString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No flexible events to display.</p>
            )}
        </div>
    );
}

export default UnstakeExporterComponent;
