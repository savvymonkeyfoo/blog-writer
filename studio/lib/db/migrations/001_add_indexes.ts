import Database from 'better-sqlite3'
import path from 'path'

export async function up() {
  console.log('Adding indexes to assets table...')

  const dbPath = path.join(process.cwd(), 'local.db')
  const db = new Database(dbPath)

  db.exec(`CREATE INDEX IF NOT EXISTS group_id_idx ON assets(group_id)`)
  db.exec(`CREATE INDEX IF NOT EXISTS status_idx ON assets(status)`)
  db.exec(`CREATE INDEX IF NOT EXISTS created_at_idx ON assets(created_at)`)
  db.exec(`CREATE INDEX IF NOT EXISTS group_id_created_at_idx ON assets(group_id, created_at)`)
  db.exec(`CREATE INDEX IF NOT EXISTS type_idx ON assets(type)`)

  db.close()

  console.log('Indexes added successfully')
}

export async function down() {
  console.log('Removing indexes from assets table...')

  const dbPath = path.join(process.cwd(), 'local.db')
  const db = new Database(dbPath)

  db.exec(`DROP INDEX IF EXISTS group_id_idx`)
  db.exec(`DROP INDEX IF EXISTS status_idx`)
  db.exec(`DROP INDEX IF EXISTS created_at_idx`)
  db.exec(`DROP INDEX IF EXISTS group_id_created_at_idx`)
  db.exec(`DROP INDEX IF EXISTS type_idx`)

  db.close()

  console.log('Indexes removed successfully')
}
