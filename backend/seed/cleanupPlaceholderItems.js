// One-time cleanup: removes leftover placeholder-image products that
// were inserted into MongoDB by the old, now-deleted seed scripts
// (seedFirstAidItems.js / importFirstAidCSV.js). Those scripts used
// "https://via.placeholder.com/120" as a fake image for every item —
// a string that never appears in the real inventory.csv — so it's a
// safe, unique fingerprint to find and remove only the old fake data
// without touching any real product.
//
// Safe to run even if those old scripts were never run — it will
// simply report 0 matches and delete nothing.
//
// Usage:
//   node seed/cleanupPlaceholderItems.js         (writes to MongoDB)
//   node seed/cleanupPlaceholderItems.js --dry    (report only, no deletes)

const DRY_RUN = process.argv.includes("--dry");

async function main() {
  require("dotenv").config();
  const mongoose = require("mongoose");
  const Inventory = require("../models/Inventory");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const query = { image: "https://via.placeholder.com/120" };
  const matches = await Inventory.find(query, "name category tripTags");

  console.log(`Found ${matches.length} leftover placeholder item(s):`);
  matches.forEach((m) =>
    console.log(`  - ${m.name} (${m.category}) tripTags=${JSON.stringify(m.tripTags)}`)
  );

  if (DRY_RUN) {
    console.log("\n--dry run: nothing deleted.");
  } else if (matches.length > 0) {
    const result = await Inventory.deleteMany(query);
    console.log(`\nDeleted ${result.deletedCount} item(s).`);
  } else {
    console.log("\nNothing to delete.");
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error("Cleanup failed:", error);
  process.exit(1);
});
