1. 灵活质押（14天提取）
- 解锁比例：1/365
- 每天解锁的veHSK数量 = 1000 / 365 ≈ 2.74个veHSK
- 14天后已解锁的veHSK数量 = 2.74 × 14 ≈ 38.36个veHSK
2. 30天锁仓
- 解锁比例：1.1/365
- 每天解锁的veHSK数量：1000 / 365 * 1.1 ≈ 3.16个veHSK
- 30天后已解锁的veHSK数量：3.16 × 30 ≈ 94.8个veHSK
3. 90天锁仓
- 解锁比例：1.5/365（提高）
- 每天解锁的veHSK数量：1000 / 365 * 1.5 ≈ 4.11个veHSK
- 90天后已解锁的veHSK数量：4.11 × 90 ≈ 369.9个veHSK
4. 180天锁仓
- 解锁比例：1.8/365（提高）
- 每天解锁的veHSK数量：1000 / 365 * 1.8 ≈ 4.93个veHSK
- 180天后已解锁的veHSK数量：4.93 × 180 ≈ 887.4个veHSK
5. 365天锁仓
- 解锁比例：2/365（提高）
- 每天解锁的veHSK数量：1000 / 365 * 2 ≈ 5.48个veHSK
- 365天后已解锁的veHSK数量：5.48 × 365 ≈ 2000个veHSK（完成解锁）


14天的在 useFlexibleStaking  batchGetFlexibleStakingInfo


// 计算总共的 veHsk
const valueLockedFlexiable = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: HashKeyChainStakingABI,
          functionName: 'totalSharesByStakeType',
          args: [stakeTypeMap['flexiable']],
        }) as bigint;


const valueLocked30 = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: HashKeyChainStakingABI,
            functionName: 'totalSharesByStakeType',
            args: [stakeTypeMap['30days']],
          }) as bigint;
          // console.log('valueLocked90:', valueLocked30.toString());

        // 获取各期限类型的总质押份额
        const valueLocked90 = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: HashKeyChainStakingABI,
          functionName: 'totalSharesByStakeType',
          args: [stakeTypeMap['90days']],
        }) as bigint;
        // console.log('valueLocked90:', valueLocked90.toString());

        const valueLocked180 = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: HashKeyChainStakingABI,
          functionName: 'totalSharesByStakeType',
          args: [stakeTypeMap['180days']],
        }) as bigint;
        // console.log('valueLocked180:', valueLocked180.toString());

        const valueLocked365 = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: HashKeyChainStakingABI,
          functionName: 'totalSharesByStakeType',
          args: [stakeTypeMap['365days']],
        }) as bigint;
        // console.log('valueLocked365:', valueLocked365.toString());
        
        