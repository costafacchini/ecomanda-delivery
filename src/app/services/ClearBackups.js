const aws = require('aws-sdk')

function clearBackups() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const bucketName = process.env.AWS_BUCKET_NAME

  const date = new Date()
  date.setDate(date.getDate() - 1)
  const folderDate = `backups-ecomanda/${date.getFullYear()}-${date.getMonth()}-${date.getDate()}/`

  const pluginAWS = new aws.S3({
    accessKeyId,
    secretAccessKey,
    region: 'us-east-1',
  })

  const params = {
    Bucket: bucketName,
    Prefix: folderDate,
  }

  pluginAWS.listObjects(params, function (err, data) {
    if (err) {
      throw err
    }

    for (const obj of data.Contents) {
      const paramsDrop = {
        Bucket: bucketName,
        Key: obj.Key,
      }

      pluginAWS.deleteObject(paramsDrop, function (err, _) {
        if (err) {
          throw err
        }
      })
    }
  })
}

module.exports = clearBackups
