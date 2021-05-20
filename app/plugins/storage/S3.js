const aws = require('aws-sdk')
const mime = require('mime-types')

class S3 {
  constructor(licensee, contact, fileName, fileBase64) {
    this.licensee = licensee
    this.contact = contact
    this.fileName = fileName
    this.fileBase64 = fileBase64

    this.aws = new aws.S3({
      accessKeyId: licensee.awsId,
      secretAccessKey: licensee.awsSecret,
      region: 'us-east-1'
    })

    this.bucketName = this.licensee.bucketName
  }

  presignedUrl() {
    const fileFullPath = this.#getBucketPath() + this.fileName

    const fileURL = this.aws.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: fileFullPath
    })

    return fileURL.substr(0, fileURL.indexOf('?'))
  }

  #getBucketPath() {
    const date = new Date()
    const folderDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

    return folderDate + '/' + this.contact.number + '/'
  }

  uploadFile() {
    const fileFullPath = this.#getBucketPath() + this.fileName
    const buffer = this.#base64ToBuffer()

    const params = {
      Bucket: this.bucketName,
      Key: fileFullPath,
      Body: buffer,
      ACL: 'public-read',
      ContentType: mime.lookup(fileFullPath),
    }

    this.aws.upload(params, function(err, data) {
      if (err) {
        throw err;
      }
      console.info(`Arquivo enviado para S3 com sucesso. ${data.Location}`)
    })
  }

  #base64ToBuffer() {
    let streamFileBase64 = this.fileBase64

    //O base64 da winzap e utalk tem umas informações do arquivo que deves ser removidas.
    // Essas informações vão até a ",".
    if (streamFileBase64.indexOf(',') > -1) {
      streamFileBase64 = streamFileBase64.substr(streamFileBase64.indexOf(',') + 1)
    }

    return new Buffer(streamFileBase64, 'base64')
  }
}

module.exports = S3