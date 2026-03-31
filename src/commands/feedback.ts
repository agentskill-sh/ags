import { apiFetch } from '../api.js'
import { detectPlatform } from '../platform.js'

interface FeedbackResponse {
  success: boolean
  averageScore: number
  ratingCount: number
}

export async function feedbackCommand(args: string[]): Promise<void> {
  const jsonFlag = args.includes('--json')
  const filteredArgs = args.filter((a) => !a.startsWith('--'))

  const slug = filteredArgs[0]
  const scoreStr = filteredArgs[1]
  const comment = filteredArgs.slice(2).join(' ') || undefined

  if (!slug || !scoreStr) {
    console.error('Usage: learn-skills feedback <slug> <1-5> [comment]')
    console.error('')
    console.error('Examples:')
    console.error('  learn-skills feedback seo-optimizer 5')
    console.error('  learn-skills feedback @owner/skill 3 "Instructions were unclear"')
    process.exit(1)
  }

  const score = parseInt(scoreStr, 10)
  if (isNaN(score) || score < 1 || score > 5) {
    console.error('Score must be an integer between 1 and 5.')
    process.exit(1)
  }

  // Normalize slug: strip leading @ if present
  const cleanSlug = slug.startsWith('@') ? slug.slice(1) : slug

  const platform = detectPlatform()

  const body: Record<string, unknown> = {
    score,
    platform,
    agentName: 'learn-skills',
    sessionId: `cli-${Date.now()}`,
    autoRated: false,
  }
  if (comment) body.comment = comment

  // If slug contains owner prefix, split it for the API
  const apiSlug = cleanSlug.includes('/') ? cleanSlug.split('/').pop()! : cleanSlug
  const owner = cleanSlug.includes('/') ? cleanSlug.split('/')[0] : undefined
  if (owner) body.owner = owner

  const data = await apiFetch<FeedbackResponse>(
    `/skills/${encodeURIComponent(apiSlug)}/agent-feedback`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )

  if (jsonFlag) {
    console.log(JSON.stringify({
      slug: cleanSlug,
      score,
      comment: comment || null,
      averageScore: data.averageScore,
      ratingCount: data.ratingCount,
    }, null, 2))
    return
  }

  console.log(`\nFeedback submitted for "${cleanSlug}": ${score}/5`)
  if (comment) console.log(`Comment: ${comment}`)
  console.log(`Community average: ${data.averageScore}/5 (${data.ratingCount} ratings)`)
}
