// Build optimization script for production deployment
import { execSync } from 'child_process'
import fs from 'fs'

console.log('🚀 Starting BrAInstormer build optimization...\n')

// Step 1: Clean previous builds
console.log('🧹 Cleaning previous builds...')
try {
  execSync('npm run clean', { stdio: 'inherit' })
  console.log('✅ Clean completed\n')
} catch (error) {
  console.log('⚠️  Clean skipped (no previous build found)\n')
}

// Step 2: Install dependencies
console.log('📦 Installing dependencies...')
try {
  execSync('npm ci --production=false', { stdio: 'inherit' })
  console.log('✅ Dependencies installed\n')
} catch (error) {
  console.error('❌ Dependency installation failed:', error.message)
  process.exit(1)
}

// Step 3: Generate Prisma client
console.log('🗄️  Generating Prisma client...')
try {
  execSync('npx prisma generate', { stdio: 'inherit' })
  console.log('✅ Prisma client generated\n')
} catch (error) {
  console.error('❌ Prisma generation failed:', error.message)
  process.exit(1)
}

// Step 4: Run production build
console.log('🔨 Building for production...')
try {
  execSync('npm run build:production', { stdio: 'inherit' })
  console.log('✅ Production build completed\n')
} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
}

// Step 5: Analyze build output
console.log('📊 Analyzing build output...')
try {
  const nextDir = '.next'
  if (fs.existsSync(nextDir)) {
    const stats = fs.statSync(nextDir)
    console.log(`✅ Build output created: ${nextDir}`)
    console.log(`📁 Build size: ${(stats.size / 1024).toFixed(2)} KB`)
  }
} catch (error) {
  console.log('⚠️  Could not analyze build output')
}

console.log('\n🎉 Build optimization completed successfully!')
console.log('\nNext steps:')
console.log('1. Test locally: npm start')
console.log('2. Deploy to Netlify')
console.log('3. Set environment variables in Netlify dashboard')