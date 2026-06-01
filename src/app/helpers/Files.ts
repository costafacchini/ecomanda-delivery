function isPhoto(fileUrl: string): boolean {
  return !!fileUrl.match(/.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i)
}

function isVideo(fileUrl: string): boolean {
  return !!fileUrl.match(/.(mp4|avi|mov|wmv|flv|webm|mkv|3gp|m4v|mpg|mpeg)(\?|$)/i)
}

function isMidia(fileUrl: string): boolean {
  return !!fileUrl.match(/.(aac|mp3|ogg|wma|alac|flac|wav|mpga)(\?|$)/i)
}

function isVoice(fileUrl: string): boolean {
  return !!fileUrl.match(/.(opus|oga)(\?|$)/i)
}

export { isPhoto, isVideo, isMidia, isVoice }
