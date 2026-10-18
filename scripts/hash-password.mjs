// Usage: node scripts/hash-password.mjs "the-password"
// Prints the value for ADMIN_PASSWORD_HASH_B64 in .env.local.
// (Base64 is used because bcrypt hashes contain "$", which .env files
// would otherwise try to expand as variables.)
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Usage: node scripts/hash-password.mjs "<password of 12+ chars>"');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log(`ADMIN_PASSWORD_HASH_B64=${Buffer.from(hash).toString("base64")}`);
