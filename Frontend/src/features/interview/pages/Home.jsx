import React, { useContext, useEffect, useRef, useState } from 'react'
import '../style/home.scss'
import {useInterview} from '../hooks/useInteview'
import {useNavigate} from 'react-router-dom'
import { AuthContext } from '../../auth/auth.context'
import { logout as logoutUser } from '../../auth/services/auth.api'



function Home() {


    const {loading, generateReport , reports, getAllReports } = useInterview()
    const { user, setUser } = useContext(AuthContext)
    const [jobDesc, setJobDesc] = useState('')
    const [selfDesc, setSelfDesc] = useState('')
    const [resumeName, setResumeName] = useState('')
    const [errorText, setErrorText] = useState('')
    const [loadingStep, setLoadingStep] = useState(0)
    const [logoutLoading, setLogoutLoading] = useState(false)
    const resumeInputRef = useRef(null)

    const navigate = useNavigate()

    useEffect(() => {
        getAllReports()
    }, [])

    const loadingMessages = [
        'Reading your resume context...',
        'Matching your profile with the role...',
        'Designing personalized interview questions...',
        'Scoring confidence and technical fit...'
    ]

    useEffect(() => {
        if (!loading) {
            setLoadingStep(0)
            return
        }

        const intervalId = setInterval(() => {
            setLoadingStep((prev) => (prev + 1) % loadingMessages.length)
        }, 1400)

        return () => clearInterval(intervalId)
    }, [loading, loadingMessages.length])
 
 
    const words = (text = '') => text.trim() ? text.trim().split(/\s+/).length : 0
    const jobWords = words(jobDesc)
    const selfWords = words(selfDesc)
    const hasResume = Boolean(resumeName)
    const completionSteps = [jobWords > 0, selfWords > 0, hasResume]
    const completionPercent = Math.round((completionSteps.filter(Boolean).length / completionSteps.length) * 100)

    const openFile = () => {
        resumeInputRef.current?.click()
    }

    const onFileChange = (e) => {
        const selectedFile = e.target.files?.[0]
        setResumeName(selectedFile ? selectedFile.name : '')
        if (selectedFile) {
            setErrorText('')
        }
    }

    const clearAll = () => {
        setJobDesc('')
        setSelfDesc('')
        setResumeName('')
        setErrorText('')
        if (resumeInputRef.current) {
            resumeInputRef.current.value = ''
        }
    }

    const handleLogout = async () => {
        setLogoutLoading(true)

        try {
            await logoutUser()
            setUser(null)
            navigate('/login')
        } catch (error) {
            setErrorText(error.message || 'Unable to log out right now. Please try again.')
        } finally {
            setLogoutLoading(false)
        }
    }

    const handleGenerate = async () => {
        const resumeFile = resumeInputRef.current?.files?.[0]

        if (!jobDesc.trim()) {
            setErrorText('Please add a job description first.')
            return
        }

        if (!selfDesc.trim()) {
            setErrorText('Please add your self description.')
            return
        }

        if (!resumeFile) {
            setErrorText('Please upload your resume PDF.')
            return
        }

        setErrorText('')

        try {
            const data = await generateReport(jobDesc, selfDesc, resumeFile)
            if (data?._id) {
                navigate(`/interview/${data._id}`)
                return
            }
            setErrorText('Interview could not be generated. Please try again.')
        } catch (error) {
            setErrorText(error.message || 'Something went wrong while generating the interview.')
        }
    }

    return (
        <main className="home">
            {loading && (
                <div className="generation-overlay" role="status" aria-live="polite" aria-busy="true">
                    <div className="generation-overlay__card">
                        <div className="generation-loader" aria-hidden="true">
                            <span className="ring ring-1" />
                            <span className="ring ring-2" />
                            <span className="core" />
                        </div>
                        <h3>Generating Your AI Interview</h3>
                        <p className="generation-message">{loadingMessages[loadingStep]}</p>
                        <div className="loading-dots" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                </div>
            )}

            <section className="card">
                <div className="home-hero">
                    <div>
                        <p className="hero-kicker">Interview Prep Studio</p>
                        <h1 className="hero-title">Create smarter mock interviews with your real profile</h1>
                        <p className="hero-subtitle">
                            Add the job description, your personal summary, and your resume PDF to generate a tailored interview set.
                        </p>
                    </div>
                    <div className="hero-status">
                        <p className="hero-status__label">Session readiness</p>
                        <p className="hero-status__value">{completionPercent}%</p>
                        <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completionPercent}>
                            <span style={{ width: `${completionPercent}%` }} />
                        </div>
                        <div className="status-grid">
                            <span className={jobWords > 0 ? 'status-pill done' : 'status-pill'}>JD</span>
                            <span className={selfWords > 0 ? 'status-pill done' : 'status-pill'}>Self Intro</span>
                            <span className={hasResume ? 'status-pill done' : 'status-pill'}>Resume</span>
                        </div>
                    </div>
                </div>

                <div className="insights-strip">
                    <article className="insight-card">
                        <p>Job Description</p>
                        <strong>{jobWords} words</strong>
                    </article>
                    <article className="insight-card">
                        <p>Self Description</p>
                        <strong>{selfWords} words</strong>
                    </article>
                    <article className="insight-card">
                        <p>Resume</p>
                        <strong>{hasResume ? 'Uploaded' : 'Missing'}</strong>
                    </article>
                    <article className="insight-card">
                        <p>Past Interviews</p>
                        <strong>{reports.length}</strong>
                    </article>
                </div>

                <h2 className="title">Interview Helper</h2>
                <div className="interview-input-group">
                    <div className="left">
                        <label className="label">Job Description</label>
                        <textarea
                            name="jobDescription"
                            id="jobDescription"
                            placeholder="Enter the job description here..."
                            value={jobDesc}
                            onChange={(e) => setJobDesc(e.target.value)}
                        />
                        <div className="meta">
                            <span className="words">Words: {words(jobDesc)}</span>
                            <span className="chars">Chars: {jobDesc.length}</span>
                        </div>
                    </div>

                    <div className="right">
                        <div className="input-group">
                            <p>
                                Resume <small className="highlight">(Use Resume and Self Description together for better results)</small>
                            </p>
                            <div className="file-row">
                                <button type="button" className="file-label" onClick={openFile}>
                                    {resumeName ? 'Change Resume' : 'Upload Resume (PDF)'}
                                </button>
                                <span className="file-name">{resumeName || 'No file chosen'}</span>
                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type="file"
                                    id="resume"
                                    name="resume"
                                    accept=".pdf"
                                    onChange={onFileChange}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="selfDescription">Self Description</label>
                            <textarea
                                name="selfDescription"
                                id="selfDescription"
                                placeholder="Enter a brief self description..."
                                value={selfDesc}
                                onChange={(e) => setSelfDesc(e.target.value)}
                            />
                            <div className="meta">
                                <span className="words">Words: {words(selfDesc)}</span>
                                <span className="chars">Chars: {selfDesc.length}</span>
                            </div>
                        </div>

                        <div className="actions">
                            <button className="btn" onClick={handleGenerate} disabled={loading}>
                                {loading ? <span className="spinner" /> : 'Generate Interview'}
                            </button>
                            <button className="btn ghost" onClick={clearAll} disabled={loading}>
                                Clear
                            </button>
                        </div>
                        {errorText && <p className="form-error">{errorText}</p>}
                    </div>
                </div>

                <div className="tips">
                    <strong>Tips:</strong>
                    <ul>
                        <li>Paste a concise JD for focused questions.</li>
                        <li>Use bullet points in self description for clarity.</li>
                        <li>Upload your resume to personalize results.</li>
                    </ul>
                </div>


                {reports.length > 0 && (
                    <div className="previous-reports">
                        <h3>Previous Interviews</h3>
                        <ul className="previous-reports__list">
                            {reports.map((report) => (
                                <li
                                    key={report._id}
                                    className="previous-reports__item"
                                    onClick={() => navigate(`/interview/${report._id}`)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            navigate(`/interview/${report._id}`)
                                        }
                                    }}
                                >
                                    <div className="previous-reports__header">
                                        <strong>{report.jobDescription?.slice(0, 80) || 'Interview report'}</strong>
                                        <span>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Recently'}</span>
                                    </div>
                                    <div className="previous-reports__meta">
                                        <span>Match score: {typeof report.matchScore === 'number' ? `${report.matchScore}%` : 'N/A'}</span>
                                        <span>{report.technicalQuestions?.length || 0} technical questions</span>
                                    </div>
                                    <div className="previous-reports__cta">Open interview report</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <aside className="profile-card" aria-label="User profile">
                    <div className="profile-card__avatar" aria-hidden="true">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="profile-card__content">
                        <p className="profile-card__label">Signed in as</p>
                        <strong className="profile-card__name">{user?.username || 'User'}</strong>
                        <span className="profile-card__email">{user?.email || 'No email available'}</span>
                    </div>
                    <button
                        type="button"
                        className="profile-card__logout"
                        onClick={handleLogout}
                        disabled={logoutLoading}
                    >
                        {logoutLoading ? 'Logging out...' : 'Logout'}
                    </button>
                </aside>






            </section>
        </main>
    )
}

export default Home