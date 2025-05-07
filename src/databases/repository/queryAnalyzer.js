import { PrismaClient } from "@prisma/client";

export class QueryAnalyzer {
  constructor() {
    this.queryStats = new Map();
    this.startTime = process.hrtime.bigint();
  }

  async analyze(operation) {
    const prisma = new PrismaClient({
      log: [{ level: "query", emit: "event" }],
    });

    prisma.$on("query", (e) => {
      const stats = this.queryStats.get(e.query) || {
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
      };

      stats.count++;
      stats.totalDuration += e.duration;
      stats.minDuration = Math.min(stats.minDuration, e.duration);
      stats.maxDuration = Math.max(stats.maxDuration, e.duration);
      this.queryStats.set(e.query, stats);
    });

    try {
      return await operation();
    } finally {
      await prisma.$disconnect();
    }
  }

  printStats() {
    const totalTime = Number(process.hrtime.bigint() - this.startTime) / 1e6;

    console.log("\n--- Query Statistics ---");
    console.log(`Total execution time: ${totalTime.toFixed(2)}ms`);

    Array.from(this.queryStats.entries())
      .sort((a, b) => b[1].totalDuration - a[1].totalDuration)
      .forEach(([query, stats], index) => {
        console.log(`\n#${index + 1}: ${query}`);
        console.log(`  Calls: ${stats.count}`);
        console.log(`  Total: ${stats.totalDuration.toFixed(2)}ms`);
        console.log(
          `  Avg:   ${(stats.totalDuration / stats.count).toFixed(2)}ms`
        );
        console.log(
          `  Range: ${stats.minDuration.toFixed(2)}-${stats.maxDuration.toFixed(
            2
          )}ms`
        );
      });
  }

  async cleanup() {
    this.queryStats.clear();
  }
}
