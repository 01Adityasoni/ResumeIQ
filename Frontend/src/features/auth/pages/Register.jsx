import React from 'react'
import '../auth.form.scss'
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
        <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-hero" aria-label="Platform summary">
          <p className="eyebrow">Start Your Journey</p>
          <h1>Build Confidence for Real Interviews</h1>
          <p className="hero-copy">
            Join ResumeIQ to practice project-based interviews, strengthen communication, and
            unlock personalized insights that make every session count.
          </p>

          <div className="feature-grid">
            <article className="feature-card">
              <h3>Role Specific Tracks</h3>
              <p>Choose scenarios tailored for frontend, backend, data, and product roles.</p>
            </article>
            <article className="feature-card">
              <h3>AI Report Cards</h3>
              <p>Understand strengths, weak spots, and next steps after each interview run.</p>
            </article>
            <article className="feature-card">
              <h3>Consistent Practice</h3>
              <p>Set weekly goals and keep momentum with structured sessions.</p>
            </article>
          </div>
        </aside>

        <div className="form-con">
          <p className="form-kicker">Create Account</p>
          <h2>Register</h2>
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
        </section>
    </main>
  )
}

export default Register