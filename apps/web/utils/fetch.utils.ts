export const baseHeaders: HeadersInit = {
  "Content-Type": "application/json",
}

function setEnhanceOptions(options: RequestInit): RequestInit {
  return {
    ...options,
    credentials: "include",
    headers: {
      ...baseHeaders,
      ...options.headers,
    },
  }
}

export async function fetchWrapper<T>(
  url: string,
  { headers, ...options }: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, setEnhanceOptions(options))
  const data = await response.json()
  if (!response.ok) {
    const error = (data && data.message) || response.statusText
    return Promise.reject(error)
  }
  return data
}
