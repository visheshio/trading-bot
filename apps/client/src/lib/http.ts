
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:3000';
const TOKEN_KEY = 'auth_token';

export type IdResponse = { id: string };
export type SigninResponse = { id: string; token: string };

export type WorkflowNode = {
    nodeId: string;
    data: { kind: 'ACTION' | 'TRIGGER'; metadata: any };
    credentials?: any;
    id: string;
    position: { x: number; y: number };
    type?: string;
};

export type WorkflowEdge = {
    id: string;
    source: string;
    target: string;
};

export type Workflow = {
    _id: string;
    userid: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
};

export function setAuthToken(token: string | null) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any)['Authorization'] = token;
    }
    return config;
});
api.interceptors.response.use(
    (response) => {

        return response;
    },
    (error) => {

        if (error.response && error.response.data && error.response.data.message) {

            return Promise.reject(new Error(error.response.data.message));
        }
        return Promise.reject(error);
    }
);

export async function apiSignup(body: { username: string; password: string }): Promise<SigninResponse> {
    const res = await api.post<SigninResponse>('/signup', body);
    setAuthToken(res.data.token);
    return res.data;
}

export async function apiSignin(body: { username: string; password: string }): Promise<SigninResponse> {
    const res = await api.post<SigninResponse>('/signin', body);
    setAuthToken(res.data.token);
    return res.data;
}

export async function apiCreateWorkflow(body: any): Promise<IdResponse> {
    const res = await api.post<IdResponse>('/workflow', body);
    return res.data;
}

export async function apiUpdateWorkflow(workflowId: string, body: any): Promise<IdResponse> {
    const res = await api.put<IdResponse>(`/workflow/${workflowId}`, body);
    return res.data;
}

export async function apiGetWorkflow(workflowId: string): Promise<Workflow> {
    const res = await api.get<Workflow>(`/workflow/${workflowId}`);
    return res.data;
}

export async function apiListWorkflows(): Promise<Workflow[]> {
    const res = await api.get<Workflow[]>(`/workflows`);
    return res.data;
}

export async function apiListExecution(workflowId: string): Promise<any[]> {
    const res = await api.get<any[]>(`/workflow/executions/${workflowId}`);
    return res.data;
}

export async function apiListNodes(): Promise<any[]> {
    const res = await api.get<any[]>(`/nodes`);
    return res.data;
}