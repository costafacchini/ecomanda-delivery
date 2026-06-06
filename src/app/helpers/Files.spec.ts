import { isPhoto, isVideo, isMidia, isVoice } from './Files'

const photoExtensions = ['jpg', 'jpeg', 'png', 'gif']
const videoExtensions = ['avi', 'mp4', 'm4v', 'mov', 'mpg', 'mpeg', 'wmv']
const midiaExtensions = ['aac', 'mp3', 'ogg', 'wma', 'alac', 'flac', 'wav', 'mpga']
const voiceExtensions = ['opus', 'oga']

describe('.isPhoto', () => {
  it.each(photoExtensions)('is true if it is %o', (photoExtension) => {
    expect(isPhoto(`file.${photoExtension}`)).toEqual(true)
  })

  it.each(videoExtensions.concat(midiaExtensions).concat(voiceExtensions))('is false if it is %o', (photoExtension) => {
    expect(isPhoto(`file.${photoExtension}`)).toEqual(false)
  })
})

describe('.isVideo', () => {
  it.each(videoExtensions)('is true if it is %o', (videoExtension) => {
    expect(isVideo(`file.${videoExtension}`)).toEqual(true)
  })

  it.each(photoExtensions.concat(midiaExtensions).concat(voiceExtensions))('is false if it is %o', (videoExtension) => {
    expect(isVideo(`file.${videoExtension}`)).toEqual(false)
  })

  it('is true for S3 presigned URL with extension inside query param', () => {
    const presignedUrl =
      'https://broken-bird-5742.fly.storage.tigris.dev/1h1y3onjjy3i7yn74vyo9ppz8shb?response-content-disposition=attachment%3B%20filename%3D%220506_Stories.mp4%22%3B%20filename%2A%3DUTF-8%27%270506_Stories.mp4&response-content-type=video%2Fmp4&X-Amz-Algorithm=AWS4-HMAC-SHA256'
    expect(isVideo(presignedUrl)).toEqual(true)
  })
})

describe('.isMidia', () => {
  it.each(midiaExtensions)('is true if it is %o', (midiaExtension) => {
    expect(isMidia(`file.${midiaExtension}`)).toEqual(true)
  })

  it.each(photoExtensions.concat(videoExtensions).concat(voiceExtensions))('is false if it is %o', (midiaExtension) => {
    expect(isMidia(`file.${midiaExtension}`)).toEqual(false)
  })
})

describe('.isVoice', () => {
  it.each(voiceExtensions)('is true if it is %o', (voiceExtension) => {
    expect(isVoice(`file.${voiceExtension}`)).toEqual(true)
  })

  it.each(photoExtensions.concat(videoExtensions).concat(photoExtensions))('is false if it is %o', (voiceExtension) => {
    expect(isVoice(`file.${voiceExtension}`)).toEqual(false)
  })
})
