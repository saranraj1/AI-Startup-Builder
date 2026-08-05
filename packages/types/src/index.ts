export type ArtifactCategory = 'analysis' | 'research' | 'business' | 'revenue' | 'brand' | 'marketing' | 'product' | 'engineering' | 'ai' | 'legal' | 'investor' | 'docs';
export type GenerationStatus = 'queued' | 'running' | 'completed' | 'failed';
export interface Artifact { id: string; category: ArtifactCategory; title: string; summary: string; content: Record<string, unknown>; confidence: 'estimate' | 'generated' | 'verified'; }
export interface Project { id: string; name: string; idea: string; score: number; status: GenerationStatus; progress: number; artifacts: Artifact[]; createdAt: string; }
