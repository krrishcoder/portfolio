export type DiagramNodeKind =
  | 'edge-net'
  | 'compute'
  | 'store'
  | 'vector'
  | 'cache'
  | 'external'
  | 'llm'
  | 'client'
  | 'queue';

export type DiagramNode = {
  id: string;
  label: string;
  sub?: string;
  kind: DiagramNodeKind;
  col: number;
  row: number;
  detail?: string;
};

export type DiagramEdge = {
  from: string;
  to: string;
  /**
   * Keep to 12 characters or fewer. Labels for left-to-right hops are chipped
   * into the gap between two columns, which is only 42px wide, so anything
   * longer starts covering the node boxes on either side.
   */
  label?: string;
  dashed?: boolean;
};

export type Diagram = {
  id: string;
  title: string;
  caption: string;
  cols: number;
  rows: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

const futurexAws: Diagram = {
  id: 'futurex-aws',
  title: 'FutureX on AWS',
  caption:
    'A request enters from the internet, terminates at a public load balancer, and reaches compute and storage that never leave private subnets.',
  cols: 5,
  rows: 5,
  nodes: [
    {
      id: 'client',
      label: 'Internet client',
      sub: 'browser or API call',
      kind: 'client',
      col: 0,
      row: 2,
      detail:
        'Any public caller hitting the documented API surface; nothing else can reach the application tier directly.',
    },
    {
      id: 'alb',
      label: 'Application LB',
      sub: 'internet facing',
      kind: 'edge-net',
      col: 1,
      row: 2,
      detail:
        'Internet-facing load balancer with nodes in two public subnets, forwarding to a target group on HTTP 7860.',
    },
    {
      id: 'asg',
      label: 'EC2 Auto Scaling',
      sub: 'min 1, max 3',
      kind: 'compute',
      col: 2,
      row: 2,
      detail:
        'Stateless FastAPI containers in private subnets, replaced by instance refresh on deploy rather than patched in place.',
    },
    {
      id: 'neon',
      label: 'Neon PostgreSQL',
      sub: 'managed, serverless',
      kind: 'external',
      col: 4,
      row: 0,
      detail:
        'Holds both workflows in separate table namespaces on one engine, including conversation and transcript state.',
    },
    {
      id: 'upstash',
      label: 'Upstash Redis',
      sub: 'optional by design',
      kind: 'cache',
      col: 4,
      row: 1,
      detail:
        'Rate limiting and history caching; when it is unreachable the app falls back to PostgreSQL instead of failing.',
    },
    {
      id: 'qdrant-nlb',
      label: 'Qdrant NLB',
      sub: 'TCP 6333',
      kind: 'edge-net',
      col: 3,
      row: 2,
      detail:
        'Internal network load balancer so the app tier addresses a stable endpoint instead of a private instance IP.',
    },
    {
      id: 'qdrant',
      label: 'Qdrant EC2',
      sub: 'private subnet, EBS',
      kind: 'vector',
      col: 4,
      row: 2,
      detail:
        'Collections are created with on-disk vectors so only the HNSW graph stays resident in memory.',
    },
    {
      id: 'aurora',
      label: 'Aurora Serverless',
      sub: 'planned, via RDS Proxy',
      kind: 'store',
      col: 4,
      row: 3,
      detail:
        'Planned migration target for PostgreSQL, kept private and fronted by RDS Proxy for connection pooling.',
    },
    {
      id: 'elasticache',
      label: 'ElastiCache Redis',
      sub: 'planned, private',
      kind: 'cache',
      col: 4,
      row: 4,
      detail:
        'Planned replacement for the hosted cache so no cache traffic crosses the public internet.',
    },
  ],
  edges: [
    { from: 'client', to: 'alb', label: 'HTTP 80' },
    { from: 'alb', to: 'asg', label: 'HTTP 7860' },
    { from: 'asg', to: 'neon', label: '5432' },
    { from: 'asg', to: 'upstash', label: '6379' },
    { from: 'asg', to: 'qdrant-nlb', label: 'TCP 6333' },
    { from: 'qdrant-nlb', to: 'qdrant', label: 'TCP 6333' },
    { from: 'asg', to: 'aurora', label: '5432', dashed: true },
    { from: 'asg', to: 'elasticache', label: '6379', dashed: true },
  ],
};

const kisanRetrieval: Diagram = {
  id: 'kisan-retrieval',
  title: 'Kisan Mitra retrieval path',
  caption:
    'How one farmer question in Hindi or English becomes an answer grounded in maize manuals rather than model memory.',
  cols: 6,
  rows: 5,
  nodes: [
    {
      id: 'question',
      label: 'Farmer question',
      sub: 'Hindi or English',
      kind: 'client',
      col: 0,
      row: 2,
      detail: 'Arrives as text from chat or as audio that speech-to-text has already transcribed.',
    },
    {
      id: 'safety',
      label: 'Safety gate',
      sub: 'runs before the agent',
      kind: 'compute',
      col: 1,
      row: 2,
      detail: 'A classifier node placed ahead of the agent and configured fail-closed, so an unclear verdict blocks.',
    },
    {
      id: 'agent',
      label: 'LangGraph agent',
      sub: 'tool-calling loop',
      kind: 'compute',
      col: 2,
      row: 2,
      detail: 'Decides which tools to call, and asks for a sowing date when the answer depends on crop stage.',
    },
    {
      id: 'dense',
      label: 'Qdrant dense search',
      sub: 'top k 8',
      kind: 'vector',
      col: 3,
      row: 1,
      detail: 'Semantic matches over five maize manuals chunked at 260 words and embedded with all-MiniLM-L6-v2.',
    },
    {
      id: 'bm25',
      label: 'BM25 lexical',
      sub: 'top k 6',
      kind: 'compute',
      col: 3,
      row: 3,
      detail: 'Keeps exact agronomy terms and product names findable when the embedding misses them.',
    },
    {
      id: 'merged',
      label: 'Merged context',
      sub: 'dense plus lexical',
      kind: 'compute',
      col: 4,
      row: 2,
      detail: 'The two result sets are combined into one passage set that the answer must be written from.',
    },
    {
      id: 'llm',
      label: 'OpenAI',
      sub: 'writes the advisory',
      kind: 'llm',
      col: 5,
      row: 2,
      detail: 'Phrases the guidance using only the merged passages, weather and the resolved crop stage.',
    },
    {
      id: 'weather',
      label: 'Open-Meteo weather',
      sub: 'agent tool',
      kind: 'external',
      col: 2,
      row: 0,
      detail: 'Forecast lookup that turns generic guidance into advice tied to the coming days.',
    },
    {
      id: 'postgres',
      label: 'PostgreSQL',
      sub: 'profile and state',
      kind: 'store',
      col: 1,
      row: 4,
      detail: 'Persists the sowing date on the user profile so the crop stage is derivable on later turns.',
    },
    {
      id: 'redis',
      label: 'Redis chat cache',
      sub: 'active sessions',
      kind: 'cache',
      col: 2,
      row: 4,
      detail: 'Holds the live conversation state so multi-turn advisory does not re-read history from disk.',
    },
  ],
  edges: [
    { from: 'question', to: 'safety' },
    { from: 'safety', to: 'agent', label: 'allowed' },
    { from: 'agent', to: 'dense', label: 'retrieve' },
    { from: 'agent', to: 'bm25', label: 'retrieve' },
    { from: 'dense', to: 'merged' },
    { from: 'bm25', to: 'merged' },
    { from: 'merged', to: 'llm', label: 'grounding' },
    { from: 'agent', to: 'weather', label: 'tool call' },
    { from: 'agent', to: 'postgres', label: 'sowing date' },
    { from: 'agent', to: 'redis', label: 'chat state' },
    { from: 'llm', to: 'question', label: 'answer' },
  ],
};

const voicePipeline: Diagram = {
  id: 'voice-pipeline',
  title: 'Live call audio path',
  caption:
    'The round trip a single spoken sentence makes, from caller audio on the phone network back to a spoken reply.',
  cols: 5,
  rows: 3,
  nodes: [
    {
      id: 'caller',
      label: 'Caller',
      sub: 'phone line',
      kind: 'client',
      col: 0,
      row: 1,
      detail: 'A live inbound call; the same WebSocket endpoint also accepts a browser test client for development.',
    },
    {
      id: 'stream',
      label: 'Media stream',
      sub: 'audio/x-l16 16 kHz',
      kind: 'edge-net',
      col: 1,
      row: 0,
      detail: 'Telephony XML opens a realtime bidirectional stream; mulaw at 8 kHz is accepted in 20 ms frames too.',
    },
    {
      id: 'pipecat',
      label: 'Pipecat',
      sub: 'frame pipeline',
      kind: 'compute',
      col: 2,
      row: 0,
      detail: 'Moves audio frames between transports and services, and owns the ordering of the whole pipeline.',
    },
    {
      id: 'vad',
      label: 'Silero VAD',
      sub: 'local, not provider',
      kind: 'compute',
      col: 2,
      row: 1,
      detail: 'Local voice activity detection decides when to flush audio, instead of trusting provider VAD signals.',
    },
    {
      id: 'stt',
      label: 'Sarvam saaras:v3',
      sub: 'speech to text',
      kind: 'external',
      col: 3,
      row: 0,
      detail: 'Emits interim and final transcripts, both printed live so a call can be followed while it happens.',
    },
    {
      id: 'llm',
      label: 'OpenAI',
      sub: 'reply wording',
      kind: 'llm',
      col: 4,
      row: 1,
      detail: 'All wording comes from here, so the system prompt asks for concise Hinglish in Roman script.',
    },
    {
      id: 'tts',
      label: 'Sarvam bulbul:v3',
      sub: 'text to speech',
      kind: 'external',
      col: 3,
      row: 2,
      detail: 'Streaming linear16 synthesis; the live socket rejects a min buffer size field, so the app omits it.',
    },
    {
      id: 'playback',
      label: 'Audio playback',
      sub: 'playAudio frames',
      kind: 'edge-net',
      col: 1,
      row: 2,
      detail: 'Synthesized audio is pushed back down the same open stream rather than played from a hosted file.',
    },
  ],
  edges: [
    { from: 'caller', to: 'stream', label: 'speech' },
    { from: 'stream', to: 'pipecat', label: 'media frames' },
    { from: 'vad', to: 'pipecat', label: 'speech boundary', dashed: true },
    { from: 'pipecat', to: 'stt', label: 'flush audio' },
    { from: 'stt', to: 'llm', label: 'transcript' },
    { from: 'llm', to: 'tts', label: 'reply text' },
    { from: 'tts', to: 'playback', label: 'linear16' },
    { from: 'playback', to: 'caller', label: 'spoken reply' },
  ],
};

const invoicelyOauth: Diagram = {
  id: 'invoicely-oauth',
  title: 'Connector authorization',
  caption:
    "How Claude earns permission to act on one organization's invoicing account, with the MCP server as the authorization server.",
  cols: 4,
  rows: 2,
  nodes: [
    {
      id: 'claude',
      label: 'Claude client',
      sub: 'remote connector',
      kind: 'client',
      col: 0,
      row: 0,
      detail: 'Connects with no credentials the first time, then repeats the call once it holds a bearer token.',
    },
    {
      id: 'mcp',
      label: 'MCP server',
      sub: 'Streamable HTTP',
      kind: 'compute',
      col: 1,
      row: 0,
      detail: 'Serves 41 tools over Streamable HTTP for remote use and over stdio for local Claude Desktop work.',
    },
    {
      id: 'challenge',
      label: '401 and metadata',
      sub: 'protected resource',
      kind: 'edge-net',
      col: 2,
      row: 0,
      detail: 'The unauthorized response advertises where the authorization server metadata can be found.',
    },
    {
      id: 'dcr',
      label: 'Client registration',
      sub: 'dynamic, PKCE S256',
      kind: 'compute',
      col: 3,
      row: 0,
      detail: 'Claude registers itself as a client at runtime, so no client id is configured by hand.',
    },
    {
      id: 'login',
      label: 'Verification login',
      sub: 'code pasted by user',
      kind: 'compute',
      col: 3,
      row: 1,
      detail: 'The server hosts its own login page where the user pastes a verification code to prove account access.',
    },
    {
      id: 'backend',
      label: 'Invoicely backend',
      sub: 'identity and org',
      kind: 'external',
      col: 2,
      row: 1,
      detail: 'Exchanges the verification code for user identity, organization id and a backend access token.',
    },
    {
      id: 'store',
      label: 'PostgreSQL OAuth',
      sub: 'durable across restarts',
      kind: 'store',
      col: 1,
      row: 1,
      detail: 'Registrations, codes and refresh tokens live in a table with an expiry index, not in process memory.',
    },
    {
      id: 'tokens',
      label: 'Access and refresh',
      sub: '1 hour and 30 days',
      kind: 'queue',
      col: 0,
      row: 1,
      detail: 'Tool calls carry the MCP token while backend calls carry the stored backend token, keeping calls org-scoped.',
    },
  ],
  edges: [
    { from: 'claude', to: 'mcp', label: 'connect' },
    { from: 'mcp', to: 'challenge', label: 'no token' },
    { from: 'challenge', to: 'dcr', label: 'discovery' },
    { from: 'dcr', to: 'login', label: 'authorize' },
    { from: 'login', to: 'backend', label: 'code' },
    { from: 'backend', to: 'store', label: 'user and org' },
    { from: 'mcp', to: 'store', label: 'durable state', dashed: true },
    { from: 'store', to: 'tokens', label: 'issue' },
    { from: 'tokens', to: 'claude', label: 'bearer token' },
  ],
};

const estateflowTenancy: Diagram = {
  id: 'estateflow-tenancy',
  title: 'One webhook, many agencies',
  caption:
    'Meta posts every WhatsApp number to the same webhook, so the first job is working out which agency this message belongs to.',
  cols: 6,
  rows: 3,
  nodes: [
    {
      id: 'webhook',
      label: 'WhatsApp webhook',
      sub: 'phone number id',
      kind: 'edge-net',
      col: 0,
      row: 1,
      detail: 'A single public callback receives traffic for every tenant, identified only by the phone number id.',
    },
    {
      id: 'orglookup',
      label: 'Organization lookup',
      sub: 'org api settings',
      kind: 'compute',
      col: 1,
      row: 1,
      detail: 'Resolves the organization, its listings and its send token from per-tenant credentials, not a global env file.',
    },
    {
      id: 'agent',
      label: 'LangGraph agent',
      sub: 'intent and filters',
      kind: 'compute',
      col: 2,
      row: 1,
      detail: 'Extracts filters, then is forced to run the property search tool before any reply is drafted.',
    },
    {
      id: 'filters',
      label: 'PostgreSQL filters',
      sub: 'org, beds, budget',
      kind: 'store',
      col: 3,
      row: 0,
      detail: 'Hard filters on organization, availability, bedrooms, rent or sale, budget and amenities.',
    },
    {
      id: 'bm25',
      label: 'BM25 lexical',
      sub: 'typos and phrasing',
      kind: 'compute',
      col: 3,
      row: 1,
      detail: 'Lexical ranking so misspelled locality and project names still match a real listing.',
    },
    {
      id: 'vectors',
      label: 'Qdrant vectors',
      sub: 'hash embeddings',
      kind: 'vector',
      col: 3,
      row: 2,
      detail: 'Hash embeddings avoid an embedding round-trip; the collection reindexes on startup and on every write.',
    },
    {
      id: 'rrf',
      label: 'RRF merge',
      sub: 'ranked cards',
      kind: 'compute',
      col: 4,
      row: 1,
      detail: 'Reciprocal rank fusion combines the three result sets into one ordered set of property cards.',
    },
    {
      id: 'reply',
      label: 'WhatsApp reply',
      sub: 'tool results only',
      kind: 'edge-net',
      col: 5,
      row: 1,
      detail: 'The model writes the message from tool output alone, so it cannot invent a listing that does not exist.',
    },
  ],
  edges: [
    { from: 'webhook', to: 'orglookup', label: 'tenant id' },
    { from: 'orglookup', to: 'agent', label: 'org scope' },
    { from: 'agent', to: 'filters', label: 'hard filters' },
    { from: 'agent', to: 'bm25', label: 'lexical' },
    { from: 'agent', to: 'vectors', label: 'semantic' },
    { from: 'filters', to: 'rrf' },
    { from: 'bm25', to: 'rrf' },
    { from: 'vectors', to: 'rrf' },
    { from: 'rrf', to: 'reply', label: 'cards' },
  ],
};

export const diagrams: Record<string, Diagram> = {
  'futurex-aws': futurexAws,
  'kisan-retrieval': kisanRetrieval,
  'voice-pipeline': voicePipeline,
  'invoicely-oauth': invoicelyOauth,
  'estateflow-tenancy': estateflowTenancy,
};

export function diagramById(id: string): Diagram | undefined {
  return diagrams[id];
}
