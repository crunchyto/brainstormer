// Build verification script for deployment
import fs from 'fs'
import path from 'path'

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL', 
  'NEXTAUTH_SECRET',
  'OPENAI_API_KEY'
]

const requiredFiles = [
  'netlify.toml',
  'prisma/schema.prisma',
  '.env.production',
  'package.json'
]

function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variables...')
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missing.length > 0) {
    console.log('⚠️  Missing environment variables:')
    missing.forEach(envVar => console.log(`   - ${envVar}`))
    return false
  }
  
  console.log('✅ All environment variables present')
  return true
}

function checkRequiredFiles() {
  console.log('🔍 Checking required files...')
  
  const missing = requiredFiles.filter(file => !fs.existsSync(file))
  
  if (missing.length > 0) {
    console.log('⚠️  Missing required files:')
    missing.forEach(file => console.log(`   - ${file}`))
    return false
  }
  
  console.log('✅ All required files present')
  return true
}

function checkPackageJson() {
  console.log('🔍 Checking package.json build script...')
  
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  
  if (!pkg.scripts.build.includes('prisma generate')) {
    console.log('⚠️  Build script missing Prisma generate')
    return false
  }
  
  console.log('✅ Build script configured correctly')
  return true
}

function main() {
  console.log('🚀 BrAInstormer Deployment Verification\n')
  
  const checks = [
    checkRequiredFiles(),
    checkPackageJson(),
    checkEnvironmentVariables()
  ]
  
  const allPassed = checks.every(check => check)
  
  console.log('\n' + '='.repeat(50))
  
  if (allPassed) {
    console.log('🎉 All checks passed! Ready for deployment')
    console.log('\nNext steps:')
    console.log('1. Push code to GitHub')
    console.log('2. Connect to Netlify')
    console.log('3. Add environment variables to Netlify')
    console.log('4. Deploy!')
  } else {
    console.log('❌ Some checks failed. Please fix issues before deploying.')
    process.exit(1)
  }
}

main()