const { S3Client, ListObjectsCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')

async function clearBackups() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const bucketName = process.env.AWS_BUCKET_NAME

  const date = new Date()
  date.setDate(date.getDate() - 1)
  const folderDate = `backups-ecomanda/${date.getFullYear()}-${date.getMonth()}-${date.getDate()}/`

  const pluginAWS = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  const params = {
    Bucket: bucketName,
    Prefix: folderDate,
  }

  const listCommand = new ListObjectsCommand(params)
  const response = await pluginAWS.send(listCommand)
  for (const obj of response.Contents) {
    const paramsDrop = {
      Bucket: bucketName,
      Key: obj.Key,
    }

    const deleteCommand = new DeleteObjectCommand(paramsDrop)
    await pluginAWS.send(deleteCommand)
  }
}

module.exports = clearBackups
