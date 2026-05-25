import React from 'react'
import '../style/home.scss'
function Home() {
  return (
    <main className="home">

        <div className="interview-input-group">
    <div className="left">
        <textarea name="jobDescription" id="jobDescription" placeholder='Enter the job description here...'></textarea>
    </div>

    <div className="right">
        <div className="input-group">
            <label htmlFor="resume">Upload Resume:</label>
            <input hidden type="file" id="resume" name="resume" accept='.pdf' />
        </div>
        <div className="input-group">
            <label htmlFor="selfDescription">Self Description:</label>
            <textarea name='selfDescription' id='selfDescription' placeholder='Enter a brief self description...'></textarea>
        </div>
    </div>
        </div>
    </main>
  )
}

export default Home