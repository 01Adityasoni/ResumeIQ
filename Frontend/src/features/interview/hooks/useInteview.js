import { useContext } from 'react'
import {
    generateInterviewReport,
    getAllInterviewReports,
    getInterviewReportById,
    generateResumePdf,
    deleteInterviewReport
} from '../services/interview.api'
import { InterviewContext } from '../interview.context.jsx'

export const useInterview = () => {
    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error('useInterview must be used within an InterviewProvider')
    }

    const {
        loading,
        setloading: setLoading,
        report,
        setReport,
        reports,
        setReports,
    } = context

    const generateReport = async (jobDesc, selfDesc, resumeFile) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({
                jobDescription: jobDesc,
                selfDescription: selfDesc,
                resumeFile,
            })
            const createdReport = response?.interviewReport ?? null
            setReport(createdReport)
            return createdReport
        } catch (error) {
            console.error('Error generating interview report:', error)
            const message = error?.response?.data?.message || error?.message || 'Failed to generate interview report'
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response?.interviewReport ?? null)
        } catch (error) {
            console.error('Error fetching interview report:', error)
        } finally {
            setLoading(false)
        }
    }

    const getAllReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response?.interviewReports ?? [])
        } catch (error) {
            console.error('Error fetching interview reports:', error)
        } finally {
            setLoading(false)
        }
    }

    const getResumePdf = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewId })
        const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `resume_${interviewId}.pdf`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        } catch (error) {
            console.error('Error generating resume PDF:', error)
            const message = error?.response?.data?.message || error?.message || 'Failed to generate resume PDF'
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const deleteReport = async (interviewId) => {
        setLoading(true)
        try {
            const response = await deleteInterviewReport(interviewId)
            // clear current report if it was the one deleted
            if (report && String(report._id) === String(interviewId)) {
                setReport(null)
            }
            // optimistic local reports update
            setReports((prev = []) => prev.filter((r) => String(r._id) !== String(interviewId)))
            return response
        } catch (error) {
            console.error('Error deleting interview report:', error)
            const message = error?.response?.data?.message || error?.message || 'Failed to delete interview report'
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getAllReports,
        getResumePdf,
        deleteReport,
    }
}
