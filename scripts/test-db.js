// Test database connection script
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    console.log(`📊 Current user count: ${userCount}`)
    
    console.log('🎉 Database is ready!')
  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error(error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()