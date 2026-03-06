import Header from '@/components/Header';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-4xl mx-auto pt-8 px-6 pb-12">
        <h1 className="text-white text-[40px] font-bold mb-2">API Documentation</h1>
        <p className="text-[#8B9DB8] mb-12">Build with Court Hero</p>

        {/* Quick Start */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 mb-8">
          <h2 className="text-white text-[20px] font-bold mb-4">Quick Start</h2>
          <p className="text-[#8B9DB8] mb-4">Base URL:</p>
          <code className="block bg-[#0A0D12] text-[#00F260] px-4 py-3 rounded-lg mb-6 font-mono text-[13px]">
            https://api.courthero.app/v1
          </code>

          <p className="text-[#8B9DB8] mb-2">Authentication:</p>
          <code className="block bg-[#0A0D12] text-[#00F260] px-4 py-3 rounded-lg font-mono text-[13px] mb-6">
            Authorization: Bearer YOUR_API_KEY
          </code>

          <p className="text-[#8B9DB8]">Get your API key from your <a href="/account" className="text-[#00F260] hover:underline">account settings</a></p>
        </div>

        {/* Endpoints */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 mb-8">
          <h2 className="text-white text-[20px] font-bold mb-6">Main Endpoints</h2>
          <div className="space-y-6">
            {[
              {
                method: 'POST',
                path: '/events',
                desc: 'Create a new tournament',
                params: ['name', 'start_date', 'end_date', 'format']
              },
              {
                method: 'GET',
                path: '/events/{eventId}',
                desc: 'Get tournament details',
                params: ['eventId']
              },
              {
                method: 'POST',
                path: '/events/{eventId}/registrations',
                desc: 'Register a player',
                params: ['eventId', 'player_id', 'division_id']
              },
              {
                method: 'POST',
                path: '/matches/{matchId}/score',
                desc: 'Submit match score',
                params: ['matchId', 'team1_score', 'team2_score']
              },
            ].map((endpoint, idx) => (
              <div key={idx} className="border-l-4 border-[#00F260] pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-[11px] font-bold ${
                    endpoint.method === 'POST' ? 'bg-[#00F260]/10 text-[#00F260]' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-white font-mono">{endpoint.path}</code>
                </div>
                <p className="text-[#8B9DB8] text-[13px] mb-2">{endpoint.desc}</p>
                <div className="text-[#64748B] text-[12px]">
                  Parameters: {endpoint.params.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 mb-8">
          <h2 className="text-white text-[20px] font-bold mb-4">Code Examples</h2>
          
          <p className="text-[#8B9DB8] font-bold mb-2">Create an Event:</p>
          <pre className="bg-[#0A0D12] text-[#00F260] px-4 py-4 rounded-lg overflow-x-auto mb-6 font-mono text-[12px]">{`curl -X POST https://api.courthero.app/v1/events \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Summer Championship",
    "start_date": "2026-06-01",
    "end_date": "2026-06-02",
    "format": "double-elim"
  }'`}</pre>

          <p className="text-[#8B9DB8] font-bold mb-2">Submit Match Score:</p>
          <pre className="bg-[#0A0D12] text-[#00F260] px-4 py-4 rounded-lg overflow-x-auto font-mono text-[12px]">{`curl -X POST https://api.courthero.app/v1/matches/match-123/score \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "team1_score": 11,
    "team2_score": 8
  }'`}</pre>
        </div>

        {/* Webhooks */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 mb-8">
          <h2 className="text-white text-[20px] font-bold mb-4">Webhooks</h2>
          <p className="text-[#8B9DB8] mb-4">Subscribe to real-time events:</p>
          <ul className="space-y-2 text-[#8B9DB8] text-[14px]">
            <li>• <code className="text-[#00F260]">match.started</code> - When a match begins</li>
            <li>• <code className="text-[#00F260]">match.completed</code> - When a match finishes</li>
            <li>• <code className="text-[#00F260]">tournament.created</code> - New tournament created</li>
            <li>• <code className="text-[#00F260]">player.registered</code> - Player joins tournament</li>
          </ul>
        </div>

        {/* Support */}
        <div className="bg-[#00F260]/5 border border-[#00F260]/20 rounded-2xl p-8">
          <h2 className="text-white text-[20px] font-bold mb-4">Need Help?</h2>
          <p className="text-[#8B9DB8] mb-4">Questions about the API? We're here to help:</p>
          <div className="flex gap-4">
            <a href="https://docs.courthero.app" className="inline-block text-[#00F260] font-bold hover:underline">
              Full Docs →
            </a>
            <a href="mailto:api@courthero.app" className="inline-block text-[#00F260] font-bold hover:underline">
              API Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
