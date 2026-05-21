#!/usr/bin/env node
// Build script that trims DATABASE_URL before running prisma generate.
// Vercel may add accidental whitespace to env vars.
const { execSync } = require("child_process")

const env = { ...process.env }
if (env.DATABASE_URL) env.DATABASE_URL = env.DATABASE_URL.trim()

const opts = { stdio: "inherit", env }

execSync("npx prisma generate", opts)
execSync("npx next build", opts)
