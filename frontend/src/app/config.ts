// const LOCAL_API_URL = 'http://localhost:8080';
 const LOCAL_API_URL = 'https://repost-smudge-unsterile.ngrok-free.dev';
const PRODUCTION_API_URL = 'https://serenity-ai-3.onrender.com';

function getDefaultApiUrl() {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return LOCAL_API_URL;
        }
    }

    return PRODUCTION_API_URL;
}

export const API_ORIGIN = (import.meta.env.VITE_API_URL || getDefaultApiUrl()).replace(/\/$/, '');
