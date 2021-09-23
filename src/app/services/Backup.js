const fs = require('fs')
const os = require('os')
const path = require('path')
const spawn = require('child_process').spawn
const archiver = require('archiver')
const mime = require('mime-types')
const aws = require('aws-sdk')

async function backup() {
  const mongoURI = process.env.MONGODB_URI

  const date = new Date()
  const folderDate = `backups-ecomanda/${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  const filename = `${folderDate}/${date.toISOString()}.zip`

  try {
    const archive = archiver.create('zip', {})
    const file = await doBackup(mongoURI)
    archive.append(fs.createReadStream(file.path), { name: file.name })
    archive.finalize()

    await upload(archive, filename)

    console.info('Backup efetuado com sucesso!')
  } catch (err) {
    console.info(`Erro ao tentar efetuar o backup ${err.toString()}`)
  }
}

function doBackup(mongoURI) {
  return new Promise(function (resolve, reject) {
    var fileName = 'ecomanda-delivery'
    var output = path.join(os.tmpdir(), fileName)

    const args = []
    args.push('--archive')
    args.push('--uri', mongoURI)
    args.push('--gzip')
    var mongodump = spawn('mongodump', args)

    mongodump.stdout.pipe(fs.createWriteStream(output))
    mongodump.stderr.on('data', function (data) {
      console.log(data.toString('ascii'))
    })
    mongodump.on('error', reject)

    return mongodump.stdout.on('end', function () {
      return resolve({
        name: fileName,
        path: output,
      })
    })
  })
}

function upload(content, fileName) {
  const backupAccessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const bucketName = process.env.AWS_BUCKET_NAME

  const s3 = new aws.S3({
    accessKeyId: backupAccessKeyId,
    secretAccessKey: secretAccessKey,
    region: 'us-east-1',
  })

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: content,
    ACL: 'public-read',
    ContentType: mime.lookup(fileName),
  }
  return s3.upload(params).promise()
}

module.exports = backup
