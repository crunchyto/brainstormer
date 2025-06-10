// Deployment readiness checklist for BrAInstormer
import fs from 'fs'
import { execSync } from 'child_process'

console.log('🚀 BrAInstormer Deployment Readiness Checklist\n')

const checks = [
  {
    name: '📁 Repository Status',
    check: () => {
      try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' })
        return status.trim() === '' ? 'Clean working directory' : 'Uncommitted changes'
      } catch {
        return 'Git repository not found'
      }
    }
  },
  {
    name: '📝 Environment Files',
    check: () => {
      const files = ['.env.example', '.env.production', 'netlify.toml']
      const missing = files.filter(file => !fs.existsSync(file))
      return missing.length === 0 ? 'All deployment files present' : `Missing: ${missing.join(', ')}`
    }
  },
  {
    name: '📦 Build Configuration',
    check: () => {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
        const hasScripts = pkg.scripts.build && pkg.scripts.build.includes('prisma generate')
        return hasScripts ? 'Build scripts configured' : 'Build scripts missing Prisma'
      } catch {
        return 'package.json not found'
      }
    }
  },
  {
    name: '🔧 Next.js Configuration',
    check: () => {
      try {
        const config = fs.readFileSync('next.config.ts', 'utf8')
        const hasStandalone = config.includes('standalone')
        return hasStandalone ? 'Optimized for serverless' : 'Missing standalone output'
      } catch {
        return 'next.config.ts not found'
      }
    }
  },
  {
    name: '🗄️ Database Schema',
    check: () => {
      try {
        const schema = fs.readFileSync('prisma/schema.prisma', 'utf8')
        const hasPostgres = schema.includes('postgresql')
        return hasPostgres ? 'PostgreSQL configured' : 'Still using SQLite'
      } catch {
        return 'Prisma schema not found'
      }
    }
  },
  {
    name: '🔐 Security Files',
    check: () => {
      const gitignore = fs.readFileSync('.gitignore', 'utf8')
      const ignoresEnv = gitignore.includes('.env')
      return ignoresEnv ? 'Environment files properly ignored' : 'Environment files not ignored'
    }
  },
  {
    name: '📋 Documentation',
    check: () => {
      const docs = ['DEPLOYMENT.md', 'NETLIFY_DEPLOYMENT.md', 'README.md']
      const existing = docs.filter(doc => fs.existsSync(doc))
      return existing.length >= 2 ? `Documentation complete (${existing.length}/3)` : 'Missing documentation'
    }
  }
]

let allPassed = true

checks.forEach((check, index) => {
  const result = check.check()
  const status = result.includes('Missing') || result.includes('not found') || result.includes('Still using') ? '❌' : '✅'
  
  if (status === '❌') allPassed = false
  
  console.log(`${status} ${check.name}: ${result}`)
})

console.log('\n' + '='.repeat(60))

if (allPassed) {
  console.log('🎉 All checks passed! Ready for Netlify deployment')
  console.log('\nNext steps:')
  console.log('1. Push your code to GitHub (git push origin main)')
  console.log('2. Connect repository to Netlify')
  console.log('3. Configure environment variables')
  console.log('4. Deploy and test!')
} else {
  console.log('⚠️  Some issues need attention before deployment')
  console.log('Please fix the issues marked with ❌ above')
}

console.log('\n📖 See NETLIFY_DEPLOYMENT.md for detailed instructions')