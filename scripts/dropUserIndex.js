/**
 * One-time fix script — drops the stale "unique" index on the `user`
 * field in the conversations collection. This index was created back
 * when Conversation had `unique: true` on user (one conversation per
 * user); we removed that from the schema, but MongoDB doesn't
 * automatically drop indexes just because the schema changed — the
 * old index stayed active in the database, silently blocking creation
 * of a second conversation for the same user (causing the "New Chat"
 * 500 error).
 *
 * Run once: node scripts/dropUserIndex.js
 * Safe to delete this file after running it successfully.
 * ----------------------------------------------------------------------- */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const collection = mongoose.connection.collection("conversations");
  const indexes = await collection.indexes();

  console.log("Current indexes on 'conversations':");
  console.log(indexes);

  const userIndex = indexes.find(
    (idx) => idx.key && idx.key.user === 1 && idx.unique
  );

  if (!userIndex) {
    console.log("No unique index on 'user' found — nothing to drop. The bug may be caused by something else.");
  } else {
    await collection.dropIndex(userIndex.name);
    console.log(`Dropped index: ${userIndex.name}`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});