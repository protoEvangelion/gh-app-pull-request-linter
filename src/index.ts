import { PullRequest } from '@octokit/webhooks-types'
import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'
import { Probot } from 'probot'

type CheckOptions = RestEndpointMethodTypes['checks']['create']['parameters']
type PrBody = NonNullable<PullRequest['body']>

/** MAIN PROBOT PROGRAM */

export = (app: Probot) => {
  app.log('The app was loaded: ', new Date())

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
    html_url,
  } = pullRequest

  if (!body) {
    return blockPR(sha, '❌ Pull request body must not be empty.')
  }

  if (requiresQeTeamTesting(body, html_url)) {
    let msg = `
      ${checkJiraSection(body, html_url)}
      ${checkChangelogSection(body, html_url)}
      ${checkTestingSection(body, html_url)}
    `

    return msg.includes('❌') ? blockPR(sha, msg) : passPR(sha, msg)
  }

  return passPR(sha, '✅ Required sections have been correctly completed.')
}

function requiresQeTeamTesting(body: PrBody, url: string): boolean {
  const checkbox =
    body.match(/\[(?<checked>.)\] Requires QE Testing/)?.groups?.checked || ''

  logInfo('Parsed QE checkbox', checkbox, url)

  return checkbox === 'x'
}

function checkJiraSection(body: PrBody, url: string): string {
  const jira =
    body
      .match(/## Jira Ticket\(s\)(?<jira>.*?)<!--/s)
      ?.groups?.jira?.trim?.() || ''

  logInfo('Parsed Jira section', jira, url)

  return jira.length < 3
    ? '❌ Jira ticket must be included if QE testing checkbox is true.'
    : '✅ Jira ticket included.'
}

function logInfo(str: string, variable: string, url: string) {
  console.log(`${str}: -->${variable}<-- (${url})`)
}

function checkChangelogSection(body: PrBody, url: string): string {
  const changelog =
    body
      .match(/## Public Changelog(?<changelog>.*?)## Technical Description/s)
      ?.groups?.changelog?.trim?.() || ''

  logInfo('Parsed changelog section', changelog, url)

  return /\[(FEATURE|ENHANCEMENT|DEPRECATED|REMOVED|BUGFIX|SECURITY|PERFORMANCE|CHORE)\]/.test(
    changelog
  )
    ? '✅ Changelog formatted correctly.'
    : '❌ Changelog must follow format: "[FEATURE] Add github oauth login as a new option for logging in.". See PR body comment for more examples.'
}

function checkTestingSection(body: PrBody, url: string): string {
  const testingInstructions =
    body
      .match(/## Testing Instructions(?<testing>.*?)## Screenshots/s)
      ?.groups?.testing?.trim?.() || ''

  logInfo('Parsed testing section', testingInstructions, url)

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
