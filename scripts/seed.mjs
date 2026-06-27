// Generates a bcrypt hash for your admin password.
//
// Usage:
//   node scripts/seed.mjs your-password-here
//
// Copy the printed hash into .env.local as ADMIN_PASSWORD_HASH.

import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.log("Usage: node scripts/seed.mjs <your-password>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);

// Next.js expands `$VAR`-looking patterns when it loads .env files, which
// would otherwise mangle a bcrypt hash (they always contain `$2a$10$...`).
// Escaping each `$` as `\$` tells the loader to treat it as a literal
// character instead of a variable reference.
const escapedHash = hash.replace(/\$/g, "\\$");

console.log("\nAdd these lines to .env.local:\n");
console.log(`ADMIN_USERNAME=admin`);
console.log(`ADMIN_PASSWORD_HASH=${escapedHash}\n`);
