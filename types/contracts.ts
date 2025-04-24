export enum StakeType {
    FIXED_30_DAYS = 0,
    FIXED_90_DAYS = 1,
    FIXED_180_DAYS = 2,
    FIXED_365_DAYS = 3,
    FLEXIBLE = 4
}

export enum FlexibleStakeStatus {
    ACTIVE = 0,
    WITHDRAWING = 1,
    WITHDRAWN = 2
}

export interface LockedStakeInfo {
    sharesAmount: bigint;
    hskAmount: bigint;
    currentHskValue: bigint;
    lockEndTime: bigint;
    isWithdrawn: boolean;
    isLocked: boolean;
    reward?: bigint;
    actualReward?: bigint;
}

export interface FlexibleStake {
    sharesAmount: bigint;    // Amount of stHSK shares
    hskAmount: bigint;       // Amount of HSK staked  
    stakeBlock: bigint;      // Block number when staked
    status: FlexibleStakeStatus; // Current status of the stake
}

export interface PendingWithdrawal {
    hskAmount: bigint;       // Amount of HSK to withdraw
    claimableBlock: bigint;  // Block when withdrawal can be claimed
    claimed: boolean;        // Whether the withdrawal has been claimed
}

export interface StakingStats {
    totalStakedAmount: bigint;
    durations: [bigint, bigint, bigint, bigint, bigint];
    currentAPRs: [bigint, bigint, bigint, bigint, bigint];
    maxPossibleAPRs: [bigint, bigint, bigint, bigint, bigint];
    baseBonus: [bigint, bigint, bigint, bigint, bigint];
}

export interface APRInfo {
    baseApr: bigint;
    minApr: bigint;
    maxApr: bigint;
}

export interface MintVeHSKInfo {
    mintedTotal: bigint; // 铸造的总数量
    flexibleStakeCount: bigint;
    lockedStakeCount: bigint;
}