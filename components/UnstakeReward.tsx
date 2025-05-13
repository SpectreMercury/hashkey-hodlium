// Example Usage in a React Component (e.g., a dedicated export page/component)
'use client'; // Ensure this is marked as a client component
import React, { useState, useEffect } from 'react';
import { useUnstakeRewardExporter } from '@/hooks/useUnstakeRewardExporter';
import type { UnstakeEvent, RequestUnstakeFlexibleEvent } from '@/hooks/useContractEvents';
// Import both JSON data files
import unstakeData from '@/hooks/unstake-events-3319640-5882600.json';
import requestUnstakeFlexibleData from '@/hooks/request-unstake-flexible-events-3319640-5882600.json';

function UnstakeExporterComponent() {
    // Assuming unstakeData is the imported JSON array conforming to UnstakeEvent[]
    // You might fetch this data dynamically instead
    const [lockedEventsToExport, setLockedEventsToExport] = useState<UnstakeEvent[]>([]);
    const [flexibleEventsToExport, setFlexibleEventsToExport] = useState<RequestUnstakeFlexibleEvent[]>([]);


    // Load data on mount (or based on some trigger)
    useEffect(() => {
        // Convert string numbers from JSON to BigInt
        const parsedEvents = (unstakeData as any[]).map(event => ({
            ...event,
            // sharesAmount: BigInt(event.sharesAmount),
            hskAmount: BigInt(event.hskAmount),
            penalty: BigInt(event.penalty),
            stakeId: BigInt(event.stakeId),
            blockNumber: BigInt(event.blockNumber),
            // Ensure boolean is parsed correctly if needed
            isEarlyWithdrawal: Boolean(event.isEarlyWithdrawal),
        }));
        setLockedEventsToExport(parsedEvents);

        // Parse flexible event data
        const parsedFlexibleEvents = (requestUnstakeFlexibleData as any[]).map(event => ({
            ...event,
            stakeId: BigInt(event.stakeId),
            hskAmount: BigInt(event.hskAmount),
            claimableBlock: BigInt(event.claimableBlock),
            blockNumber: BigInt(event.blockNumber),
        }));
        setFlexibleEventsToExport(parsedFlexibleEvents);

    }, []);

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
            {/* You might want to display the data in a table here as well */}
        </div>
    );
}

export default UnstakeExporterComponent;
