import { PullRequest } from '@octokit/webhooks-types'
import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'
import { Probot } from 'probot'

type CheckOptions = RestEndpointMethodTypes['checks']['create']['parameters']
type PrBody = NonNullable<PullRequest['body']>

/** MAIN PROBOT PROGRAM */

export = (app: Probot) => {
  app.log('The app was loaded: ', new Date())

  app.on('issues.edited', async (context) => {
    console.log('ISSUE PAYLOAD', context.payload)
  })

  app.on('pull_request.closed', async (context) => {
    console.log('PR CLOSED PAYLOAD', context.payload)
  })

  app.on('pull_request.edited', async (context) => {
    const { pull_request: pullRequest } = context.payload

    const checkOptions = lintPrBody(pullRequest)

    await context.octokit.checks
      .create(context.repo(checkOptions))
      .then(() => console.log('Check successful: ', checkOptions))
      .catch((e) => console.error('Check failed: ', checkOptions, e))
  })
}

/** CONSTANTS */

const checkOptions: CheckOptions = {
  name: 'Lint PR Description',
  status: 'completed',
  started_at: new Date().toISOString(),
  request: {
    retries: 3,
    retryAfter: 3,
  },
}

/** UTILITY FUNCTIONS */

function lintPrBody(pullRequest: PullRequest) {
  const {
    body,
    head: { sha },
  } = pullRequest

  if (!body) {
    return blockPR(sha, '❌ Pull request body must not be empty.')
  }

  if (requiresQeTeamTesting(body)) {
    let msg = `
      ${checkJiraSection(body)}
      ${checkChangelogSection(body)}
      ${checkTestingSection(body)}
    `

    return msg.includes('❌') ? blockPR(sha, msg) : passPR(sha, msg)
  }

  return passPR(sha, '✅ Required sections have been correctly completed.')
}

function requiresQeTeamTesting(body: PrBody): boolean {
  return (
    body.match(/\[(?<checked>.)\] Requires QE Testing/)?.groups?.checked === 'x'
  )
}

function checkJiraSection(body: PrBody): string {
  const jira =
    body
      .match(/## Jira Ticket\(s\)(?<jira>.*?)<!--/s)
      ?.groups?.jira?.trim?.() || ''

  return jira.length < 3
    ? '❌ Jira ticket must be included if QE testing checkbox is true.'
    : '✅ Jira ticket included.'
}

function checkChangelogSection(body: PrBody): string {
  const changelog =
    body
      .match(/## Public Changelog(?<changelog>.*?)## Technical Description/s)
      ?.groups?.changelog?.trim?.() || ''

  return /\[(FEATURE|ENHANCEMENT|DEPRECATED|REMOVED|BUGFIX|SECURITY|PERFORMANCE|CHORE)\]/.test(
    changelog
  )
    ? '✅ Changelog formatted correctly.'
    : '❌ Changelog must follow format: "[FEATURE] Add github oauth login as a new option for logging in.". See PR body comment for more examples.'
}

function checkTestingSection(body: PrBody): string {
  const testingInstructions =
    body
      .match(/## Testing Instructions(?<testing>.*?)## Screenshots/s)
      ?.groups?.testing?.trim?.() || ''

  return testingInstructions.length
    ? '✅ Testing instructions filled out.'
    : '❌ Testing instructions must be filled out if QE testing checkbox is true.'
}

function blockPR(sha: string, msg: string): CheckOptions {
  return {
    ...checkOptions,
    conclusion: 'failure',
    head_sha: sha,
    output: {
      title: 'Failed',
      summary: msg,
    },
  }
}

function passPR(sha: string, msg: string): CheckOptions {
  return {
    ...checkOptions,
    conclusion: 'success',
    head_sha: sha,
    output: {
      title: 'Success',
      summary: msg,
    },
  }
}
