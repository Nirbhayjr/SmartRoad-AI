const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const endPoints = {
    DEMO_API: BASE_URL + "demo",
    DETECT_IMAGE_API: BASE_URL + "detect/image",
    DETECT_VIDEO_API: BASE_URL + "detect/video",
    HEALTH_API: BASE_URL + "health"
}