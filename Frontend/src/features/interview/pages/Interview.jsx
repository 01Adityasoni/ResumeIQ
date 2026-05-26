import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInteview.js'
import { useParams } from 'react-router'
import { useNavigate } from 'react-router-dom'



const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

const parseMaybeJson = (value) => {
    if (typeof value !== 'string') {
        return value
    }

    const trimmed = value.trim()
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        return value
    }

    try {
        return JSON.parse(trimmed)
    } catch {
        return value
    }
}

const stripMarkupTags = (value) => {
    if (typeof value !== 'string') {
        return value
    }

    return value
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

const formatText = (value) => {
    const parsed = parseMaybeJson(value)

    if (parsed && typeof parsed === 'object') {
        return stripMarkupTags(parsed.question || parsed.skill || parsed.focus || parsed.title || parsed.answer || value)
    }

    return stripMarkupTags(String(parsed || ''))
}

const getQuestionDisplayData = (item) => {
    const parsedQuestion = parseMaybeJson(item.question)

    if (parsedQuestion && typeof parsedQuestion === 'object') {
        return {
            question: parsedQuestion.question || item.question,
            intention: parsedQuestion.intention || parsedQuestion.intension || item.intention || item.intension,
            answer: parsedQuestion.answer || item.answer,
        }
    }

    return {
        question: item.question,
        intention: item.intention || item.intension,
        answer: item.answer,
    }
}

const getSkillGapDisplay = (gap) => {
    const parsedSkill = parseMaybeJson(gap.skill)

    if (parsedSkill && typeof parsedSkill === 'object') {
        return {
            skill: parsedSkill.skill || gap.skill,
            severity: parsedSkill.severity || gap.severity,
        }
    }

    return {
        skill: gap.skill,
        severity: gap.severity,
    }
}

const getJobMeta = (jobDescription = '') => {
    const lines = String(jobDescription)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

    const fields = {}

    lines.forEach((line) => {
        const separatorIndex = line.indexOf(':')
        if (separatorIndex <= 0 || separatorIndex > 30) {
            return
        }

        const key = line.slice(0, separatorIndex).trim().toLowerCase()
        const value = line.slice(separatorIndex + 1).trim()
        if (!value || fields[key]) {
            return
        }

        fields[key] = value
    })

    return {
        position: fields.position || 'Full Stack Developer',
        company: fields.company || 'Target Company',
        location: fields.location || 'Not specified',
        experience: fields.experience || 'Not specified',
        jobType: fields['job type'] || 'Not specified',
    }
}

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [ open, setOpen ] = useState(false)
    const display = getQuestionDisplayData(item)
    return (
        <div className='q-card'>
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{formatText(display.question)}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Intention</span>
                        <p>{formatText(display.intention)}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                        <p>{formatText(display.answer)}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day }) => {
    const [ expanded, setExpanded ] = useState(day.day === 1)

    return (
        <div className='roadmap-day'>
            <div className='roadmap-day__header'>
                <span className='roadmap-day__badge'>Day {day.day}</span>
                <h3 className='roadmap-day__focus'>{formatText(day.focus)}</h3>
                <button type='button' className='roadmap-day__toggle' onClick={() => setExpanded((prev) => !prev)}>
                    {expanded ? 'Hide tasks' : 'Show tasks'}
                </button>
            </div>
            {expanded && (
                <ul className='roadmap-day__tasks'>
                    {(day.tasks || []).map((task, i) => (
                        <li key={i}>
                            <span className='roadmap-day__bullet' />
                            {formatText(task)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const [ isBootstrapping, setIsBootstrapping ] = useState(true)
    const [ isDownloading, setIsDownloading ] = useState(false)
    const [ downloadStep, setDownloadStep ] = useState(0)
    const [ downloadNotice, setDownloadNotice ] = useState('')
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()
    const navigate = useNavigate()

    const downloadMessages = [
        'Collecting report insights...',
        'Composing your resume layout...',
        'Finalizing PDF and preparing download...'
    ]

    useEffect(() => {
        let isMounted = true

        const loadReport = async () => {
            if (!interviewId) {
                if (isMounted) {
                    setIsBootstrapping(false)
                }
                return
            }

            try {
                await getReportById(interviewId)
            } finally {
                if (isMounted) {
                    setIsBootstrapping(false)
                }
            }
        }

        loadReport()

        return () => {
            isMounted = false
        }
    }, [ interviewId ])

    useEffect(() => {
        if (!isDownloading) {
            setDownloadStep(0)
            return
        }

        const intervalId = setInterval(() => {
            setDownloadStep((prev) => (prev + 1) % downloadMessages.length)
        }, 1300)

        return () => clearInterval(intervalId)
    }, [ isDownloading, downloadMessages.length ])



    if (isBootstrapping || (loading && !report) || !report) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    const technicalCount = report.technicalQuestions?.length || 0
    const behavioralCount = report.behavioralQuestions?.length || 0
    const roadmapDays = report.preparationPlan?.length || 0
    const normalizedSkillGaps = (report.skillGaps || []).map((gap) => {
        const display = getSkillGapDisplay(gap)

        return {
            skill: formatText(display.skill),
            severity: String(display.severity || 'medium').toLowerCase(),
        }
    })
    const highSeverityGaps = normalizedSkillGaps.filter((gap) => gap.severity === 'high').length
    const mediumSeverityGaps = normalizedSkillGaps.filter((gap) => gap.severity === 'medium').length
    const lowSeverityGaps = normalizedSkillGaps.filter((gap) => gap.severity === 'low').length
    const jobMeta = getJobMeta(report.jobDescription)

    const handleResumeDownload = async () => {
        if (!interviewId || isDownloading) {
            return
        }

        setDownloadNotice('')
        setIsDownloading(true)

        try {
            await getResumePdf(interviewId)
            setDownloadNotice('Resume PDF downloaded successfully.')
        } catch (error) {
            setDownloadNotice(error.message || 'Unable to download resume right now.')
        } finally {
            setIsDownloading(false)
        }
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low'


    return (
        <div className='interview-page'>
            {isDownloading && (
                <div className='download-overlay' role='status' aria-live='polite' aria-busy='true'>
                    <div className='download-overlay__card'>
                        <div className='download-orbit' aria-hidden='true'>
                            <span className='download-orbit__ring outer' />
                            <span className='download-orbit__ring inner' />
                            <span className='download-orbit__core' />
                        </div>
                        <h3>Generating Resume PDF</h3>
                        <p>{downloadMessages[downloadStep]}</p>
                    </div>
                </div>
            )}

            <div className='interview-layout'>

                {/* ── Left Nav ── */}
                <nav className='interview-nav'>
                    <div className="nav-content">
                        <div className='role-brief'>
                            <p className='role-brief__role'>{jobMeta.position}</p>
                            <p className='role-brief__meta'>{jobMeta.company}</p>
                            <p className='role-brief__meta'>{jobMeta.location}</p>
                        </div>
                        <p className='interview-nav__label'>Sections</p>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleResumeDownload}
                        className={`button primary-button download-btn ${isDownloading ? 'is-downloading' : ''}`}
                        disabled={isDownloading}
                    >
                        <svg height={"0.8rem"} style={{ marginRight: "0.8rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path></svg>
                        {isDownloading ? 'Generating Resume...' : 'Download Resume'}
                    </button>
                </nav>

                <div className='interview-divider' />

                {/* ── Center Content ── */}
                <main className='interview-content'>
                    <section className='report-overview'>
                        <div className='report-overview__head'>
                            <h1>{formatText(report.title || 'Interview Performance Report')}</h1>
                            <p>Explore questions, action roadmap, and profile gaps tailored to this interview.</p>
                            <div className='report-overview__meta'>
                                <span>{jobMeta.position}</span>
                                <span>{jobMeta.experience}</span>
                                <span>{jobMeta.jobType}</span>
                                <span>{jobMeta.location}</span>
                            </div>
                        </div>
                        <div className='report-overview__cards'>
                            <article>
                                <span>Technical</span>
                                <strong>{technicalCount}</strong>
                            </article>
                            <article>
                                <span>Behavioral</span>
                                <strong>{behavioralCount}</strong>
                            </article>
                            <article>
                                <span>Roadmap Days</span>
                                <strong>{roadmapDays}</strong>
                            </article>
                            <article>
                                <span>High Risk Gaps</span>
                                <strong>{highSeverityGaps}</strong>
                            </article>
                        </div>
                        {downloadNotice && <p className='download-notice'>{downloadNotice}</p>}
                    </section>

                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <h2>Technical Questions</h2>
                                <span className='content-header__count'>{technicalCount} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.technicalQuestions?.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <h2>Behavioral Questions</h2>
                                <span className='content-header__count'>{behavioralCount} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.behavioralQuestions?.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <h2>Preparation Road Map</h2>
                                <span className='content-header__count'>{roadmapDays}-day plan</span>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan?.map((day) => (
                                    <RoadMapDay key={day.day} day={day} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <div className='interview-divider' />

                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar'>

                    {/* Match Score */}
                    <div className='match-score'>
                        <p className='match-score__label'>Match Score</p>
                        <div className={`match-score__ring ${scoreColor}`}>
                            <span className='match-score__value'>{report.matchScore}</span>
                            <span className='match-score__pct'>%</span>
                        </div>
                        <p className='match-score__sub'>{formatText(report.title || 'Strong match for this role')}</p>
                    </div>

                    <div className='sidebar-divider' />

                    <div className='job-snapshot'>
                        <p className='job-snapshot__label'>Job Snapshot</p>
                        <ul>
                            <li><strong>Role:</strong> {jobMeta.position}</li>
                            <li><strong>Company:</strong> {jobMeta.company}</li>
                            <li><strong>Experience:</strong> {jobMeta.experience}</li>
                            <li><strong>Type:</strong> {jobMeta.jobType}</li>
                        </ul>
                    </div>

                    <div className='sidebar-divider' />

                    {/* Skill Gaps */}
                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Skill Gaps</p>
                        <div className='gap-summary'>
                            <span>Total: {normalizedSkillGaps.length}</span>
                            <span>High: {highSeverityGaps}</span>
                            <span>Medium: {mediumSeverityGaps}</span>
                            <span>Low: {lowSeverityGaps}</span>
                        </div>
                        <div className='skill-gaps__list'>
                            {normalizedSkillGaps.map((gap, i) => (
                                <article key={`${gap.severity}-${i}`} className='skill-gap-item'>
                                    <span className={`skill-gap-item__severity skill-gap-item__severity--${gap.severity}`}>
                                        {gap.severity}
                                    </span>
                                    <span className='skill-gap-item__skill'>{gap.skill}</span>
                                </article>
                            ))}
                        </div>
                    </div>

                </aside>
            </div>
            <button
                type='button'
                className='back-home-floating'
                onClick={() => navigate('/')}
                aria-label='Back to home'
            >
                Back to Home
            </button>
        </div>
    )
}

export default Interview