const fs = require('fs')
const path = require('path')

// Lista de arquivos para atualizar
const filesToUpdate = [
  'src/pages/Contacts/scenes/Form/index.spec.js',
  'src/pages/Contacts/scenes/Edit/index.spec.js',
  'src/pages/Contacts/scenes/New/index.spec.js',
  'src/pages/Users/scenes/Form/index.spec.js',
  'src/pages/Users/scenes/Edit/index.spec.js',
  'src/pages/Users/scenes/New/index.spec.js',
  'src/pages/Licensees/scenes/Form/index.spec.js',
  'src/pages/Licensees/scenes/Edit/index.spec.js',
  'src/pages/Licensees/scenes/New/index.spec.js',
  'src/pages/Templates/scenes/Show/index.spec.js',
  'src/pages/Templates/scenes/Index/index.spec.js',
  'src/pages/Triggers/scenes/Edit/index.spec.js',
  'src/pages/Triggers/scenes/New/index.spec.js',
  'src/pages/Triggers/scenes/Index/index.spec.js',
  'src/pages/Triggers/scenes/Importation/index.spec.js',
  'src/pages/Contacts/scenes/Index/index.spec.js',
  'src/pages/Users/scenes/Index/index.spec.js',
  'src/pages/Licensees/scenes/Index/index.spec.js',
  'src/pages/Messages/scenes/Index/index.spec.js',
]

filesToUpdate.forEach((filePath) => {
  try {
    const fullPath = path.join(__dirname, filePath)
    let content = fs.readFileSync(fullPath, 'utf8')

    // Calcular o caminho relativo para test-utils
    const relativePath = path.relative(path.dirname(fullPath), path.join(__dirname, 'src/test-utils'))
    const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`

    // Substituir imports
    content = content.replace(
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@testing-library\/react['"]/g,
      `import { $1 } from '${importPath}'`,
    )

    // Remover import do MemoryRouter
    content = content.replace(/import\s*{\s*MemoryRouter\s*}\s*from\s*['"]react-router['"];?\s*\n?/g, '')

    // Substituir render com MemoryRouter por render simples
    content = content.replace(/render\(\s*<MemoryRouter>\s*([\s\S]*?)\s*<\/MemoryRouter>\s*\)/g, 'render($1)')

    fs.writeFileSync(fullPath, content)
    console.log(`Updated: ${filePath}`)
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message)
  }
})

console.log('Done updating test files!')
