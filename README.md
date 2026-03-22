# HR Assistant

A chat interface for querying job descriptions and salary information across California county jurisdictions.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file in the root with your Anthropic API key: `ANTHROPIC_API_KEY=your_key_here`
4. Run the development server: `npm run dev`
5. Open http://localhost:3000

## Example Queries

- "What are the knowledge, skills, and abilities for the Assistant Sheriff San Diego County position?"
- "What is the salary for the Assistant Chief Probation Officer in San Bernardino?"
- "Tell me about probation officer roles in Ventura"

## My Approach

For the stack I went with Next.js 14 App Router, TypeScript, Tailwind, and the Anthropic SDK.

For data processing I load job descriptions and salary records from two JSON files and join them on jurisdiction + code. I used a Map keyed by "jurisdiction|code" for O(1) salary lookups instead of nested loops — so as the dataset grows the join stays fast.

The main thing I focused on was filtering before sending anything to the LLM. Every user message gets scored against all job records by counting how many words from the message appear in the job title and jurisdiction. Only the top 5 matches go to Claude. This keeps the prompt small and relevant no matter how big the dataset gets.

For the LLM call I used a Next.js server action. The system prompt adapts based on whether anything matched — if nothing does, Claude tells the user gracefully instead of making something up.

## Scaling Considerations

- `loadJobData()` reads from disk on every request right now. At larger scale I'd cache this on server startup or move to a database with full-text search
- The keyword scoring is simple word matching. At 10-100x data I'd swap this for vector embeddings and semantic similarity
- One data quirk worth noting: job code 0265 has jurisdiction "sdcounty" in job-descriptions.json but "kerncounty" in salaries.json so those records don't join. That's a source data issue not a bug in the code

## Challenges

- Hit a git conflict when initializing the local repo against an existing remote — had to use `--allow-unrelated-histories` to move forward
- Kept getting 401 errors on first test run because I hadn't actually set the API key in `.env.local` — took me a minute to realize that was the issue
- The model that got generated was already deprecated — updated it to `claude-haiku-4-5-20251001`

## What was AI assisted

AI helped with parts of the implementation — the data layer (types, file loading, join logic), the server action (scoring, filtering, prompt building, API call), and the chat UI (state management, form handling). The architecture decisions, filtering approach, how to structure the prompt, and the overall direction were mine. I reviewed and understood everything before committing it.
