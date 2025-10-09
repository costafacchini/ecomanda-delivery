import _ from 'lodash'

function sanitizeExpressErrors(errorsList) {
  return _.uniqWith(errorsList, _.isEqual).map((item) => {
    return {
      message: item.msg,
    }
  })
}

function sanitizeModelErrors(errors) {
  return Object.keys(errors).map((key) => {
    return { message: errors[key].message }
  })
}

export { sanitizeExpressErrors, sanitizeModelErrors }
