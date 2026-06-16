export interface IApiResponse<T = unknown> {
  status: number
  data: T
}

interface RequestOptions {
  headers?: Record<string, string | null>
  body?: unknown
}

export default function api() {
  async function request<T = unknown>(
    url: string,
    method: string,
    { headers, body }: RequestOptions
  ): Promise<IApiResponse<T>> {
    const requestOptions = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    }

    let result: IApiResponse<T>

    try {
      const response = await fetch(url, requestOptions as RequestInit)
      const data = await response.text()

      result = {
        status: response.status,
        data: (data.length > 0 && isJSON(response) ? JSON.parse(data) : data) as T,
      }
    } catch (e) {
      result = {
        status: 500,
        data: `Ocorreu um erro ao tentar dar um post na url ${url} com o body ${JSON.stringify(
          body
        )} e resultou na mensagem ${e}` as unknown as T,
      }
    }

    return result
  }

  function isJSON(response: Response) {
    return response.headers.get('content-type')?.includes('application/json')
  }

  return {
    post: function <T = unknown>(url: string, requestOpts: RequestOptions = {}) {
      return request<T>(url, 'post', requestOpts)
    },
    get: function <T = unknown>(url: string, requestOpts: RequestOptions = {}) {
      return request<T>(url, 'get', requestOpts)
    },
    delete: function <T = unknown>(url: string, requestOpts: RequestOptions = {}) {
      return request<T>(url, 'delete', requestOpts)
    },
  }
}
