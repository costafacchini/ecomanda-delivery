import _ from 'lodash'

function sanitizeExpressErrors(errorsList: { msg: string }[]): { message: string }[] {
  return _.uniqWith(errorsList, _.isEqual).map((item: any) => {
    return {
      message: item.msg,
    }
  })
}

function sanitizeModelErrors(errors: Record<string, { message: string }>): { message: string }[] {
  return Object.keys(errors).map((key) => {
    return { message: errors[key].message }
  })
}

export { sanitizeExpressErrors, sanitizeModelErrors }
