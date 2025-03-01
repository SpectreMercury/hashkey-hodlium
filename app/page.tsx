'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from './main-layout';
import { StakeType } from '@/types/contracts';
import { formatBigInt } from '@/utils/format';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useStakingInfo } from '@/hooks/useStakingContracts';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

export default function Home() {
  // 添加本地loading状态，初始为true
  const [initialLoading, setInitialLoading] = useState(true);
  const [simulatedAmount, setSimulatedAmount] = useState('1000');
  const [debouncedAmount, setDebouncedAmount] = useState(simulatedAmount);
  const { address: _address, isConnected } = useAccount();
  const { totalStaked, stakingStats, exchangeRate, isLoading: apiLoading } = useStakingInfo(debouncedAmount);
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLaunched, setIsLaunched] = useState(false);
  const [isAppEnabled, setIsAppEnabled] = useState(false);
  
  // 结合API加载状态和初始加载状态
  const isLoadingCombined = initialLoading || apiLoading;
  
  // Beijing launch time - March 2, 2025 20:00:00
  const launchTime = new Date('2025-03-03T20:00:00+08:00').getTime();

  // 检查环境变量
  useEffect(() => {
    const appEnabled = process.env.NEXT_PUBLIC_APP_ENABLED === 'true';
    setIsAppEnabled(appEnabled);
    console.log('App enabled from env:', appEnabled);
  }, []);

  // 获取服务器时间并检查是否已经发布
  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const response = await axios.get('/api/time');
        const serverTimeStamp = new Date(response.data.time).getTime();
        const serverTimeObj = new Date(serverTimeStamp);
        setServerTime(serverTimeObj);
        
        // 检查是否已过发布时间
        const isPastLaunchTime = serverTimeStamp >= launchTime;
        setIsLaunched(isPastLaunchTime);
        setIsLoading(false);
        
        console.log('Server time:', serverTimeObj);
        console.log('Launch time:', new Date(launchTime));
        console.log('Is past launch time:', isPastLaunchTime);
      } catch (error) {
        console.error('Failed to fetch server time:', error);
        // 如果获取服务器时间失败，使用客户端时间
        const now = new Date();
        setServerTime(now);
        setIsLaunched(now.getTime() >= launchTime);
        setIsLoading(false);
      }
    };

    fetchServerTime();
  }, [launchTime]);

  // 设置倒计时间隔
  useEffect(() => {
    if (!serverTime || isLaunched) return;

    const calculateTimeLeft = () => {
      // 基于服务器时间 + 自获取以来的经过时间计算
      const elapsedSinceFetch = Date.now() - serverTime.getTime();
      const adjustedNow = new Date(serverTime.getTime() + elapsedSinceFetch);
      const timeDiff = launchTime - adjustedNow.getTime();
      
      if (timeDiff <= 0) {
        setIsLaunched(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      return { days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    
    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // 如果倒计时结束，刷新页面
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [serverTime, isLaunched, launchTime]);
  
  // 当数据加载完成后，关闭初始加载状态
  useEffect(() => {
    if (!apiLoading && totalStaked !== undefined) {
      // 添加一个小延迟，确保UI平滑过渡
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [apiLoading, totalStaked]);
  
  // Add debounce processing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmount(simulatedAmount);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [simulatedAmount]);
  
  // Extract APR and reward information from contract data
  const stakingOptions = React.useMemo(() => {
    // Default options when contract data is not available
    const defaultOptions = [
      {
        title: '30 Day Lock',
        duration: 30,
        apr: 1.20,
        bonus: 0,
        maxApr: 1.20,
        stakeType: StakeType.FIXED_30_DAYS
      },
      {
        title: '90 Day Lock',
        duration: 90,
        apr: 3.50,
        bonus: 0.80,
        maxApr: 3.50,
        stakeType: StakeType.FIXED_90_DAYS
      },
      {
        title: '180 Day Lock',
        duration: 180,
        apr: 6.50,
        bonus: 2.00,
        maxApr: 6.50,
        stakeType: StakeType.FIXED_180_DAYS
      },
      {
        title: '365 Day Lock',
        duration: 365,
        apr: 12.00,
        bonus: 4.00,
        maxApr: 12.00,
        stakeType: StakeType.FIXED_365_DAYS
      },
    ];

    // If no contract data, return default options
    if (!stakingStats || !stakingStats.currentAPRs || !stakingStats.maxPossibleAPRs) {
      console.log('Using default staking options');
      return defaultOptions;
    }
    
    try {
      console.log('Calculating staking options from contract data:', stakingStats);
      
      // Extract data and calculate
      return [
        {
          title: '30 Day Lock',
          duration: 30,
          apr: Number(stakingStats.currentAPRs[0] || BigInt(0)) / 100,
          bonus: stakingStats.baseBonus ? Number(stakingStats.baseBonus[0] || BigInt(0)) / 100 : 0,
          maxApr: Number(stakingStats.maxPossibleAPRs[0] || BigInt(0)) / 100,
          stakeType: StakeType.FIXED_30_DAYS
        },
        {
          title: '90 Day Lock',
          duration: 90,
          apr: Number(stakingStats.currentAPRs[1] || BigInt(0)) / 100,
          bonus: stakingStats.baseBonus ? Number(stakingStats.baseBonus[1] || BigInt(0)) / 100 : 0,
          maxApr: Number(stakingStats.maxPossibleAPRs[1] || BigInt(0)) / 100,
          stakeType: StakeType.FIXED_90_DAYS
        },
        {
          title: '180 Day Lock',
          duration: 180,
          apr: Number(stakingStats.currentAPRs[2] || BigInt(0)) / 100,
          bonus: stakingStats.baseBonus ? Number(stakingStats.baseBonus[2] || BigInt(0)) / 100 : 0,
          maxApr: Number(stakingStats.maxPossibleAPRs[2] || BigInt(0)) / 100,
          stakeType: StakeType.FIXED_180_DAYS
        },
        {
          title: '365 Day Lock',
          duration: 365,
          apr: Number(stakingStats.currentAPRs[3] || BigInt(0)) / 100,
          bonus: stakingStats.baseBonus ? Number(stakingStats.baseBonus[3] || BigInt(0)) / 100 : 0,
          maxApr: Number(stakingStats.maxPossibleAPRs[3] || BigInt(0)) / 100,
          stakeType: StakeType.FIXED_365_DAYS
        },
      ];
    } catch (error) {
      console.error('Error processing staking stats:', error);
      return defaultOptions; // Return default options on error
    }
  }, [stakingStats]);
  
  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // 未发布或应用未启用：显示倒计时
  if (!isLaunched || !isAppEnabled) {
    // 显示不同的消息，取决于是时间未到还是应用未启用
    const message = "Launching on March 3, 2025 20:00 UTC+8"
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
          
          <h1 className="text-5xl md:text-7xl font-bold pb-8 bg-gradient-to-r from-cyan-400 to-primary bg-clip-text text-transparent">
            HSK Staking
          </h1>
          
          <p className="text-lg md:text-2xl mb-10 text-gray-300">
            Get ready for the future of staking. Launching soon.
          </p>
          
          {!isLaunched && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center mb-10 md:mb-16 max-w-md md:max-w-2xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-md p-4 md:p-6 rounded-xl border border-gray-700 shadow-lg">
                <div className="text-5xl md:text-6xl font-bold text-primary">{timeLeft.days}</div>
                <div className="text-xs md:text-sm uppercase tracking-wider mt-1 md:mt-2 text-gray-400">Days</div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-md p-4 md:p-6 rounded-xl border border-gray-700 shadow-lg">
                <div className="text-5xl md:text-6xl font-bold text-primary">{timeLeft.hours}</div>
                <div className="text-xs md:text-sm uppercase tracking-wider mt-1 md:mt-2 text-gray-400">Hours</div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-md p-4 md:p-6 rounded-xl border border-gray-700 shadow-lg">
                <div className="text-5xl md:text-6xl font-bold text-primary">{timeLeft.minutes}</div>
                <div className="text-xs md:text-sm uppercase tracking-wider mt-1 md:mt-2 text-gray-400">Minutes</div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-md p-4 md:p-6 rounded-xl border border-gray-700 shadow-lg">
                <div className="text-5xl md:text-6xl font-bold text-primary">{timeLeft.seconds}</div>
                <div className="text-xs md:text-sm uppercase tracking-wider mt-1 md:mt-2 text-gray-400">Seconds</div>
              </div>
            </div>
          )}
          
          <div className="text-base md:text-lg text-gray-400">
            {message}
          </div>
        </div>
      </div>
    );
  }
  
  // 已发布且应用已启用：显示主内容
  return (
    <MainLayout>
      <div className="min-h-screen text-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-16 pb-24">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-light text-white mb-6 font-sora">HashKey Chain Staking</h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Securely stake your HSK tokens and earn passive income with competitive APR
            </p>
            
            {/* Call to action button */}
            <div className="mt-10">
              <Link 
                href="/stake" 
                className="inline-flex items-center px-8 py-4 rounded-xl bg-primary/80 text-white hover:bg-primary transition-colors text-lg font-medium shadow-lg hover:shadow-xl"
              >
                Start Staking
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Total Staked Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 transition-all hover:border-primary/30 hover:bg-slate-800/80">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
                </svg>
                <h3 className="text-sm font-medium text-slate-300">Total Staked</h3>
              </div>
              {isLoadingCombined ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-slate-700 rounded w-32"></div>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-light tracking-tight text-white">
                    {typeof totalStaked === 'bigint' ? formatBigInt(totalStaked) : '0'}
                  </span>
                  <span className="text-lg font-light text-slate-400">HSK</span>
                </div>
              )}
            </div>

            {/* Exchange Rate Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 transition-all hover:border-primary/30 hover:bg-slate-800/80">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h12M3 12h8m-8 5h16" />
                </svg>
                <h3 className="text-sm font-medium text-slate-300">Current Rate</h3>
                <div className="tooltip tooltip-right" data-tip="Rate increases as rewards accumulate">
                  <svg className="w-4 h-4 text-primary/40 hover:text-primary/60 transition-colors cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              {isLoadingCombined ? (
                <div className="animate-pulse flex items-center">
                  <div className="h-8 bg-slate-700 rounded w-8 mr-2"></div>
                  <div className="h-8 bg-slate-700 rounded w-16 mx-2"></div>
                  <div className="h-8 bg-slate-700 rounded w-24 ml-2"></div>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-light tracking-tight text-white">1</span>
                  <span className="text-lg font-light text-slate-400">stHSK</span>
                  <span className="text-slate-500">=</span>
                  <span className="text-3xl font-light tracking-tight text-white">
                    {typeof exchangeRate === 'bigint' ? formatBigInt(exchangeRate) : '1'}
                  </span>
                  <span className="text-lg font-light text-slate-400">HSK</span>
                </div>
              )}
            </div>

            {/* Reward Interval Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 transition-all hover:border-primary/30 hover:bg-slate-800/80">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-sm font-medium text-slate-300">Reward Interval</h3>
              </div>
              {isLoadingCombined ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-slate-700 rounded w-24"></div>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-light tracking-tight text-white">1 Block</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Staking Options Section */}
        <div className="container mx-auto px-4 py-16 bg-slate-800/30">
          <h2 className="text-3xl font-light mb-10 text-center text-white">Staking Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stakingOptions.map((option, index) => (
              <div key={index} className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-primary/30 transition-all">
                <div className="p-6 border-b border-slate-700/50 text-center">
                  <h3 className="text-xl font-medium text-white">{option.title}</h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Duration</span>
                    <span className="text-white font-medium">{option.duration} days</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">APR</span>
                    <div>
                      <span className="text-white font-medium">{option.apr.toFixed(2)}%</span>
                      {option.bonus > 0 && (
                        <span className="text-emerald-400 ml-1">
                          (+{option.bonus.toFixed(2)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Max APR</span>
                    <span className="text-white font-medium">{option.maxApr.toFixed(2)}%</span>
                  </div>
                </div>
                
                <div className="p-6 border-t border-slate-700/50">
                  <Link 
                    href={`/stake?type=${option.stakeType}`} 
                    className="block w-full py-3 text-center bg-primary/80 text-white rounded-lg hover:bg-primary transition-colors"
                  >
                    Select
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* Features Section */}
          <div className="max-w-4xl mx-auto mt-20">
            <h2 className="text-3xl font-light mb-10 text-center text-white">Key Benefits</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Competitive APR</h3>
                <p className="text-slate-400">Earn up to 12% annual returns on your staked HSK tokens</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Security First</h3>
                <p className="text-slate-400">Your assets are protected by industry-leading security protocols</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Auto-Compounding</h3>
                <p className="text-slate-400">Rewards automatically accumulate to maximize your returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}