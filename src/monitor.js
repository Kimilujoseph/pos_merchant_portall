// monitor.js
setInterval(() => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  console.log(`--- Resource Usage ---`);
  console.log(`RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(
    `CPU Time: User ${cpuUsage.user / 1000}ms, System ${
      cpuUsage.system / 1000
    }ms`
  );
  console.log("----------------------\n");
}, 5000); // every 5s
