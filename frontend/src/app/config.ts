const LOCAL_API_URL = 'http://localhost:8080';
const PRODUCTION_API_URL = 'https://repost-smudge-unsterile.ngrok-free.dev/';

type ViteImportMeta = ImportMeta & {
    env?: {
        VITE_API_URL?: string;
    };
};

const ENV_API_URL = (import.meta as ViteImportMeta).env?.VITE_API_URL?.trim();

function getDefaultApiUrl() {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return LOCAL_API_URL;
        }

        // In deployed environments, prefer configuring VITE_API_URL explicitly.
        if (!ENV_API_URL) {
            console.warn('VITE_API_URL is not set. Falling back to PRODUCTION_API_URL.');
        }
    }

    return PRODUCTION_API_URL;
}

export const API_ORIGIN = (ENV_API_URL || getDefaultApiUrl()).replace(/\/$/, '');
