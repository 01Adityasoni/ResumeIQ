import React from 'react'
import '../auth.form.scss'
import {useNavigate , Link} from 'react-router-dom'
import {useAuth} from '../hooks/useAuth'
import { useState } from 'react'



const Login = () => {


  const {loading , handleLogin} = useAuth()
  
const [email , setEmail] = useState('')
const [password , setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    await handleLogin({email, password})
  }

  if(loading) {
    return <p>Loading...</p>
  }






  return (
    <main>
      <div className="form-con">
        <h1>Login </h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
            onChange={(e) => setEmail(e.target.value)}
             type="email" name="email" id="email" placeholder='Enter your email' />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
            onChange={(e) => setPassword(e.target.value)}
            type="password" name="password" id="password" placeholder='Enter your password' />
          </div>

          <button className='button primary-button'>Login</button>
        </form>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </main>
  )
}

export default Login