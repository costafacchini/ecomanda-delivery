import 'isomorphic-fetch'

async function request(url, method, { headers, body, isDownload }) {
  const requestOptions = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (headers && headers['Content-Type'] && headers['Content-Type'].includes('multipart/form-data')) {
    requestOptions.body = body
  } else {
    requestOptions.body = JSON.stringify(body)
  }

  let result

  try {
    const response = await fetch(url, requestOptions)
    const data = isDownload ? await response.arrayBuffer() : await response.text()

    result = {
      status: response.status,
      headers: response.headers,
      data: data.length > 0 && isJSON(response) && !isDownload ? JSON.parse(data) : data,
    }
  } catch (e) {
    result = {
      status: 500,
      data: `Ocorreu um erro ao tentar dar um ${method} na url ${url} com o body ${JSON.stringify(
        body,
      )} e resultou na mensagem ${e}`,
    }
  }

  return result
}

function isJSON(response) {
  return response.headers.get('content-type') && response.headers.get('content-type').includes('application/json')
}

export default {
  get(url, requestOpts = {}) {
    return request(url, 'GET', requestOpts)
  },
  post(url, requestOpts = {}) {
    return request(url, 'POST', requestOpts)
  },
  patch(url, requestOpts = {}) {
    return request(url, 'PATCH', requestOpts)
  },
  put(url, requestOpts = {}) {
    return request(url, 'PUT', requestOpts)
  },
  download(url, requestOpts = {}) {
    return request(url, 'GET', Object.assign(requestOpts, { isDownload: true }))
  },
  delete(url, requestOpts = {}) {
    return request(url, 'DELETE', requestOpts)
  },
}
