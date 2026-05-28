// shared/utils/result-debug.ts
export function printResultSummary(result: any) {
  console.log("\n==============================");
  console.log("INPUT:");
  console.log(result.input);

  console.log("\nFINAL OUTPUT:");
  console.log(result.finalOutput);

  console.log("\nLAST AGENT:");
  console.log(result.lastAgent?.name);

  console.log("\n==============================\n");
}