#!/usr/bin/env node

const os = require("os");

function formatBytes(bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

function memoryBar(used,total) {
    const percent = used / total;
    const width = 30;
    const filled = Math.round(width * percent);
    const empty = width - filled;

    const bar = "[" + "#".repeat(filled) + "-".repeat(empty) + "] ";
    const percentText = (percent * 100).toFixed(1) + "%";

    // warna manual ANSI
    if (percent > 0.8) {
        return "\x1b[31m" + bar + percentText + "\x1b[0m"; // merah
    } else if (percent > 0.6) {
        return "\x1b[33m" + bar + percentText + "\x1b[0m"; // kuning
    }

    return "\x1b[32m" + bar + percentText + "\x1b[0m"; // hijau
}

let lastCPU = os.cpus();

function getCPUUsage() {
    const currentCPU = os.cpus();

    let idleDiff = 0;
    let totalDiff = 0;

    for (let i = 0; i < currentCPU.length; i++) {
        const prev = lastCPU[i].times;
        const curr = currentCPU[i].times;

        const prevTotal = Object.values(prev).reduce((a, b) => a + b, 0);
        const currTotal = Object.values(curr).reduce((a, b) => a + b, 0);

        totalDiff += currTotal - prevTotal;
        idleDiff += curr.idle - prev.idle;
   }

    lastCPU = currentCPU;

    return (1 - idleDiff / totalDiff) * 100;
}

function showSystemInfo(jsonMode=false) {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpuUsage = getCPUUsage();

    if (jsonMode) {
        console.log(JSON.stringify({
            release: os.release(),
            version: os.version(),
            uptime_minutes: (os.uptime() / 60).toFixed(2),
            memory: {
                used: usedMem,
                free: freeMem,
                total: totalMem
            },
            cpu_usage_percent: cpuUSage.toFixed(2)
        }, null, 2));
        return;
   }

    console.clear();
    console.log("🐧 SMON-LITE\n");

    console.log("Release  :", os.release());
    console.log("Version  :", os.version());
    console.log("Uptime   :", (os.uptime() / 60).toFixed(2), "minutes");

    console.log("\nMemory:");
    console.log(memoryBar(usedMem, totalMem));
    console.log("Used :", formatBytes(usedMem));
    console.log("Free :", formatBytes(freeMem));
    console.log("Total:", formatBytes(totalMem));

    console.log("\nCPU Usage:", cpuUsage.toFixed(2) + "%");
    console.log("Cores:", os.cpus().length);
}

const isWatch = process.argv.includes("--watch");
const isJSON = process.argv.includes("--json");

if (isWatch){
    setInterval(showSystemInfo, 1000);
} else {
    showSystemInfo(isJSON);
}
