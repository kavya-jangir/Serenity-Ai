const DEFAULT_API_URL = 'https://serenity-ai-3.onrender.com';
const API_BASE_URL = `${(import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '')}/api`;

export interface MoodSubmitRequest {
  mood: string;
  notes?: string;
}

export interface MoodRecord {
  id: string;
  mood: string;
  notes?: string;
  timestamp: string;
}

export interface SongRecord {
  id: number;
  title: string;
  emotion: string;
  filePath: string;
  streamUrl: string;
  uploadedAt?: string;
}

export interface SessionStartRequest {
  moodId?: string;
  exerciseType: string;
  totalSteps: number;
}

export interface SessionRecord {
  id: string;
  moodId?: string;
  exerciseType: string;
  totalSteps: number;
  completedSteps: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface StepStartRequest {
  sessionId: string;
  stepNumber: number;
}

export interface StepCompleteRequest {
  sessionId: string;
  stepNumber: number;
}

export interface BreathingCompleteRequest {
  sessionId: string;
  phase: string;
  durationSeconds: number;
}

export interface SessionCompleteRequest {
  sessionId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async submitMood(request: MoodSubmitRequest): Promise<ApiResponse<MoodRecord>> {
    return this.request('/mood', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getSongByEmotion(emotion: string): Promise<ApiResponse<SongRecord>> {
    return this.request(`/songs/emotion/${encodeURIComponent(emotion)}`);
  }

  async startSession(request: SessionStartRequest): Promise<ApiResponse<SessionRecord>> {
    return this.request('/session/start', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async startStep(request: StepStartRequest): Promise<ApiResponse<SessionRecord>> {
    return this.request('/step/start', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async completeStep(request: StepCompleteRequest): Promise<ApiResponse<SessionRecord>> {
    return this.request('/step/complete', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async completeBreathing(request: BreathingCompleteRequest): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request('/breathing/complete', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async completeSession(request: SessionCompleteRequest): Promise<ApiResponse<SessionRecord>> {
    return this.request('/session/complete', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getSession(sessionId: string): Promise<ApiResponse<SessionRecord>> {
    return this.request(`/session/${sessionId}`);
  }

  async health(): Promise<ApiResponse<Record<string, string>>> {
    return this.request('/health');
  }
}

export const api = new ApiClient();
