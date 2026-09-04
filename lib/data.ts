export type ProjectStatus = 'production' | 'building' | 'research' | 'shipped';

export type ProjectFlag = { label: string; value: string };

export type EndpointGroup = {
  group: string;
  routes: { method: string; path: string; note: string }[];
};

export type Project = {
  slug: string;
  index: number;
  name: string;
  tagline: string;
  status: ProjectStatus;
  year: string;
  role: string;
  port?: string;
  region?: string;
  liveUrl?: string;
  repoUrl?: string;
  summary: string[];
  highlights: string[];
  flags: ProjectFlag[];
  stack: string[];
  endpoints?: EndpointGroup[];
  diagramId?: string;
  notes?: string[];
};

export type Experience = {
  company: string;
  role: string;
  start: string;
  end: string;
  location?: string;
  lines: string[];
  stack: string[];
};

export type StackGroup = { key: string; label: string; items: string[] };

export type Education = { year: string; qualification: string; institute: string; score: string };

export type ServiceRow = {
  name: string;
  slug: string;
  port: string;
  status: ProjectStatus;
  runtime: string;
};

export type Metric = { value: number; suffix?: string; prefix?: string; label: string };

export const projects: Project[] = [
  {
    slug: 'futurex-feaser',
    index: 1,
    name: 'FutureX Feaser',
    tagline: 'Two isolated AI workflows, startup feasibility and lecture QA, on one API and database.',
    status: 'production',
    year: '2026',
    role: 'Backend and AI engineering, AWS infrastructure',
    port: '7860',
    region: 'ap-south-1',
    liveUrl: 'http://futurex-public-alb-1328654668.ap-south-1.elb.amazonaws.com/docs',
    diagramId: 'futurex-aws',
    summary: [
      'FutureX Feaser is one FastAPI service that hosts two products which never touch each other. A startup feasibility workflow does AI web research and answers follow-up questions about its own report, and ClassCatchup AI answers questions grounded only in lecture transcripts a user has uploaded. Both live on a shared PostgreSQL engine in separate table namespaces, so the two flows share deployment, migrations and observability without sharing data.',
      'The feasibility path starts as a conversation. A LangGraph agent decides whether an idea is actionable or too vague and replies with a clarifying question instead of guessing; the second call triggers automated web scraping for competitors, market fit and opportunities, and persists a JSON report. Follow-up questions are answered against that saved report plus cached web research in Qdrant, and a rolling summary of the QA history keeps long sessions from overflowing the context window.',
      'The lecture path accepts plain text or WebVTT files, cleans and chunks the transcript, and indexes it into a dedicated Qdrant collection. Chat sessions bind an author id and a transcript id together, so history is multi-tenant and resumable rather than global. Course and instructor metadata can be patched after the fact, and a reprocess route re-indexes the chunks of an existing transcript without asking anyone to upload the file again.',
      'Infrastructure moved off a single EC2 host running Docker Compose. Stateless containers now sit in an Auto Scaling Group across private subnets behind an internet-facing Application Load Balancer, with Qdrant on its own private instance behind an internal network load balancer. Security groups chain in one direction only, from the internet to the load balancer, to the app, to the vector store, and deploys go out through GitHub Actions and Amazon ECR.',
    ],
    highlights: [
      'A single POST /api/chat entrypoint dispatches on payload shape, so one route covers a vague idea, a confirmed idea and a full research run.',
      'AuthorDailyUsage caps full web scrapes per user per day, because scraping is the expensive part of the request.',
      'Qdrant collections are created with on-disk vectors: roughly 153 MB of raw vectors for 100k points at 384 dimensions against about 10 MB of resident index.',
      'Redis is optional by design, so rate limiting falls back to PostgreSQL and history caching is skipped rather than the request failing.',
      'A cron sidecar gzips full-node Qdrant snapshots to Google Cloud Storage, paired with a restore script for the whole storage state.',
      'GitHub Actions builds the image, validates the compose config, smoke-tests a container on 7860, pushes to ECR tagged with latest and the commit SHA, then can trigger an instance refresh.',
    ],
    flags: [
      { label: 'Compute', value: 'EC2 Auto Scaling Group, min 1 max 3' },
      { label: 'Vector store', value: 'Qdrant on private EC2, on-disk vectors' },
      { label: 'Ingress', value: 'Application Load Balancer, HTTP 7860' },
      { label: 'Data', value: 'Neon PostgreSQL, Upstash Redis' },
      { label: 'Telemetry', value: 'Axiom on scraping and retrieval' },
    ],
    stack: [
      'FastAPI',
      'LangGraph',
      'OpenAI',
      'Qdrant',
      'PostgreSQL (Neon)',
      'Redis (Upstash)',
      'Alembic',
      'Docker',
      'Amazon ECR',
      'EC2 Auto Scaling',
      'Application Load Balancer',
      'GitHub Actions',
      'Axiom',
      'FastEmbed',
    ],
    endpoints: [
      {
        group: 'Feasibility',
        routes: [
          { method: 'POST', path: '/api/chat', note: 'Shared entrypoint that dispatches on payload shape' },
          { method: 'POST', path: '/api/qa', note: 'Follow-up questions against the saved report' },
          { method: 'GET', path: '/api/score/{conversation_id}', note: 'Feasibility score for a conversation' },
          { method: 'GET', path: '/api/history', note: 'Conversation list for an author_id' },
          { method: 'GET', path: '/api/history/{conversation_id}', note: 'Full history for one conversation' },
          { method: 'GET', path: '/api/qa/graph', note: 'Mermaid chart of the LangGraph QA architecture' },
        ],
      },
      {
        group: 'Transcripts',
        routes: [
          { method: 'POST', path: '/api/upload', note: 'Upload a .txt or .vtt lecture transcript' },
          { method: 'GET', path: '/api/sessions', note: 'Chat sessions for an author_id' },
          { method: 'GET', path: '/api/transcripts', note: 'Indexed transcripts available to query' },
          { method: 'PATCH', path: '/api/transcripts/{transcript_id}', note: 'Update course and instructor metadata' },
          {
            method: 'POST',
            path: '/api/transcripts/{transcript_id}/reprocess',
            note: 'Re-index chunks without re-upload',
          },
        ],
      },
      {
        group: 'System',
        routes: [{ method: 'GET', path: '/', note: 'Health check used by the target group' }],
      },
    ],
    notes: [
      'Both workflows share one PostgreSQL engine under separate table namespaces, which keeps a single migration history.',
      'If Redis and PostgreSQL are both unreachable the rate limiter allows the request with a warning, since per-process memory would be wrong behind an Auto Scaling Group.',
      'Planned next: Aurora PostgreSQL Serverless v2 behind RDS Proxy, private ElastiCache Redis, and HTTPS through Route 53 and ACM.',
    ],
  },
  {
    slug: 'kisan-mitra',
    index: 2,
    name: 'Kisan Mitra',
    tagline: 'Maize advisory backend with hybrid retrieval, weather tools and Hindi speech.',
    status: 'production',
    year: '2026',
    role: 'Backend and AI engineering',
    port: '8000',
    diagramId: 'kisan-retrieval',
    summary: [
      'Kisan Mitra is an advisory backend for maize growers that takes questions in Hindi or English and answers them from five maize manuals rather than from model memory. A FastAPI service fronts a LangGraph agent with tool-calling loops, hybrid Qdrant and BM25 retrieval, PostgreSQL persistence, Redis-cached chat state, Open-Meteo weather lookup, and Sarvam speech-to-text and text-to-speech so a farmer can speak instead of type.',
      'Two product flows sit on the same retrieval core. Direct advisory generates guidance from a sowing date, the weather forecast and retrieved context in one shot. Conversational advisory is multi-turn with memory, a safety classifier that runs before the agent, tool use, sowing-date capture and maize FAQ routing. Retrieval merges eight dense results from Qdrant with six lexical BM25 results over markdown chunked at 260 words.',
      'The interesting part is stage awareness. When an answer depends on where the crop is in its cycle, the agent asks for the sowing date, persists it to the user profile, derives the crop stage from it, then resumes the original question instead of restarting the conversation. Agent tools cover weather, datetime, web search, document retrieval, a horticulture catalogue and maize FAQ lookup, and every tool call and chat session is logged as JSON.',
    ],
    highlights: [
      'Hybrid retrieval takes eight dense hits from Qdrant and six lexical hits from BM25, so exact agronomy terms survive alongside semantic matches.',
      'Five collections cover spring corn fertilizers, the maize production manual, pests and diseases, the Uttar Pradesh spring sweet corn package of practices, and a farmer handbook.',
      'A separate maize FAQ collection is built from a stage-aware knowledge tree instead of flat documents.',
      'The safety classifier node runs before the agent and is configured fail-closed, so an unclear verdict blocks the turn.',
      'Sowing date is captured once and stored on the user profile, so later turns derive the crop stage without asking again.',
      'Sarvam speech-to-text and text-to-speech endpoints let the same advisory answer a spoken Hindi question.',
    ],
    flags: [
      { label: 'Retrieval', value: 'Qdrant top 8 dense plus BM25 top 6' },
      { label: 'Corpus', value: 'Five maize manuals, 260-word chunks' },
      { label: 'Embeddings', value: 'all-MiniLM-L6-v2' },
      { label: 'Languages', value: 'Hindi and English, speech and text' },
      { label: 'Safety', value: 'Pre-agent classifier, fail-closed' },
    ],
    stack: [
      'FastAPI',
      'LangGraph',
      'OpenAI',
      'Qdrant',
      'BM25',
      'Sentence Transformers',
      'PostgreSQL',
      'SQLAlchemy',
      'Redis',
      'Open-Meteo',
      'Sarvam AI',
      'Docker',
    ],
    endpoints: [
      {
        group: 'Advisory',
        routes: [
          { method: 'POST', path: '/api/advisory', note: 'Guidance from sowing date, weather and context' },
          { method: 'POST', path: '/api/advisory/predefined', note: 'Advisory for a predefined prompt' },
          { method: 'GET', path: '/api/questions', note: 'Predefined prompts offered to the farmer' },
        ],
      },
      {
        group: 'Chat',
        routes: [
          { method: 'POST', path: '/api/chat', note: 'Multi-turn agent with memory and tools' },
          { method: 'GET', path: '/api/profile/{user_id}', note: 'Stored profile including sowing date' },
        ],
      },
      {
        group: 'Speech',
        routes: [
          { method: 'POST', path: '/api/stt', note: 'Sarvam speech to text for spoken questions' },
          { method: 'POST', path: '/api/tts', note: 'Sarvam text to speech for spoken answers' },
        ],
      },
      {
        group: 'System',
        routes: [
          { method: 'GET', path: '/', note: 'Root check' },
          { method: 'GET', path: '/api/health', note: 'Retrieval health across collections' },
        ],
      },
    ],
    notes: [
      'Two persistence layers currently run in parallel: async SQLAlchemy models and repositories for the advisory endpoints, and a separate pipeline database layer for chat profile and conversation state.',
      'Stage-dependent questions pause for a sowing date and then resume the original intent, which avoids losing the turn the farmer actually asked about.',
    ],
  },
  {
    slug: 'voice-agent',
    index: 3,
    name: 'Realtime Voice Agent',
    tagline: 'Answers live phone calls and holds a spoken conversation in Hinglish.',
    status: 'production',
    year: '2026',
    role: 'Backend and realtime audio engineering',
    port: '8000',
    diagramId: 'voice-pipeline',
    summary: [
      'A call arrives and this service answers it. The answer webhook returns telephony XML that opens a realtime bidirectional WebSocket stream, caller audio flows into a Pipecat pipeline, Sarvam saaras:v3 transcribes it with interim and final results printed live, OpenAI writes the reply, and Sarvam bulbul:v3 streams the synthesized audio back down the same connection while the caller is still on the line.',
      'Stream format defaults to audio/x-l16 at 16 kHz and also accepts audio/x-mulaw at 8 kHz in 20 ms frames. Speech-to-text flushing is driven by local Silero voice activity detection inside Pipecat rather than provider VAD signals, which keeps turn taking a local decision instead of a provider one. Because all wording comes from the language model and Sarvam only speaks it, the default system prompt asks for concise Hinglish in Roman script for Hindi and English callers.',
      'Development details matter here more than usual. A browser test client streams microphone frames to the same WebSocket endpoint so the whole pipeline can be exercised without placing a call, and it has to be served by the app rather than opened from disk for host detection to work. The live text-to-speech socket rejects a min buffer size field, so the app omits it while still requesting streaming linear16 audio.',
    ],
    highlights: [
      'The answer webhook opens a bidirectional stream, so audio moves over one socket in both directions instead of being fetched.',
      'Interim and final transcripts print live, which makes a call debuggable while it is still happening.',
      'Local Silero VAD decides when to flush audio to speech-to-text, rather than trusting provider turn signals.',
      'Defaults to linear16 at 16 kHz and accepts mulaw at 8 kHz in 20 ms frames, covering both telephony codecs.',
      'A browser test client on the same WebSocket endpoint exercises the full pipeline without placing a real call.',
      'The system prompt asks for concise Hinglish in Roman script, because the model chooses the words and the synthesizer only speaks them.',
    ],
    flags: [
      { label: 'Transport', value: 'Bidirectional WebSocket, 20 ms frames' },
      { label: 'Audio format', value: 'linear16 16 kHz, mulaw 8 kHz' },
      { label: 'Turn taking', value: 'Local Silero VAD, not provider VAD' },
      { label: 'Speech', value: 'saaras:v3 in, bulbul:v3 out' },
      { label: 'Exposure', value: 'Inbound TCP 8000 behind HTTPS tunnel' },
    ],
    stack: [
      'FastAPI',
      'Pipecat',
      'Sarvam saaras:v3',
      'Sarvam bulbul:v3',
      'OpenAI',
      'WebSockets',
      'Silero VAD',
      'Docker Compose',
      'ngrok',
    ],
    endpoints: [
      {
        group: 'Telephony',
        routes: [
          { method: 'POST', path: '/vobiz/answer', note: 'Returns XML opening a bidirectional stream' },
          { method: 'POST', path: '/vobiz/hangup', note: 'Logs the hangup webhook' },
          { method: 'WS', path: '/vobiz/ws', note: 'Realtime audio stream in and out' },
        ],
      },
      {
        group: 'System',
        routes: [
          { method: 'GET', path: '/health', note: 'Liveness check' },
          { method: 'GET', path: '/test', note: 'Browser WebSocket test client' },
        ],
      },
    ],
    notes: [
      'A public base URL is required so the secure WebSocket URL handed to the telephony provider resolves from outside the host.',
      'Deployed with Docker Compose, with inbound TCP 8000 open for the answer and stream endpoints.',
    ],
  },
  {
    slug: 'invoicely-mcp',
    index: 4,
    name: 'Invoicely MCP Server',
    tagline: 'Authenticated MCP server that lets Claude run a real invoicing product.',
    status: 'production',
    year: '2026',
    role: 'Protocol, auth and backend engineering',
    port: '3000',
    liveUrl: 'https://invoicely-mcp-server.onrender.com',
    diagramId: 'invoicely-oauth',
    summary: [
      'An authenticated Model Context Protocol server that lets Claude operate a real invoicing product rather than talk about one. It runs over Streamable HTTP for remote connectors and over stdio for local Claude Desktop development, and exposes 41 tools when every group is enabled: three local utilities plus 38 authenticated backend tools spanning invoices, customers, payments, recurring invoices, an expense ledger, budgets, GSTR-1 reporting, signed storage uploads and system health.',
      'Auth is the substantial part. The MCP server acts as the OAuth 2.0 authorization server for the connector: it returns 401 with protected-resource metadata, Claude discovers the authorization-server metadata and dynamically registers as a client, the user pastes a verification code into the login page the server hosts itself, and the server exchanges that code with the product backend for user identity, an organization id and a backend access token before issuing its own authorization code, access token and refresh token.',
      'OAuth state is durable in PostgreSQL, in a table created automatically with an expiry index, with an in-memory fallback kept for local development only. Without that, a host restart would invalidate client registrations and refresh tokens and every connector would have to authorize again. Tool calls authenticate with the MCP bearer token while backend calls carry the stored backend token, so every request stays scoped to one organization.',
    ],
    highlights: [
      '41 tools on one server: 3 local utilities and 38 authenticated backend tools across invoicing, payments, expenses, budgets and GSTR-1 reporting.',
      'The MCP server is itself the OAuth 2.0 authorization server, so the connector flow needs no third-party identity provider.',
      'PKCE with S256 is supported through the MCP Python SDK auth flow, and an introspection endpoint exposes token introspection.',
      'Token lifetimes are explicit: pending authorization request and authorization code 10 minutes, access token 1 hour, refresh token 30 days.',
      'Tool groups gate read, create, update and delete independently, so a deployment can expose a read-only surface.',
      'Published to the official MCP Registry with public privacy and docs pages for connector review.',
    ],
    flags: [
      { label: 'Tools', value: '41 total, 38 authenticated backend' },
      { label: 'Transports', value: 'Streamable HTTP and stdio' },
      { label: 'Auth', value: 'OAuth 2.0, PKCE S256, dynamic registration' },
      { label: 'OAuth store', value: 'PostgreSQL, durable across restarts' },
      { label: 'Hosting', value: 'Render, HTTP 3000' },
    ],
    stack: [
      'Python',
      'MCP Python SDK',
      'OAuth 2.0',
      'PKCE',
      'Streamable HTTP',
      'stdio transport',
      'httpx',
      'psycopg',
      'PostgreSQL',
      'Render',
    ],
    endpoints: [
      {
        group: 'MCP',
        routes: [
          { method: 'GET', path: '/', note: 'Streamable HTTP transport, 401 without a bearer token' },
        ],
      },
      {
        group: 'OAuth',
        routes: [
          { method: 'GET', path: '/oauth/login', note: 'Verification-code login page' },
          { method: 'POST', path: '/introspect', note: 'Token introspection' },
        ],
      },
      {
        group: 'Public',
        routes: [
          { method: 'GET', path: '/privacy', note: 'Privacy page for connector review' },
          { method: 'GET', path: '/docs', note: 'Connector documentation' },
        ],
      },
    ],
    notes: [
      'The in-memory OAuth fallback is for local development only, since a restart on a hosted platform would drop client registrations and refresh tokens.',
      'Backend calls always carry the organization-scoped token obtained at login, so no tool can read across accounts.',
    ],
  },
  {
    slug: 'estateflow',
    index: 5,
    name: 'EstateFlow',
    tagline: 'Multi-tenant real-estate backend with a WhatsApp sales bot per agency.',
    status: 'building',
    year: '2026',
    role: 'Backend, AI and multi-tenant architecture',
    port: '8000',
    diagramId: 'estateflow-tenancy',
    summary: [
      'A FastAPI and PostgreSQL backend for a real-estate campaign portal and a WhatsApp sales bot, multi-tenant from the first commit rather than retrofitted later. Every broker or agency gets an organization row with a UUID and a unique slug at signup, and properties, contacts, conversations and leads are always filtered by organization id, so one agency never sees the listings of another.',
      'WhatsApp routing is per tenant. One WhatsApp Business phone number id maps to one organization, and since Meta posts every number to the same webhook, the payload phone number id is looked up in an organization API settings table to resolve the organization, its listings and its send token. Credentials live per organization instead of in a global environment file, with the access token masked in API responses and left blank on save so the existing value survives.',
      'Property search is a three-way hybrid. A LangGraph agent extracts intent and filters, then a property search tool is forced to run before any reply: PostgreSQL applies hard filters for organization, availability, bedrooms, rent or sale, budget and amenities, BM25 handles lexical ranking and typos, and Qdrant contributes vector matches using hash embeddings so there is no embedding round-trip. Results merge with reciprocal rank fusion into ranked cards, and the model writes the WhatsApp message only from tool results, so it cannot invent a listing.',
      'Architecture rules are enforced by layout rather than by convention. Routers only validate, authenticate and call services; services own business rules and transactions; repositories own SQL; integrations isolate third parties; WhatsApp is treated as a channel while sales logic lives in the agent package. Temporal handles follow-up workflows. Still in progress: spreadsheet sync is a prototype without OAuth yet.',
    ],
    highlights: [
      'Every table that matters carries an organization id, so tenant isolation is a query-level invariant rather than an application check.',
      'One phone number id resolves one organization, which lets a single Meta webhook serve every agency on the platform.',
      'The property search tool is forced to run before the model replies, so a WhatsApp message can only describe listings that exist.',
      'PostgreSQL hard filters, BM25 lexical ranking and Qdrant vector matches are merged with reciprocal rank fusion.',
      'Hash embeddings remove the embedding round-trip from the search path entirely.',
      'The property collection reindexes on startup if empty and on every property create, update or delete.',
    ],
    flags: [
      { label: 'Tenancy', value: 'Organization UUID and slug per signup' },
      { label: 'Search', value: 'PostgreSQL filters, BM25, Qdrant, RRF' },
      { label: 'Channel', value: 'WhatsApp Cloud API per organization' },
      { label: 'Workflows', value: 'Temporal for follow-ups' },
      { label: 'In progress', value: 'Spreadsheet sync prototype, no OAuth' },
    ],
    stack: [
      'FastAPI',
      'PostgreSQL',
      'SQLAlchemy',
      'LangGraph',
      'Qdrant',
      'BM25',
      'Reciprocal Rank Fusion',
      'WhatsApp Cloud API',
      'Temporal',
      'Docker Compose',
      'JWT',
    ],
    endpoints: [
      {
        group: 'Auth and profile',
        routes: [
          { method: 'POST', path: '/api/v1/auth/register', note: 'Signup, creates the organization row' },
          { method: 'POST', path: '/api/v1/auth/login', note: 'JWT login' },
          { method: 'GET, PUT', path: '/api/v1/profile/api-keys', note: 'Per-organization credentials, token masked' },
        ],
      },
      {
        group: 'Campaigns and contacts',
        routes: [
          { method: 'GET, POST', path: '/api/v1/campaigns', note: 'List and create campaigns' },
          { method: 'POST', path: '/api/v1/campaigns/generate', note: 'Generate campaign copy' },
          { method: 'GET, POST', path: '/api/v1/contacts', note: 'List and create contacts' },
          { method: 'POST', path: '/api/v1/contacts/import', note: 'Bulk contact import' },
        ],
      },
      {
        group: 'Properties and leads',
        routes: [
          { method: 'GET, POST', path: '/api/v1/properties', note: 'Listings, reindexed on every write' },
          { method: 'GET, POST', path: '/api/v1/leads', note: 'Lead capture and review' },
        ],
      },
      {
        group: 'WhatsApp and analytics',
        routes: [
          { method: 'GET, POST', path: '/api/v1/whatsapp/callback', note: 'Shared Meta webhook for every tenant' },
          { method: 'GET', path: '/api/v1/analytics/overview', note: 'Per-organization overview' },
        ],
      },
    ],
    notes: [
      'Access tokens are masked in responses and left blank on save, so editing other settings cannot wipe a working credential.',
      'Sales logic lives in the agent package and WhatsApp is only a channel, so another channel can be added without touching the agent.',
    ],
  },
  {
    slug: 'code-retrieval-extension',
    index: 6,
    name: 'Context-Aware Code Retrieval',
    tagline: 'VS Code extension that finds the functions and classes a question is about.',
    status: 'building',
    year: '2026',
    role: 'Extension and retrieval engineering',
    summary: [
      'A VS Code extension that answers natural-language questions about a codebase and returns the Python functions and classes that actually match, across a whole workspace rather than the open file. Chunks are cut along abstract syntax tree boundaries instead of fixed line windows, so a returned snippet is a complete function or class with its file path and line range rather than an arbitrary slice of text.',
      'The pipeline embeds chunks with FastEmbed and ranks them with NumPy similarity search and top-k selection. Incremental indexing and an embedding cache keep repeat searches fast, so the extension stays usable on a large repository instead of only a demo one. The interface is a chat-style webview plus a QuickPick search, and every result is clickable and jumps straight to the matching line.',
    ],
    highlights: [
      'Chunking follows the abstract syntax tree, so results are whole functions and classes instead of line windows.',
      'FastEmbed handles embeddings and NumPy does the similarity search and top-k selection.',
      'Incremental indexing plus an embedding cache keep repeat searches fast across a whole workspace.',
      'Two surfaces share one pipeline: a chat-style webview and a QuickPick search with clickable navigation.',
      'Every result carries a file path and line range, so a match can be verified rather than trusted.',
    ],
    flags: [
      { label: 'Chunking', value: 'AST boundaries, not line windows' },
      { label: 'Ranking', value: 'NumPy similarity search, top k' },
      { label: 'Covers', value: 'Python functions and classes' },
      { label: 'Surface', value: 'Webview chat and QuickPick search' },
    ],
    stack: ['TypeScript', 'VS Code Extension API', 'Python', 'FastEmbed', 'NumPy', 'AST parsing'],
    notes: [
      'Indexing is incremental and cached, because re-embedding a workspace on every query would make the extension unusable.',
      'AST chunking was chosen over fixed windows so a result can be opened and read as a complete unit.',
    ],
  },
  {
    slug: 'dbdiver',
    index: 7,
    name: 'DBdiver',
    tagline: 'Natural-language analytics over large structured datasets.',
    status: 'shipped',
    year: '2025',
    role: 'Retrieval and backend engineering',
    summary: [
      'DBdiver answers questions about large structured datasets in natural language. Embedding-based semantic search and hybrid retrieval pipelines built on Sentence Transformers and a vector database improved search relevance, entity linking and data interpretation across datasets, so a question about the data resolves to the right tables and entities before any query is written.',
      'Gemini generates the SQL and NoSQL queries from the natural-language request and drafts the analytical write-up that goes with the result, so the output reads as an answer rather than a raw result set. The whole thing ships as containerized Python services on FastAPI and Docker.',
    ],
    highlights: [
      'Hybrid retrieval combines embedding similarity with lexical matching, which lifted relevance over plain semantic search.',
      'Entity linking maps question terms onto real dataset entities, which is what makes a generated query land.',
      'Gemini generates both SQL and NoSQL, so the same question works against different stores.',
      'The analytical write-up is generated alongside the query result rather than left to the reader.',
      'Packaged as containerized FastAPI services so it deploys the same way in every environment.',
    ],
    flags: [
      { label: 'Retrieval', value: 'Semantic plus hybrid pipelines' },
      { label: 'Query generation', value: 'Gemini, SQL and NoSQL' },
      { label: 'Embeddings', value: 'Sentence Transformers' },
      { label: 'Packaging', value: 'FastAPI services in Docker' },
    ],
    stack: ['Python', 'FastAPI', 'Gemini API', 'Sentence Transformers', 'vector search', 'Docker'],
  },
  {
    slug: 'immigrant-attitude-nlp',
    index: 8,
    name: 'Attitude and Hate Detection Against Immigrants',
    tagline: 'Comparative NLP study on attitudes toward immigrants in online comments.',
    status: 'research',
    year: '2025',
    role: 'Research, data curation and modelling',
    summary: [
      'An NLP research study on optimistic versus pessimistic attitudes toward immigrants in online comments. The dataset is over 12,000 comments curated with Python and the YouTube Data API v3 and standard text preprocessing, drawn from more than 98,000 collected records that an xlm-roberta-base language detection stage filtered down to English text before any labelling or modelling.',
      'The study is a comparative analysis across three families of models: classical machine learning with support vector machines and logistic regression on TF-IDF features, deep learning with a one-dimensional convolutional network over GloVe and Word2Vec embeddings, and fine-tuned BERT variants. Class imbalance was the central difficulty throughout, since the two attitude classes are not evenly represented in real comment threads.',
    ],
    highlights: [
      'Over 12,000 comments curated through the YouTube Data API v3 with standard text preprocessing.',
      'An xlm-roberta-base language detection stage filtered English text out of more than 98,000 records.',
      'Classical baselines used support vector machines and logistic regression over TF-IDF features.',
      'The deep learning arm used a one-dimensional convolutional network with GloVe and Word2Vec embeddings.',
      'Fine-tuned BERT variants were compared against both baselines on the same data.',
    ],
    flags: [
      { label: 'Dataset', value: '12,000+ curated comments' },
      { label: 'Filtering', value: 'xlm-roberta-base over 98,000+ records' },
      { label: 'Models compared', value: 'SVM, logistic regression, CNN, BERT' },
      { label: 'Main difficulty', value: 'Class imbalance' },
    ],
    stack: [
      'Python',
      'PyTorch',
      'HuggingFace Transformers',
      'xlm-roberta-base',
      'BERT',
      'scikit-learn',
      'TF-IDF',
      'GloVe',
      'Word2Vec',
      'YouTube Data API v3',
    ],
    notes: [
      'Language detection ran before labelling, because a mixed-language corpus would have made every downstream comparison unreliable.',
    ],
  },
  {
    slug: 'notice-automation',
    index: 9,
    name: 'Notice Automation Platform',
    tagline: 'Web platform that generates official academic notices from dynamic templates.',
    status: 'building',
    year: '2025',
    role: 'Full-stack development, faculty-supervised project',
    summary: [
      'A web platform that automates official notice creation for meetings and events in academic administration, replacing drafting each notice by hand. Dynamic templates and forms auto-populate participant, schedule and venue details, so producing a notice becomes filling in what changes rather than rewriting boilerplate every time.',
      'It was built under the supervision of two faculty members, with accuracy, usability and institutional requirements as the acceptance criteria rather than a feature list. That framing shaped the work: the output has to match what the institution already issues, and someone in an administrative role has to be able to use it without training.',
    ],
    highlights: [
      'Dynamic templates auto-populate participant, schedule and venue details from a single form.',
      'Replaces manual drafting for meeting and event notices in academic administration.',
      'Built under faculty supervision with accuracy, usability and institutional requirements as acceptance criteria.',
      'The generated notice has to match the format the institution already issues, which drove the template design.',
    ],
    flags: [
      { label: 'Domain', value: 'Academic administration notices' },
      { label: 'Approach', value: 'Dynamic templates and forms' },
      { label: 'Acceptance', value: 'Accuracy, usability, institutional rules' },
    ],
    stack: ['Python', 'JavaScript', 'HTML', 'CSS', 'SQL'],
  },
];

export const experience: Experience[] = [
  {
    company: 'Agility AI Pvt Ltd',
    role: 'AI Engineer',
    start: 'Mar 2026',
    end: 'Present',
    lines: [
      'Built and deployed LLM applications, retrieval pipelines and AI agents with LangGraph, Qdrant and OpenAI APIs.',
      'Built a realtime voice AI system on FastAPI, Pipecat and the OpenAI Realtime API with bidirectional audio streaming.',
      'Built a multi-tenant real-estate AI platform and WhatsApp sales bot on FastAPI, PostgreSQL, LangGraph and the WhatsApp Cloud API.',
      'Engineered hybrid property search across PostgreSQL, BM25 and Qdrant so answers stay grounded in real listings.',
      'Designed document ingestion, web search and API integrations for agentic workflows, deployed with Docker, AWS and CI/CD.',
    ],
    stack: [
      'LangGraph',
      'Qdrant',
      'OpenAI',
      'FastAPI',
      'Pipecat',
      'PostgreSQL',
      'BM25',
      'WhatsApp Cloud API',
      'Docker',
      'AWS',
    ],
  },
  {
    company: 'Stirring Minds (FlashSpace)',
    role: 'AI and Automation Intern',
    start: 'Feb 2026',
    end: 'Mar 2026',
    lines: [
      'Built role-based AI agents with LangChain and LangGraph.',
      'Implemented retrieval pipelines on Pinecone for semantic search.',
      'Developed backend systems integrating APIs, SQLite and MongoDB.',
    ],
    stack: ['LangChain', 'LangGraph', 'Pinecone', 'SQLite', 'MongoDB', 'Python'],
  },
];

export const stackGroups: StackGroup[] = [
  {
    key: 'languages',
    label: 'Languages',
    items: ['Python', 'SQL', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'MicroPython'],
  },
  {
    key: 'ai-frameworks',
    label: 'AI frameworks',
    items: [
      'LangGraph',
      'LangChain',
      'LangSmith',
      'MCP',
      'HuggingFace',
      'PyTorch',
      'TensorFlow',
      'scikit-learn',
      'ONNX',
      'Pipecat',
    ],
  },
  {
    key: 'retrieval',
    label: 'Retrieval',
    items: [
      'Qdrant',
      'FAISS',
      'ChromaDB',
      'Pinecone',
      'BM25',
      'FastEmbed',
      'Sentence Transformers',
      'Reciprocal Rank Fusion',
    ],
  },
  {
    key: 'backend',
    label: 'Backend',
    items: ['FastAPI', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLAlchemy', 'Alembic', 'Temporal'],
  },
  {
    key: 'infrastructure',
    label: 'Infrastructure',
    items: [
      'AWS EC2',
      'Application Load Balancer',
      'Auto Scaling',
      'Amazon ECR',
      'VPC',
      'Aurora',
      'ElastiCache',
      'Docker',
      'GitHub Actions',
      'Render',
      'Git',
      'Databricks',
    ],
  },
  {
    key: 'data',
    label: 'Data and tooling',
    items: ['Pandas', 'NumPy', 'Matplotlib', 'OpenCV', 'Boto3', 'Axiom', 'Postman'],
  },
];

export const education: Education[] = [
  {
    year: '2024',
    qualification: 'M.Sc. Computer Science',
    institute: 'Department of Computer Science',
    score: 'CGPA 8.23',
  },
  {
    year: '2021',
    qualification: 'B.Sc. Computer Science',
    institute: 'Keshav Mahavidyalaya, University of Delhi',
    score: 'CGPA 8.90',
  },
  {
    year: '2019',
    qualification: 'Intermediate',
    institute: 'CBSE',
    score: '94.4 percent',
  },
];

export const serviceRegistry: ServiceRow[] = [
  {
    name: 'FutureX Feaser',
    slug: 'futurex-feaser',
    port: '7860',
    status: 'production',
    runtime: 'FastAPI on EC2 ASG',
  },
  { name: 'Kisan Mitra', slug: 'kisan-mitra', port: '8000', status: 'production', runtime: 'FastAPI container' },
  {
    name: 'Realtime Voice Agent',
    slug: 'voice-agent',
    port: '8000',
    status: 'production',
    runtime: 'FastAPI on Docker Compose',
  },
  {
    name: 'Invoicely MCP Server',
    slug: 'invoicely-mcp',
    port: '3000',
    status: 'production',
    runtime: 'Python on Render',
  },
  { name: 'EstateFlow', slug: 'estateflow', port: '8000', status: 'building', runtime: 'FastAPI on Docker Compose' },
];

export const metrics: Metric[] = [
  { value: 41, label: 'tools on one MCP server' },
  { value: 9, label: 'systems shipped' },
  { value: 12000, suffix: '+', label: 'comments curated' },
  { value: 98000, suffix: '+', label: 'records filtered' },
  { value: 5, label: 'retrieval collections' },
];

export const profile = {
  name: 'Krishna Kumar',
  handle: 'krrishcoder',
  degree: 'M.Sc. Computer Science',
  email: 'kk612470@gmail.com',
  phone: '+91 72940 86644',
  github: 'https://github.com/krrishcoder',
  linkedin: 'https://www.linkedin.com/in/krishna-kumar-549894219',
  location: 'India',
  roles: [
    'RAG pipelines',
    'LangGraph agents',
    'MCP servers',
    'realtime voice',
    'multi-tenant backends',
    'hybrid retrieval',
    'AWS auto scaling',
  ],
  intro: [
    'I build AI systems that survive contact with production. Most of my work is retrieval and agents: pipelines that answer from real documents instead of model memory, agents that call real tools and get checked when they do, and the plumbing that keeps both honest under load. The interesting problems are rarely the model. They are what happens when the cache is down, the corpus grows, or two tenants share one webhook.',
    'So I spend as much time on the infrastructure as on the prompt. That means writing the fallback path before the happy path, keeping vectors on disk when memory is the constraint, scoping every query to a tenant, and putting an authorization server in front of a tool surface so it can be trusted with a real account. I would rather ship one system that holds up than five demos that do not.',
  ],
};

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
