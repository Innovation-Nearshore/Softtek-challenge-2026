import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error || err.response?.data?.message || err.message
    return Promise.reject(new Error(message))
  }
)

export default client
