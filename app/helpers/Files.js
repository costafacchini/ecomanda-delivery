function isPhoto(fileUrl) {
  return !!fileUrl.match(/.(jpg|jpeg|png|gif)$/i)
}

function isVideo(fileUrl) {
  return !!fileUrl.match(/.(avi|mp4|m4v|mov|mpg|mpeg|wmv)$/i)
}

function isMidia(fileUrl) {
  return !!fileUrl.match(/.(aac|mp3|ogg|wma|alac|flac|wav|mpga)$/i)
}

function isVoice(fileUrl) {
  return !!fileUrl.match(/.(opus|oga)$/i)
}

module.exports = { isPhoto, isVideo, isMidia, isVoice }
