const mongoS3 = require('mongo-backup-s3')

async function backup() {
  const mongoURI = process.env.MONGODB_URI
  const backupAccessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const bucketName = process.env.AWS_BUCKET_NAME

  const date = new Date()
  const folderDate = `backups-ecomanda/${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  const filename = `${folderDate}/${date.toISOString()}.zip`

  try {
    await mongoS3({
      log: console.log,
      uri: mongoURI,
      s3: {
        accessKeyId: backupAccessKeyId,
        secretAccessKey: secretAccessKey,
        bucket: bucketName,
        key: filename,
      },
    })

    console.info('Backup efetuado com sucesso!')
  } catch (err) {
    console.info(`Erro ao tentar efetuar o backup ${err.toString()}`)
  }
}

module.exports = backup
