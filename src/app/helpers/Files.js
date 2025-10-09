function isPhoto(fileUrl) {
  return !!fileUrl.match(/.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)
}

function isVideo(fileUrl) {
  return !!fileUrl.match(/.(mp4|avi|mov|wmv|flv|webm|mkv|3gp|m4v|mpg|mpeg)$/i)
}

function isMidia(fileUrl) {
  return !!fileUrl.match(/.(aac|mp3|ogg|wma|alac|flac|wav|mpga)$/i)
}

function isVoice(fileUrl) {
  return !!fileUrl.match(/.(opus|oga)$/i)
}

export default { isPhoto, isVideo, isMidia, isVoice }
