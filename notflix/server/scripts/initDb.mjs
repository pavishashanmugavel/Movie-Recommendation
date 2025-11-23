import 'dotenv/config'
import { MongoClient } from 'mongodb'

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
  const dbName = process.env.DB_NAME || 'Netflix_users'

  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)

    // Ensure collections
    const collections = await db.listCollections().toArray()
    const names = new Set(collections.map(c => c.name))

    if (!names.has('users')) {
      await db.createCollection('users')
      console.log('Created collection: users')
    } else {
      console.log('Collection exists: users')
    }

    if (!names.has('reviews')) {
      await db.createCollection('reviews')
      console.log('Created collection: reviews')
    } else {
      console.log('Collection exists: reviews')
    }

    // Indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    console.log('Ensured unique index on users.email')

    await db.collection('reviews').createIndex({ userId: 1 })
    console.log('Ensured index on reviews.userId')

    console.log(`Initialization complete for database: ${dbName}`)
  } catch (e) {
    console.error('DB init error:', e)
    process.exit(1)
  } finally {
    await client.close()
  }
}

main()
