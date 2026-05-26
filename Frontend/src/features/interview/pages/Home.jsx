import React, { useEffect, useRef, useState } from 'react'
import '../style/home.scss'
import {useInterview} from '../hooks/useInteview'
import {useNavigate} from 'react-router-dom'



function Home() {


    const {loading, generateReport , reports, getAllReports } = useInterview()
    const [jobDesc, setJobDesc] = useState('')
    const [selfDesc, setSelfDesc] = useState('')
    const [resumeName, setResumeName] = useState('')
    const [errorText, setErrorText] = useState('')
    const resumeInputRef = useRef(null)

    const navigate = useNavigate()

    useEffect(() => {
        getAllReports()
    }, [])
 
 
    const words = (text = '') => text.trim() ? text.trim().split(/\s+/).length : 0

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
            <section className="card">
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
                            <button className="btn ghost" onClick={clearAll}>
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
                                </li>
                            ))}
                        </ul>
                    </div>
                )}






            </section>
        </main>
    )
}

export default Home