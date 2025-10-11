import fs from 'fs'
import os from 'os'
import path from 'path'
import spawn from 'child_process'
import archiver from 'archiver'
import mime from 'mime-types'
import bl from 'bl'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

async function backup() {
  const mongoURI = process.env.MONGODB_URI

  const date = new Date()
  const folderDate = `backups-ecomanda/${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  const filename = `${folderDate}/${date.toISOString()}.zip`

  try {
    let buf

    const archive = archiver.create('zip', {})
    const file = await doBackup(mongoURI)
    archive.append(fs.createReadStream(file.path), { name: file.name })
    archive.pipe(
      bl((_, data) => {
        buf = data
      }),
    )
    archive.finalize()

    await upload(buf, filename)

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

async function upload(content, fileName) {
  const backupAccessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const bucketName = process.env.AWS_BUCKET_NAME

  const s3 = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: backupAccessKeyId,
      secretAccessKey: secretAccessKey,
    },
  })

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: content,
    ACL: 'public-read',
    ContentType: mime.lookup(fileName),
  }

  const results = await s3.send(new PutObjectCommand(params))

  return results
}

export default backup
