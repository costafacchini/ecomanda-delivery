import path from 'path'

const frontendDistDir = path.resolve(process.cwd(), 'client/dist')
const frontendIndexFile = path.join(frontendDistDir, 'index.html')
const widgetDistDir = path.resolve(process.cwd(), 'widget/dist')

export { frontendDistDir, frontendIndexFile, widgetDistDir }
