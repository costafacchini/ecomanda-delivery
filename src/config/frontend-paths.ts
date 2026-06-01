import path from 'path'

const frontendDistDir = path.resolve(process.cwd(), 'client/dist')
const frontendIndexFile = path.join(frontendDistDir, 'index.html')

export { frontendDistDir, frontendIndexFile }
