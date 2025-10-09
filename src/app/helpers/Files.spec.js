import files from './Files.js'

const photoExtensions = ['jpg', 'jpeg', 'png', 'gif']
const videoExtensions = ['avi', 'mp4', 'm4v', 'mov', 'mpg', 'mpeg', 'wmv']
const midiaExtensions = ['aac', 'mp3', 'ogg', 'wma', 'alac', 'flac', 'wav', 'mpga']
const voiceExtensions = ['opus', 'oga']

describe('.isPhoto', () => {
  it.each(photoExtensions)('is true if it is %o', (photoExtension) => {
    expect(files.isPhoto(`file.${photoExtension}`)).toEqual(true)
  })

  it.each(videoExtensions.concat(midiaExtensions).concat(voiceExtensions))('is false if it is %o', (photoExtension) => {
    expect(files.isPhoto(`file.${photoExtension}`)).toEqual(false)
  })
})

describe('.isVideo', () => {
  it.each(videoExtensions)('is true if it is %o', (videoExtension) => {
    expect(files.isVideo(`file.${videoExtension}`)).toEqual(true)
  })

  it.each(photoExtensions.concat(midiaExtensions).concat(voiceExtensions))('is false if it is %o', (videoExtension) => {
    expect(files.isVideo(`file.${videoExtension}`)).toEqual(false)
  })
})

describe('.isMidia', () => {
  it.each(midiaExtensions)('is true if it is %o', (midiaExtension) => {
    expect(files.isMidia(`file.${midiaExtension}`)).toEqual(true)
  })

  it.each(photoExtensions.concat(videoExtensions).concat(voiceExtensions))('is false if it is %o', (midiaExtension) => {
    expect(files.isMidia(`file.${midiaExtension}`)).toEqual(false)
  })
})

describe('.isVoice', () => {
  it.each(voiceExtensions)('is true if it is %o', (voiceExtension) => {
    expect(files.isVoice(`file.${voiceExtension}`)).toEqual(true)
  })

  it.each(photoExtensions.concat(videoExtensions).concat(photoExtensions))('is false if it is %o', (voiceExtension) => {
    expect(files.isVoice(`file.${voiceExtension}`)).toEqual(false)
  })
})
