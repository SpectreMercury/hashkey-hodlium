'use client';

import { useAccount, useWriteContract, useChainId, usePublicClient } from 'wagmi';
import { getContractAddresses } from '@/config/contracts';
import { StakeType, StakingStats } from '@/types/contracts';
import { parseEther } from '@/utils/format';
import { HashKeyChainStakingABI } from '@/constants/abi';
import { useState, useEffect } from 'react';
import { waitForTransactionReceipt, writeContract } from 'wagmi/actions';
import { config } from '@/app/providers';
import { PublicClient } from 'viem';

export const stakeTypeMap = {
  "30days": 0,  // FIXED_30_DAYS
  "90days": 1,  // FIXED_90_DAYS
  "180days": 2, // FIXED_180_DAYS
  "365days": 3  // FIXED_365_DAYS
};

// 获取质押合约的基本信息
export function useStakingInfo(simulatedAmount: string = '1000') {
  const chainId = useChainId();
  const contractAddress = getContractAddresses(chainId).stakingContract;
  const simulatedAmountWei = parseEther(simulatedAmount || '0');
  const publicClient = usePublicClient();
  
  const [data, setData] = useState<{
    totalStaked: bigint;
    stakingStats: StakingStats | null;
    exchangeRate: bigint;
    minStakeAmount: bigint;
    isLoading: boolean;
  }>({
    totalStaked: BigInt(0),
    stakingStats: null,
    exchangeRate: BigInt(0),
    minStakeAmount: BigInt(0),
    isLoading: true,
  });
  
  useEffect(() => {
    const fetchStakingInfo = async () => {
      if (!publicClient || !contractAddress) return;
      
      setData(prev => ({ ...prev, isLoading: true }));
      
      try {
        console.log('Fetching staking info with amount:', simulatedAmountWei.toString());
        
        // 获取总质押量
        const totalValueLocked = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: HashKeyChainStakingABI,
          functionName: 'totalValueLocked',
        });
        
        // 获取质押统计信息，传入模拟金额
        const detailedStakingStats = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: HashKeyChainStakingABI,
          functionName: 'getDetailedStakingStats',
          args: [simulatedAmountWei], // 使用模拟金额作为参数
        });
        
        // 获取当前兑换率
        const currentExchangeRate = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: HashKeyChainStakingABI,
          functionName: 'getCurrentExchangeRate',
        });
        
        // 获取最小质押金额
        const minStakeAmount = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: HashKeyChainStakingABI,
          functionName: 'minStakeAmount',
        });
        
        setData({
          totalStaked: totalValueLocked as bigint,
          stakingStats: detailedStakingStats as StakingStats,
          exchangeRate: currentExchangeRate as bigint,
          minStakeAmount: minStakeAmount as bigint,
          isLoading: false,
        });
        
        console.log('Staking info fetched successfully:', {
          totalValueLocked,
          detailedStakingStats,
          currentExchangeRate,
          minStakeAmount
        });
      } catch (error) {
        console.error('Failed to fetch staking info:', error);
        setData(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    fetchStakingInfo();
  }, [publicClient, contractAddress, simulatedAmountWei]);
  
  return data;
}

// 获取用户的质押信息
export function useUserStakingInfo() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(true);
  const [lockedStakeCount, setLockedStakeCount] = useState<bigint>(BigInt(0));
  const [activeLockedStakes, setActiveLockedStakes] = useState<bigint>(BigInt(0));
  
  // 获取当前配置的客户端
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchStakingInfo = async () => {
      if (!address || !publicClient) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const contractAddress = getContractAddresses(chainId).stakingContract;
        
        // 使用当前配置的客户端进行合约调用
        const count = await publicClient.readContract({
          address: contractAddress,
          abi: HashKeyChainStakingABI,
          functionName: 'getUserLockedStakeCount',
          args: [address],
        });
        
        const active = await publicClient.readContract({
          address: contractAddress,
          abi: HashKeyChainStakingABI,
          functionName: 'getUserActiveLockedStakes',
          args: [address],
        });

        setLockedStakeCount(count as bigint);
        setActiveLockedStakes(active as bigint);
      } catch (error) {
        console.error('Failed to fetch staking info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStakingInfo();
  }, [address, chainId, publicClient]);

  return {
    lockedStakeCount,
    activeLockedStakes,
    isLoading,
  };
}

// 质押hooks
export function useStake() {
  const chainId = useChainId();
  const contractAddress = getContractAddresses(chainId).stakingContract;
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const stake = async (amount: string) => {
    try {
      setIsPending(true);
      setError(null);
      
      // const _amount = BigInt(amount);
      const _amount = parseEther('100');
      // 发送交易
      const tx = await writeContract(config, {
        address: contractAddress,
        abi: HashKeyChainStakingABI,
        functionName: 'stake',
        value: _amount
      });
      
      // 等待交易确认
      setIsConfirming(true);
      const receipt = await waitForTransactionReceipt(config, {
        hash: tx,
      });
      
      console.log('Transaction confirmed:', receipt);
      
      // 如果没有抛出错误且交易成功，返回 true
      return receipt.status === 'success';
    } catch (submitError) {
      console.error('Staking failed:', submitError);
      if (submitError instanceof Error) {
        setError(submitError);
      } else {
        setError(new Error('Staking failed'));
      }
      throw submitError;
    } finally {
      setIsPending(false);
      setIsConfirming(false);
    }
  };
  
  return { 
    stake, 
    isPending,
    isConfirming,
    error
  };
}

// 修改 useStakeLocked 钩子
export function useStakeLocked() {
  const chainId = useChainId();
  const contractAddress = getContractAddresses(chainId).stakingContract;
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const stakeLocked = async (amount: string, stakeType: StakeType) => {
    try {
      setIsPending(true);
      setError(null);
      
      const amountWei = parseEther(amount);
      console.log('Staking locked amount:', amount);
      // 发送交易
      const tx = await writeContract(config, {
        address: contractAddress,
        abi: HashKeyChainStakingABI,
        functionName: 'stakeLocked',
        args: [stakeType],
        value: amountWei,
      });      
      // 等待交易确认
      setIsConfirming(true);
      const receipt = await waitForTransactionReceipt(config, {
        hash: tx,
      });
      
      console.log('Transaction confirmed:', receipt);
      
      // 如果没有抛出错误且交易成功，返回 true
      return receipt.status === 'success';
    } catch (submitError) {
      console.error('Staking failed:', submitError);
      if (submitError instanceof Error) {
        setError(submitError);
      } else {
        setError(new Error('Staking failed'));
      }
      throw submitError;
    } finally {
      setIsPending(false);
      setIsConfirming(false);
    }
  };
  
  return { 
    stakeLocked, 
    isPending,
    isConfirming, // 新增状态跟踪交易确认过程
    error
  };
}

// 解除锁定质押hooks - 修改为等待交易确认
export function useUnstakeLocked() {
  const chainId = useChainId();
  const contractAddress = getContractAddresses(chainId).stakingContract;
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const unstakeLocked = async (stakeId: number) => {
    try {
      setIsPending(true);
      setError(null);
      
      // 发送交易
      const tx = await writeContract(config, {
        address: contractAddress,
        abi: HashKeyChainStakingABI,
        functionName: 'unstakeLocked',
        args: [BigInt(stakeId)]
      });

      console.log('Unstake transaction submitted:', tx);
      
      // 等待交易确认
      setIsConfirming(true);
      const receipt = await waitForTransactionReceipt(config, {
        hash: tx,
      });
      
      console.log('Unstake transaction confirmed:', receipt);
      
      // 返回交易状态
      return receipt.status === 'success';
    } catch (submitError) {
      console.error('Unstaking failed:', submitError);
      if (submitError instanceof Error) {
        setError(submitError);
      } else {
        setError(new Error('Unstaking failed'));
      }
      throw submitError;
    } finally {
      setIsPending(false);
      setIsConfirming(false);
    }
  };

  return { unstakeLocked, isPending, isConfirming, error };
}

// 获取锁定质押信息
export function useLockedStakeInfo(stakeId: number | null) {
  const chainId = useChainId();
  const contractAddress = getContractAddresses(chainId).stakingContract;
  const publicClient = usePublicClient();
  const { address } = useAccount();
  
  const [data, setData] = useState<{
    sharesAmount: bigint;
    hskAmount: bigint;
    currentHskValue: bigint;
    lockEndTime: bigint;
    isWithdrawn: boolean;
    isLocked: boolean;
    reward: bigint;
    isLoading: boolean;
    error: Error | null;
  }>({
    sharesAmount: BigInt(0),
    hskAmount: BigInt(0),
    currentHskValue: BigInt(0),
    lockEndTime: BigInt(0),
    isWithdrawn: false,
    isLocked: false,
    reward: BigInt(0),
    isLoading: false,
    error: null
  });
  
  useEffect(() => {
    if (!publicClient || !contractAddress || !address || stakeId === null) return;
    
    const fetchStakeInfo = async () => {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        // 调用合约获取锁定质押信息
        const stakeInfo = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: HashKeyChainStakingABI,
          functionName: 'getLockedStakeInfo',
          args: [address, BigInt(stakeId)]
        }) as [bigint, bigint, bigint, bigint, boolean, boolean];
        
        // 计算收益
        const reward = stakeInfo[2] - stakeInfo[1];
        
        setData({
          sharesAmount: stakeInfo[0],
          hskAmount: stakeInfo[1],
          currentHskValue: stakeInfo[2],
          lockEndTime: stakeInfo[3],
          isWithdrawn: stakeInfo[4],
          isLocked: stakeInfo[5],
          reward: reward,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('获取质押信息失败:', error);
        setData(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error : new Error('获取质押信息失败') 
        }));
      }
    };
    
    fetchStakeInfo();
  }, [publicClient, contractAddress, address, stakeId]);
  
  return data;
}

// 获取质押奖励信息
export function useStakeReward(stakeId: number | null) {
  const chainId = useChainId();
  const contractAddress = getContractAddresses(chainId).stakingContract;
  const publicClient = usePublicClient();
  const { address } = useAccount();
  
  const [data, setData] = useState<{
    originalAmount: bigint;
    reward: bigint;
    actualReward: bigint;
    totalValue: bigint;
    isLoading: boolean;
    error: Error | null;
  }>({
    originalAmount: BigInt(0),
    reward: BigInt(0),
    actualReward: BigInt(0),
    totalValue: BigInt(0),
    isLoading: false,
    error: null
  });
  
  useEffect(() => {
    if (!publicClient || !contractAddress || !address || stakeId === null) return;
    
    const fetchStakeReward = async () => {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        // 调用合约获取质押奖励信息
        const rewardInfo = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: HashKeyChainStakingABI,
          functionName: 'getStakeReward',
          args: [address, BigInt(stakeId)]
        }) as [bigint, bigint, bigint, bigint];
        
        setData({
          originalAmount: rewardInfo[0],
          reward: rewardInfo[1],
          actualReward: rewardInfo[2],
          totalValue: rewardInfo[3],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('获取质押奖励信息失败:', error);
        setData(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error : new Error('获取质押奖励信息失败') 
        }));
      }
    };
    
    fetchStakeReward();
  }, [publicClient, contractAddress, address, stakeId]);
  
  return data;
}

// 根据 ABI 修改 batchGetStakingInfo 函数
export async function batchGetStakingInfo(contractAddress: string, publicClient: PublicClient, stakeIds: number[], userAddress: string) {
  const results = [];
  
  for (const id of stakeIds) {
    try {
      // 获取锁定质押信息，返回值格式：
      // sharesAmount, hskAmount, currentHskValue, lockEndTime, isWithdrawn, isLocked
      const stakeInfo = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: HashKeyChainStakingABI,
        functionName: 'getLockedStakeInfo',
        args: [userAddress, BigInt(id)]
      }) as [bigint, bigint, bigint, bigint, boolean, boolean];
      
      // 获取质押奖励信息
      const rewardInfo = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: HashKeyChainStakingABI,
        functionName: 'getStakeReward',
        args: [userAddress, BigInt(id)]
      }) as [bigint, bigint, bigint, bigint];
      
      // 收益 = 当前价值 - 初始质押金额
      const reward = stakeInfo[2] - stakeInfo[1];
      
      results.push({
        id,
        sharesAmount: stakeInfo[0],    // 份额数量
        hskAmount: stakeInfo[1],       // 初始质押的 HSK 金额
        currentHskValue: stakeInfo[2],  // 当前价值（包含收益）
        lockEndTime: stakeInfo[3],     // 锁定结束时间
        isWithdrawn: stakeInfo[4],     // 是否已提取
        isLocked: stakeInfo[5],        // 是否仍在锁定
        reward: reward,                // 计算的收益
        actualReward: rewardInfo[2],   // 实际奖励
        error: null
      });
    } catch (error) {
      console.error(`获取质押 ${id} 失败:`, error);
      results.push({
        id,
        sharesAmount: BigInt(0),
        hskAmount: BigInt(0),
        currentHskValue: BigInt(0),
        lockEndTime: BigInt(0),
        isWithdrawn: false,
        isLocked: false,
        reward: BigInt(0),
        actualReward: BigInt(0),
        error: error
      });
    }
  }
  
  return results;
}

// 获取所有质押APR数据
export function useAllStakingAPRs(stakeAmount: string = '1000') {
  const chainId = useChainId();
  const contractAddress = getContractAddresses(chainId).stakingContract;
  const publicClient = usePublicClient();
  const stakeAmountWei = parseEther(stakeAmount || '0');
  
  const [data, setData] = useState<{
    estimatedAPRs: bigint[] | null;
    maxAPRs: bigint[] | null;
    isLoading: boolean;
    error: Error | null;
  }>({
    estimatedAPRs: null,
    maxAPRs: null,
    isLoading: true,
    error: null
  });
  
  useEffect(() => {
    const fetchAPRs = async () => {
      if (!publicClient || !contractAddress) return;
      
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        console.log('Fetching APRs with amount:', stakeAmountWei.toString());
        
        // 调用getAllStakingAPRs方法获取APR数据
        const result = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: HashKeyChainStakingABI,
          functionName: 'getAllStakingAPRs',
          args: [stakeAmountWei]
        });
        
        const [estimatedAPRs, maxAPRs] = result as [bigint[], bigint[]];
        
        console.log('APRs fetched successfully:', {
          estimatedAPRs: estimatedAPRs.map(apr => apr.toString()),
          maxAPRs: maxAPRs.map(apr => apr.toString())
        });
        //  flexable 灵活质押 
        estimatedAPRs[4] = estimatedAPRs[0] / BigInt(2);
        setData({
          estimatedAPRs,
          maxAPRs,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Failed to fetch APRs:', error);
        setData({
          estimatedAPRs: null,
          maxAPRs: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Failed to fetch APRs')
        });
      }
    };
    
    fetchAPRs();
  }, [publicClient, contractAddress, stakeAmountWei]);
  
  return data;
}
