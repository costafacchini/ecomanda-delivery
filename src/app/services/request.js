require('isomorphic-fetch')

async function request(url, method, { headers, body, isDownload }) {
  const requestOptions = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  }

  let result

  try {
    // eslint-disable-next-line no-undef
    const response = await fetch(url, requestOptions)
    const data = isDownload ? await response.buffer() : await response.text()

    result = {
      status: response.status,
      headers: response.headers,
      data: data.length > 0 && isJSON(response) && !isDownload ? JSON.parse(data) : data,
    }
  } catch (e) {
    result = {
      status: 500,
      data: `Ocorreu um erro ao tentar dar um post na url ${url} com o body ${JSON.stringify(
        body
      )} e resultou na mensagem ${e}`,
    }
  }

  return result
}

function isJSON(response) {
  return response.headers.get('content-type') && response.headers.get('content-type').includes('application/json')
}

module.exports = {
  get(url, requestOpts = {}) {
    return request(url, 'get', requestOpts)
  },
  post(url, requestOpts = {}) {
    return request(url, 'post', requestOpts)
  },
  download(url, requestOpts = {}) {
    return request(url, 'get', Object.assign(requestOpts, { isDownload: true }))
  },
}
