import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function runMigrations() {
  try {
    const DATABASE_URL = process.env.DATABASE_URL

    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    console.log('Running database migrations...')

    // Create connection for migrations
    const migrationClient = postgres(DATABASE_URL, { max: 1 })
    const db = drizzle(migrationClient)

    // Run migrations from drizzle folder
    await migrate(db, { migrationsFolder: './drizzle' })

    console.log('✓ Migrations completed successfully')

    await migrationClient.end()
    process.exit(0)
  } catch (error) {
    console.error('✗ Migration failed:', error)
    process.exit(1)
  }
}

runMigrations()
