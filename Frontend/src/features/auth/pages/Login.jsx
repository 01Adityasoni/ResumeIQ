import React from 'react'
import '../auth.form.scss'
import {useNavigate , Link} from 'react-router-dom'
import {useAuth} from '../hooks/useAuth'
import { useState } from 'react'



const Login = () => {


  const {loading , handleLogin} = useAuth()
  const navigate = useNavigate()
const [email , setEmail] = useState('')
const [password , setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    await handleLogin({email, password})
    navigate('/')
  }

  if(loading) {
    return <p>Loading...</p>
  }






  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-hero" aria-label="Project highlights">
          <p className="eyebrow">Welcome Back</p>
          <h1>Ace Your Next Interview Round</h1>
          <p className="hero-copy">
            ResumeIQ helps you practice with realistic interview scenarios, receive AI-powered feedback,
            and track your growth project by project.
          </p>

          <div className="feature-grid">
            <article className="feature-card">
              <h3>Live Practice Projects</h3>
              <p>Simulate frontend, backend, and full-stack interviews with guided prompts.</p>
            </article>
            <article className="feature-card">
              <h3>Smart Feedback Loop</h3>
              <p>Get instant scoring for communication, depth, and technical clarity.</p>
            </article>
            <article className="feature-card">
              <h3>Progress Timelines</h3>
              <p>Visualize your consistency and track improvements over time.</p>
            </article>
          </div>
        </aside>

        <div className="form-con">
          <p className="form-kicker">Account Access</p>
          <h2>Login</h2>
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
        </section>
    </main>
  )
}

export default Login