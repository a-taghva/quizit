import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const gradlePath = join(__dirname, '../android/capacitor-cordova-android-plugins/build.gradle')

try {
  let content = readFileSync(gradlePath, 'utf8')
  const flatDirBlock = /\s*flatDir\s*\{\s*\n\s*dirs\s+[^}]+\}\s*\n/g
  const newContent = content.replace(flatDirBlock, '')
  if (newContent !== content) {
    content = newContent
    writeFileSync(gradlePath, content)
    console.log('Removed flatDir from capacitor-cordova-android-plugins/build.gradle')
  }
} catch (err) {
  console.warn('Could not patch flatDir:', err.message)
}
