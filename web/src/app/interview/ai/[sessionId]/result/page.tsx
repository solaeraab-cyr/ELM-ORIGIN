import { createClient } from '@/lib/supabase/server';
import ResultClient from './ResultClient';

export default async function AiInterviewResultPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const [{ data: scorecard }, { data: turns }, { data: meta }] = await Promise.all([
    supabase.from('interview_scorecards').select('*').eq('session_id', sessionId).maybeSingle(),
    supabase.from('interview_transcripts').select('id, role, content, audio_url, created_at').eq('session_id', sessionId).order('created_at'),
    supabase.from('interview_sessions').select('id, interview_format, prompt, started_at, ended_at').eq('id', sessionId).maybeSingle(),
  ]);
  return (
    <ResultClient
      sessionId={sessionId}
      scorecard={scorecard as unknown as ScorecardRow | null}
      turns={(turns ?? []) as unknown as TurnRow[]}
      meta={meta as unknown as { interview_format: string | null; prompt: string | null; started_at: string | null; ended_at: string | null } | null}
    />
  );
}

export type TurnRow = { id: string; role: 'ai' | 'user'; content: string; audio_url: string | null; created_at: string };
export type ScorecardRow = {
  content_score: number | null;
  communication_score: number | null;
  confidence_score: number | null;
  overall_score: number | null;
  strengths: string[] | null;
  improvements: string[] | null;
  next_steps: string | null;
  share_token: string | null;
};
