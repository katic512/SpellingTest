import { initDb, seedWordsFromFile, pool } from './db.js'

async function main() {
  await initDb()
  const n = await seedWordsFromFile()
  console.log(`Seeded vocabulary_words with ${n} words`)
  await pool.end()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
