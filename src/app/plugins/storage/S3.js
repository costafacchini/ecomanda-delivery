import mime from 'mime-types'
import { S3Client, PutObjectCommand, GetObjectCommand  } from '@aws-sdk/client-s3.js'
import { getSignedUrl  } from '@aws-sdk/s3-request-presigner.js'

const getBucketPath = (number) => {
  const date = new Date()
  const folderDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

  return folderDate + '/' + number + '/'
}

const base64ToBuffer = (fileBase64) => {
  let streamFileBase64 = fileBase64

  //O base64 da utalk tem umas informações do arquivo que deves ser removidas.
  // Essas informações vão até a ",".
  if (streamFileBase64.indexOf(',') > -1) {
    streamFileBase64 = streamFileBase64.substr(streamFileBase64.indexOf(',') + 1)
  }

  return Buffer.from(streamFileBase64, 'base64')
}

class S3 {
  constructor(licensee, contact, fileName, fileBase64) {
    this.licensee = licensee
    this.contact = contact
    this.fileName = fileName
    this.fileBase64 = fileBase64

    this.aws = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: licensee.awsId,
        secretAccessKey: licensee.awsSecret,
      },
    })

    this.bucketName = this.licensee.bucketName
  }

  async presignedUrl() {
    const fileFullPath = getBucketPath(this.contact.number) + this.fileName

    const command = new GetObjectCommand({ Bucket: this.bucketName, Key: fileFullPath })
    const fileURL = await getSignedUrl(this.aws, command, { expiresIn: 3600 })

    return fileURL.substr(0, fileURL.indexOf('?'))
  }

  async uploadFile() {
    const fileFullPath = getBucketPath(this.contact.number) + this.fileName
    const buffer = base64ToBuffer(this.fileBase64)

    const params = {
      Bucket: this.bucketName,
      Key: fileFullPath,
      Body: buffer,
      ACL: 'public-read',
      ContentType: mime.lookup(fileFullPath),
    }

    const results = await this.aws.send(new PutObjectCommand(params))
    console.info(`Arquivo enviado para S3 com sucesso. ${results}`)

    return results
  }
}

export default S3
