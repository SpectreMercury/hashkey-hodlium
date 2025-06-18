import { createPublicClient, http, defineChain } from 'viem';
import { hashkey } from 'viem/chains'
const RPC_URL = "https://mainnet.hsk.xyz"; 


// 2. 创建 viem public client 实例
const client = createPublicClient({
  chain: hashkey,
  transport: http(RPC_URL),
});

/**
 * 使用二分查找算法，根据时间戳估算区块号
 * @param {object} client - Viem Public Client 实例
 * @param {bigint} targetTimestamp - 目标时间戳 (Unix apoch, in seconds)
 * @returns {Promise<bigint>} - 估算的区块号
 */
async function findBlockNumberForTimestamp(client, targetTimestamp) {
  try {
    const latestBlock = await client.getBlock({ blockTag: 'latest' });
    let high = latestBlock.number;
    let low = 0n; // 使用 BigInt
    let mid;
    let closestBlockNumber = 0n;

    // 二分查找的精度，可以根据需要调整
    const tolerance = 100n; 

    while (low <= high) {
      mid = low + (high - low) / 2n;
      if (mid === 0n) { // 避免查询创世区块之前的区块
          low = 1n;
          continue;
      }
      const block = await client.getBlock({ blockNumber: mid });

      if (block.timestamp === targetTimestamp) {
        return mid; // 精确找到
      } else if (block.timestamp < targetTimestamp) {
        closestBlockNumber = mid; // 这是一个可能的候选者
        low = mid + 1n;
      } else {
        high = mid - 1n;
      }

      // 如果搜索范围已经很小，可以提前结束循环以提高效率
      if (high - low < tolerance) {
        break;
      }
    }
    
    // 最后的 `closestBlockNumber` 是小于等于目标时间戳的最后一个区块
    // 通常我们需要的是时间戳之后生成的第一个区块，所以返回 `low`
    return low;
  } catch (error) {
    console.error(`在查找时间戳 ${targetTimestamp} 时发生错误:`, error);
    throw error;
  }
}

/**
 * 主函数，计算并打印指定年份每个月的区块号范围
 */
export async function calculateAndPrintMonthlyRanges() {
  console.log("正在连接到 HashKey Chain 并获取最新区块信息...");
  const latestBlock = await client.getBlock({ blockTag: 'latest' });
  console.log(`连接成功！最新区块号: ${latestBlock.number}, 时间戳: ${new Date(Number(latestBlock.timestamp) * 1000).toUTCString()}`);
  console.log("\n============================================================");
  console.log("开始计算 2025 年和 2026 年每个月的区块号范围...");
  console.log("注意: 这可能需要几分钟时间，因为它需要多次请求 RPC 节点。");
  console.log("============================================================\n");

  const years = [2025, 2026];
  let lastMonthEndBlock = null;

  for (const year of years) {
    for (let month = 0; month < 12; month++) {
      // 获取当前月的开始时间 (UTC)
      const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));
      // 获取下个月的开始时间，也就是当前月的结束时间 (UTC)
      const endDate = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));

      const startTimestamp = BigInt(Math.floor(startDate.getTime() / 1000));
      const endTimestamp = BigInt(Math.floor(endDate.getTime() / 1000));

      const monthName = startDate.toLocaleString('default', { month: 'long', timeZone: 'UTC' });
      // process.stdout.write(`正在计算 ${year}年 ${monthName} 的范围... `);

      try {
        // 计算当前月起始区块号
        const startBlock = lastMonthEndBlock 
            ? lastMonthEndBlock // 如果有上个月的数据，直接用上个月的结束点作为这个月的开始点
            : await findBlockNumberForTimestamp(client, startTimestamp);

        // 计算下个月起始区块号，用来确定本月结束区块
        const nextMonthStartBlock = await findBlockNumberForTimestamp(client, endTimestamp);
        const endBlock = nextMonthStartBlock - 1n; // 本月结束区块是下个月开始区块的前一个

        console.log(`✅ 完成`);
        console.log(` -> ${year}-${String(month + 1).padStart(2, '0')} (${monthName}):`);
        console.log(`    开始区块 (Start Block): ${startBlock}`);
        console.log(`    结束区块 (End Block)  : ${endBlock}`);
        console.log(`    (范围包含 ${endBlock - startBlock + 1n} 个区块)`);
        console.log("------------------------------------------------------------");

        // 为下一次循环缓存结果
        lastMonthEndBlock = nextMonthStartBlock;

      } catch (e) {
        console.log(`❌ 失败`);
        console.error(`计算 ${year}年 ${monthName} 时出错，已跳过。`);
      }
    }
  }
}

// 运行主函数
// calculateAndPrintMonthlyRanges().catch(console.error);