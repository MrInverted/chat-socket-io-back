## POST: /register

inc: 
  login: string, 
  password: string

return 400:
  err: string

return 200:       
  success: boolean
  token: string
  user: 
    id: string
    login: string
    createdAt: string
    updatedAt: string



## POST: /login

inc: 
  login: string, 
  password: string

return 400:
  err: string

return 200:       
  success: boolean
  token: string
  user: 
    id: string
    login: string
    createdAt: string
    updatedAt: string



## GET: /me

inc:
  headers.authorization: string

return 401:
  err: string

return 200:       
  success: boolean
  token: string
  user: 
    id: string
    login: string
    createdAt: string
    updatedAt: string