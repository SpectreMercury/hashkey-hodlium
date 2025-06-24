'use client';

import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../main-layout';
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import { LockedStakeInfo } from '@/types/contracts';
import { formatBigInt } from '@/utils/format';
import { useUnstakeLocked, useUserStakingInfo, batchGetStakingInfo, useAllStakingAPRs } from '@/hooks/useStakingContracts';
import { getContractAddresses } from '@/config/contracts';
import { toast } from 'react-toastify';
import AddressBar from '../../components/AddressBar';
import FlexibleStakingPositions from '@/components/portfolio/FlexibleStakingPositions';
import OldStakingPositions from '@/components/portfolio/OldLockedStakingPositions';
import { useUserFlexibleStakingInfo } from '@/hooks/useFlexibleStaking';

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { lockedStakeCount, activeLockedStakes, isLoading: loadingInfo } = useUserStakingInfo();
  const { unstakeLocked, isPending: unstakePending, isConfirming: unstakeConfirming } = useUnstakeLocked();
  const [stakedPositions, setStakedPositions] = useState<Array<{ id: number, info: LockedStakeInfo }>>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [processingStakeId, setProcessingStakeId] = useState<number | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const chainId = useChainId();
  const contractAddress = getContractAddresses(chainId).stakingContract;
  const publicClient = usePublicClient();
  const [totalRewards, setTotalRewards] = useState<bigint>(BigInt(0));
  const { estimatedAPRs, isLoading: aprsLoading } = useAllStakingAPRs();
  const [aprDataSource, setAprDataSource] = useState<'contract' | 'loading'>('loading');
  const { flexibleStakeCount, activeFlexibleStakes, isLoading: loadingFlexibleInfo } = useUserFlexibleStakingInfo();

  // 添加modal状态
  const [showUnstakeModal, setShowUnstakeModal] = useState(false);
  const [unstakingPosition, setUnstakingPosition] = useState<number | null>(null);
  
  // 处理APR数据 - 使用useEffect避免无限循环
  useEffect(() => {
    if (!aprsLoading && estimatedAPRs) {
      setAprDataSource('contract');
    } else {
      setAprDataSource('loading');
    }
  }, [aprsLoading, estimatedAPRs]);
  
  // 执行解除质押
  const executeUnstake = async (stakeId: number) => {
    if (processingStakeId !== null) return;
    
    setProcessingStakeId(stakeId);
    
    try {
      // 执行交易并等待确认
      const success = await unstakeLocked(stakeId);
      
      // 交易已确认
      if (success) {
        toast.success('Successfully unstaked your position');
        setShowUnstakeModal(false);
        // 刷新数据
        fetchStakedPositions();
      }
    } catch (error) {
      console.error('Failed to unstake:', error);
      toast.error('Failed to unstake your position');
    } finally {
      setProcessingStakeId(null);
    }
  };
  
  // 加载用户所有锁定质押
  const fetchStakedPositions = useCallback(async () => {
    if (!isConnected || !address || !lockedStakeCount || !publicClient) return;
    
    setIsLoadingPositions(true);
    
    try {
      // 创建质押ID数组
      const stakeIds = Array.from({ length: Number(lockedStakeCount) }, (_, i) => i);
      
      // 批量获取所有质押信息
      const stakesInfo = await batchGetStakingInfo(contractAddress, publicClient, stakeIds, address);
      
      // 计算总确认收益仅供参考
      const confirmedTotalReward = stakesInfo
        .filter(info => !info.error && !info.isWithdrawn)
        // .reduce((sum, info) => sum + info.actualReward, BigInt(0));
        .reduce((sum, info) => sum + (info.currentHskValue - info.hskAmount), BigInt(0));

        setTotalRewards(confirmedTotalReward < 0 ? BigInt(0) : confirmedTotalReward);
      
      // 转换为所需格式 - 包括所有质押，包括已提取的
      const positions = stakesInfo
        .filter(info => !info.error)
        .map(info => ({
          id: info.id,
          info: {
            sharesAmount: info.sharesAmount,
            hskAmount: info.hskAmount,
            currentHskValue: info.currentHskValue,
            lockEndTime: info.lockEndTime,
            isWithdrawn: info.isWithdrawn,
            isLocked: info.isLocked,
            actualReward: info.actualReward
          }
        }));
      
      setStakedPositions(positions);
      setLastUpdateTime(new Date());
      
    } catch (error) {
      console.error('Failed to fetch staked positions:', error);
      toast.error('Failed to load your stakes');
    } finally {
      setIsLoadingPositions(false);
    }
  }, [address, isConnected, lockedStakeCount, publicClient, contractAddress]);
  
  // 初始加载数据
  useEffect(() => {
    fetchStakedPositions();
    
    // 定期刷新数据
    const intervalId = setInterval(() => {
      fetchStakedPositions();
    }, 300000); // 每5分钟刷新一次
    
    return () => clearInterval(intervalId);
  }, [fetchStakedPositions]);

  // Modal处理 - 打开确认对话框
  const openUnstakeConfirmation = (stakeId: number) => {
    const position = stakedPositions.find(pos => pos.id === stakeId);
    if (!position) return;
    
    setUnstakingPosition(stakeId);
    setShowUnstakeModal(true);
  };

  // 处理解除质押点击
  const handleUnstakeClick = (stakeId: number) => {
    const position = stakedPositions.find(pos => pos.id === stakeId);
    if (!position) return;
    
    if (position.info.isLocked) {
      // 对于锁定的位置，显示确认对话框
      openUnstakeConfirmation(stakeId);
    } else {
      // 对于未锁定的位置，直接解除质押
      executeUnstake(stakeId);
    }
  };
  
  // 手动刷新数据
  const handleRefresh = () => {
    fetchStakedPositions();
    toast.info('Refreshing stake information...');
  };
  
  // 格式化剩余时间
  const formatTimeRemaining = (endTime: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = Number(endTime) - now;
    
    if (remaining <= 0) return 'Unlocked';
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    
    if (days > 0) {
      return `${days} days ${hours} hrs`;
    } else if (hours > 0) {
      const minutes = Math.floor((remaining % 3600) / 60);
      return `${hours} hrs ${minutes} mins`;
    } else {
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      return `${minutes} mins ${seconds} sec`;
    }
  };
  
  // 获取质押期APR值 - 使用useMemo避免重复计算
  const getAPRForStakePeriod = useCallback((lockEndTime: bigint) => {
    if (!estimatedAPRs || aprsLoading) {
      return 'Loading...';
    }
    
    const now = Math.floor(Date.now() / 1000);
    const remainingTime = Number(lockEndTime) - now;
    
    // 将合约返回的APR值除以100转换为百分比
    const apr30 = Number(estimatedAPRs[0] || BigInt(0)) / 100;
    const apr90 = Number(estimatedAPRs[1] || BigInt(0)) / 100;
    const apr180 = Number(estimatedAPRs[2] || BigInt(0)) / 100;
    const apr365 = Number(estimatedAPRs[3] || BigInt(0)) / 100;
    
    if (remainingTime <= 0) {
      return `${apr30.toFixed(2)}%`; // 已解锁的质押
    } else if (remainingTime <= 30 * 24 * 3600) {
      return `${apr30.toFixed(2)}%`; // 30天锁定
    } else if (remainingTime <= 90 * 24 * 3600) {
      return `${apr90.toFixed(2)}%`; // 90天锁定
    } else if (remainingTime <= 180 * 24 * 3600) {
      return `${apr180.toFixed(2)}%`; // 180天锁定
    } else {
      return `${apr365.toFixed(2)}%`; // 365天锁定
    }
  }, [estimatedAPRs, aprsLoading]);

  const getFlexibleAPR = () => {
    if (!estimatedAPRs || aprsLoading) return 'Loading...';
    return estimatedAPRs[4] ? `${(Number(estimatedAPRs[4]) / 100).toFixed(2)}%` : 'N/A';
  };

  return (
    <MainLayout>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-light text-white">My Stakes</h1>
              <button 
                onClick={handleRefresh}
                disabled={isLoadingPositions}
                className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 transition-colors disabled:bg-slate-800 disabled:cursor-not-allowed flex items-center"
              >
                {isLoadingPositions ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
            </div>
            
            {/* Add data source indicator */}
            <div className="mb-4 text-sm">
              <span className="text-slate-400">
                APR Data Source: {' '}
                {aprDataSource === 'contract' ? (
                  <span className="text-green-500">Contract (Live Data)</span>
                ) : (
                  <span className="text-yellow-500">Loading...</span>
                )}
              </span>
            </div>

            {lastUpdateTime && (
              <div className="text-sm text-slate-400 mb-4">
                Last update: {lastUpdateTime.toLocaleTimeString()}
              </div>
            )}
              
            {/* 概览统计 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="text-sm font-medium text-primary/80">Active Stakes</h3>
                </div>
                <p className="text-2xl font-medium text-white">
                  {loadingInfo || loadingFlexibleInfo || isLoadingPositions ? (
                    <span className="inline-block w-10 h-7 bg-slate-700 rounded animate-pulse"></span>
                  ) : (
                    Number(activeLockedStakes || 0) + Number(activeFlexibleStakes || 0)
                  )}
                </p>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="text-sm font-medium text-primary/80">Completed Stakes</h3>
                </div>
                <p className="text-2xl font-medium text-white">
                  {loadingInfo || loadingFlexibleInfo ? (
                    <span className="inline-block w-10 h-7 bg-slate-700 rounded animate-pulse"></span>
                  ) : (
                    (Number(lockedStakeCount || 0) + Number(flexibleStakeCount || 0)) -
                    (Number(activeLockedStakes || 0) + Number(activeFlexibleStakes || 0))
                  )}
                </p>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-medium text-primary/80">Total Rewards</h3>
                </div>
                <p className="text-2xl font-medium text-green-500">
                  {isLoadingPositions ? (
                    <span className="inline-block w-24 h-7 bg-slate-700 rounded animate-pulse"></span>
                  ) : (
                    `+${formatBigInt(totalRewards, 18, 4)} HSK`
                  )}
                </p>
              </div>
            </div>
            <h2 className="text-2xl font-light text-white mb-6">Active Stakes</h2>
            {isLoadingPositions ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 animate-pulse">
                    <div className="flex flex-wrap justify-between mb-4">
                      {/* <div className="mb-4 w-1/5">
                        <div className="h-5 bg-slate-700 rounded mb-2 w-20"></div>
                        <div className="h-7 bg-slate-700 rounded w-24"></div>
                      </div> */}
                      <div className="mb-4 w-1/4">
                        <div className="h-5 bg-slate-700 rounded mb-2 w-20"></div>
                        <div className="h-7 bg-slate-700 rounded w-24"></div>
                      </div>
                      <div className="mb-4 w-1/4">
                        <div className="h-5 bg-slate-700 rounded mb-2 w-20"></div>
                        <div className="h-7 bg-slate-700 rounded w-24"></div>
                      </div>
                      <div className="mb-4 w-1/4">
                        <div className="h-5 bg-slate-700 rounded mb-2 w-20"></div>
                        <div className="h-7 bg-slate-700 rounded w-24"></div>
                      </div>
                      <div className="mb-4 w-1/4">
                        <div className="h-5 bg-slate-700 rounded mb-2 w-20"></div>
                        <div className="h-7 bg-slate-700 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-10 bg-slate-700 rounded w-32 ml-auto"></div>
                  </div>
                ))}
              </div>
            ) : stakedPositions.length > 0 ? (
              <div className="space-y-4">
                {stakedPositions
                  .filter(position => !position.info.isWithdrawn)
                  .map((position) => (
                    <div key={position.id} className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                      <div className="flex flex-wrap justify-between mb-6">
                        <div className="w-full sm:w-auto mb-4 sm:mb-0">
                          <h3 className="text-sm text-slate-400 mb-1">Stake #{position.id}</h3>
                          <div className="flex items-center">
                            <p className="text-xl font-medium text-white">
                              {formatBigInt(position.info.sharesAmount)} stHSK
                            </p>
                            {position.info.isLocked && (
                              <span className="ml-3 px-2 py-1 text-xs font-medium bg-primary/20 text-primary/90 rounded">
                                Locked
                              </span>
                            )}
                            {!position.info.isLocked && (
                              <span className="ml-3 px-2 py-1 text-xs font-medium bg-green-500/20 text-green-500 rounded">
                                Unlocked
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full sm:w-auto mb-4 sm:mb-0 sm:mx-4">
                          <p className="text-sm text-slate-400 mb-1">Current Value</p>
                          <p className="text-xl font-medium text-white">
                            {formatBigInt(position.info.currentHskValue)} HSK
                          </p>
                        </div>
                        <div className="w-full sm:w-auto mb-4 sm:mb-0 sm:mx-4">
                          <p className="text-sm text-slate-400 mb-1">Actual Reward</p>
                          <p className="text-xl font-medium text-green-500">
                            {formatBigInt(position.info.actualReward, 18, 4)} HSK
                          </p>
                        </div>
                        {/* <div className="w-full sm:w-auto mb-4 sm:mb-0">
                          <p className="text-sm text-slate-400 mb-1">APY</p>
                          <p className="text-xl font-medium text-green-500">
                            {getAPRForStakePeriod(position.info.lockEndTime)}
                          </p>
                        </div> */}
                        <div className="w-full sm:w-auto">
                          <p className="text-sm text-slate-400 mb-1">
                            {position.info.isLocked ? 'Time Remaining' : 'Unlocked on'}
                          </p>
                          <p className="text-xl font-medium text-white">
                            {position.info.isLocked
                              ? formatTimeRemaining(position.info.lockEndTime)
                              : new Date(Number(position.info.lockEndTime) * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {!position.info.isWithdrawn && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleUnstakeClick(position.id)}
                            disabled={processingStakeId === position.id}
                            className="px-4 py-2 rounded bg-primary/80 hover:bg-primary text-white transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                          >
                            {processingStakeId === position.id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              'Unstake'
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 text-center">
                <svg className="w-12 h-12 text-slate-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium text-white mb-2">No Active Stakes</h3>
                <p className="text-slate-400 mb-6">
                  You don't have any active stakes yet. Start staking to earn rewards.
                </p>
                <a href="/stake" className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors">
                  Start Staking
                </a>
              </div>
            )}
            {/* 添加灵活质押部分 */}
            <FlexibleStakingPositions
              onTotalRewardsChange={(rewards) => setTotalRewards((prev) => prev + rewards)}
              isLoadingPositions={isLoadingPositions}
              setIsLoadingPositions={setIsLoadingPositions}
              processingStakeId={processingStakeId}
              setProcessingStakeId={setProcessingStakeId}
              getFlexibleAPR={getFlexibleAPR}
            />
            {/* 添加老合约质押部分 */}
            <OldStakingPositions />
          </div>
        </div>
      </div>
      {showUnstakeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-medium text-white mb-4">Early Unstake Confirmation</h3>
            <div className="mb-6">
              <div className="flex items-start mb-4">
                <svg className="w-6 h-6 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-white">
                  You are unstaking before the lock period ends. Your principal is safe, but you will forfeit a portion of the rewards.
                  {/* You are unstaking before the lock period ends. This will result in a penalty and you will not receive the full rewards. */}
                </p>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-4 text-sm text-yellow-200">
                <p className="font-medium mb-2">Please note:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your original principal will be returned in full.</li>
                  <li>A portion of your earned rewards will be forfeited.</li>
                  <li>The amount of forfeited rewards depends on the remaining lock time.</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowUnstakeModal(false);
                  setUnstakingPosition(null);
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => unstakingPosition !== null && executeUnstake(unstakingPosition)}
                disabled={processingStakeId !== null}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
              >
                {unstakePending ? 'Awaiting wallet confirmation...' : unstakeConfirming ? 'Confirming transaction...' : 'Confirm Unstake'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}