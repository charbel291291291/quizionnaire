#!/usr/bin/env node

// scripts/updateQuestionsFromCsv.mjs
// Usage:
//  node -r dotenv/config scripts/updateQuestionsFromCsv.mjs --file=scripts/questions_update.csv --apply
//  node -r dotenv/config scripts/updateQuestionsFromCsv.mjs --file=scripts/questions_update.csv    (dry-run)

import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const argv = process.argv.slice(2);
const args = argv.reduce((acc, cur) => {
  const [k, v] = cur.split("=");
  acc[k.replace(/^--/, "")] = v ?? true;
  return acc;
}, {});

const csvFile = args.file || "scripts/questions_update.csv";
const apply = !!args.apply || !!args.yes;
const backupFlag = !!args.backup || !!args.b;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env. Aborting."
  );
  process.exit(1);
}

console.log(`Using Supabase URL: ${SUPABASE_URL}`);
console.log(`CSV file: ${csvFile}`);
console.log(`Dry run: ${!apply}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

function parseCsvLine(line) {
  // Simple CSV parser that handles double-quoted values and commas.
  const cols = [];
  let i = 0;
  const len = line.length;
  while (i < len) {
    let char = line[i];
    let val = "";
    if (char === '"') {
      // quoted value
      i++; // skip opening quote
      while (i < len) {
        char = line[i];
        if (char === '"') {
          // may be end of quoted value or escaped quote
          if (i + 1 < len && line[i + 1] === '"') {
            // escaped quote
            val += '"';
            i += 2;
            continue;
          }
          i++; // skip closing quote
          break;
        }
        val += char;
        i++;
      }
      // skip until next comma
      while (i < len && line[i] !== ",") i++;
      if (line[i] === ",") i++; // skip comma
    } else {
      // unquoted
      while (i < len && line[i] !== ",") {
        val += line[i];
        i++;
      }
      if (line[i] === ",") i++;
    }
    cols.push(val);
  }
  return cols.map((c) => c.trim());
}

async function main() {
  if (!fs.existsSync(csvFile)) {
    console.error(`CSV not found: ${csvFile}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(csvFile, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    console.error(
      "CSV must include a header row and at least one data row. Aborting."
    );
    process.exit(1);
  }

  const headers = parseCsvLine(lines[0]);
  console.log("Parsed CSV headers:", headers);

  const rows = lines
    .slice(1)
    .map((l) => parseCsvLine(l))
    .map((cols) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = cols[idx] ?? "";
      });
      return obj;
    });

  // Validate rows
  const invalidRows = rows.filter((r) => !r.id && !r.question_text);
  if (invalidRows.length > 0) {
    console.error(
      "ERROR: Some rows are missing both `id` and `question_text` keys. Examples:"
    );
    console.error(invalidRows.slice(0, 3));
    process.exit(1);
  }

  console.log(`Dry run: ${!apply}. Rows to process: ${rows.length}`);

  let applied = 0;
  const backupRows = [];
  const backupSelectFields = [
    "id",
    "category_id",
    "question_text",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "correct_answer",
    "difficulty",
    "coins_reward",
    "created_at",
  ];
  for (const r of rows) {
    const update = {};
    // Only add keys that are provided
    if (r.question_text) update.question_text = r.question_text;
    if (r.option_a) update.option_a = r.option_a;
    if (r.option_b) update.option_b = r.option_b;
    if (r.option_c) update.option_c = r.option_c;
    if (r.option_d) update.option_d = r.option_d;
    if (r.correct_answer) update.correct_answer = r.correct_answer;
    if (r.difficulty) update.difficulty = r.difficulty;
    if (r.coins_reward) update.coins_reward = parseInt(r.coins_reward, 10);
    if (r.category_id) update.category_id = r.category_id;

    if (Object.keys(update).length === 0) {
      console.log("Skipping row (no update columns):", r);
      continue;
    }

    // Validate allowed values
    if (
      update.correct_answer &&
      !["A", "B", "C", "D"].includes(update.correct_answer)
    ) {
      console.error(
        "Invalid correct_answer (must be A/B/C/D):",
        update.correct_answer
      );
      continue;
    }
    if (
      update.difficulty &&
      !["easy", "medium", "hard"].includes(update.difficulty)
    ) {
      console.error(
        "Invalid difficulty (must be easy/medium/hard):",
        update.difficulty
      );
      continue;
    }

    console.log("Prepared update for:", r.id ?? r.question_text, update);

    // Fetch and store pre-update rows if backup is requested
    if (apply && backupFlag) {
      try {
        let existing;
        if (r.id) {
          const res = await supabase
            .from("questions")
            .select(backupSelectFields.join(","))
            .eq("id", r.id);
          existing = res.data || [];
        } else {
          const res = await supabase
            .from("questions")
            .select(backupSelectFields.join(","))
            .eq("question_text", r.question_text);
          existing = res.data || [];
        }
        for (const e of existing) backupRows.push(e);
      } catch (e) {
        console.error(
          "Failed to fetch existing rows for backup:",
          e.message || e
        );
      }
    }

    if (!apply) continue; // skip actual update

    try {
      let res;
      if (r.id) {
        res = await supabase
          .from("questions")
          .update(update)
          .eq("id", r.id)
          .select();
      } else {
        // Be careful: using question_text might update multiples if not unique
        res = await supabase
          .from("questions")
          .update(update)
          .eq("question_text", r.question_text)
          .select();
      }
      if (res.error) {
        console.error("Failed to update:", r, res.error.message);
      } else {
        applied++;
        console.log(
          "Updated rows:",
          res.data?.length ?? 0,
          " Result ID/first:",
          res.data?.[0]?.id
        );
      }
    } catch (e) {
      console.error("Unexpected error updating row:", r, e.message || e);
    }
  }

  // Write backup file if any backups were collected
  if (apply && backupFlag && backupRows.length > 0) {
    try {
      const backupFile = `scripts/questions_update_backup_${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.csv`;
      const headers = Object.keys(backupRows[0]);
      const csvLines = [headers.join(",")];
      for (const r of backupRows) {
        const line = headers
          .map((h) => {
            const v = r[h] == null ? "" : `${r[h]}`;
            // Escape double-quotes
            return v.includes(",") || v.includes('"') || v.includes("\n")
              ? `"${v.replace(/"/g, '""')}"`
              : v;
          })
          .join(",");
        csvLines.push(line);
      }
      fs.writeFileSync(backupFile, csvLines.join("\n"), "utf8");
      console.log("Backup written to:", backupFile);
    } catch (e) {
      console.error("Failed to write backup file:", e.message || e);
    }
  }

  console.log(`Done. Applied updates: ${applied}/${rows.length}`);
}

main().catch((e) => {
  console.error("Unexpected failure:", e);
  process.exit(1);
});
