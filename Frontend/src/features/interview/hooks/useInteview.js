import { useContext } from 'react'
import {
    generateInterviewReport,
    getAllInterviewReports,
    getInterviewReportById,
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

    const getResumePdf = async () => {
        // Backend does not expose a resume file download endpoint yet.
        return null
    }

    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getAllReports,
        getResumePdf,
    }
}
