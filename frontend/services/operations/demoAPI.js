import { endPoints } from "../apis"
import apiConnector from "../apiConnector"

// Fetch demo data from backend
export const fetchDemoData = () => {
    return async () => {
        try {
            const response = await apiConnector("GET", endPoints.DEMO_API, null)
            if (!response.data.success) throw new Error(response.data.message)
            return response.data
        } catch (error) {
            console.error("Demo API Error:", error.message)
            throw error
        }
    }
}

// Detect potholes from image
export const detectPotsholesImage = (formData) => {
    return async () => {
        try {
            const response = await apiConnector(
                "POST",
                endPoints.DETECT_IMAGE_API,
                formData,
                { "Content-Type": "multipart/form-data" }
            )
            if (!response.data.success) throw new Error(response.data.message)
            return response.data
        } catch (error) {
            console.error("Image Detection Error:", error.message)
            throw error
        }
    }
}

// Detect potholes from video
export const detectPotsholesVideo = (formData) => {
    return async () => {
        try {
            const response = await apiConnector(
                "POST",
                endPoints.DETECT_VIDEO_API,
                formData,
                { "Content-Type": "multipart/form-data" }
            )
            if (!response.data.success) throw new Error(response.data.message)
            return response.data
        } catch (error) {
            console.error("Video Detection Error:", error.message)
            throw error
        }
    }
}

export default fetchDemoData