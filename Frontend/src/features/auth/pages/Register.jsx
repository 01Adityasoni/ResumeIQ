import React from 'react'
import {useNavigate , Link} from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'




const Register = () => {



    const navigate = useNavigate()
    const { loading, handleRegister } = useAuth()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')



    
  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = await handleRegister({ username, email, password })
    if (data) {
      navigate('/login')
    }
  }

  if (loading) {
    return <p>Loading...</p>
  }


  return (
        <main>
      <div className="form-con">
        <h1>Register </h1>
        <form onSubmit={handleSubmit}>




          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder='Enter your username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder='Enter your password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className='button primary-button'>Register</button>
        </form>




        <p>Already have an account ? <Link to="/login">Login</Link></p>
      </div>
    </main>
  )
}

export default Register