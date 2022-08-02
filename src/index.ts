import { Probot } from 'probot'

export = (app: Probot) => {
  app.log('Yay! The app was loaded!')
  app.on('issues.edited', async (context) => {
    console.log('ISSUE PAYLOAD', context.payload)
  })

  app.on('pull_request.closed', async (context) => {
    console.log('PR CLOSED PAYLOAD', context.payload)
  })

  app.on('pull_request.edited', async (context) => {
    console.log('!!!!!!!!!!')

    const { pull_request: pullRequest } = context.payload

    const checkOptions = {
      name: 'Lint Pull Request Description',
      status: 'completed',
      conclusion: 'success',
      started_at: new Date().toISOString(),
      head_branch: '', // workaround for https://github.com/octokit/rest.js/issues/874
      head_sha: pullRequest.head.sha,
      output: {
        title: `title stuff`,
        summary: `summary stuff`,
      },
      // workaround random "Bad Credentials" errors
      // https://github.community/t5/GitHub-API-Development-and/Random-401-errors-after-using-freshly-generated-installation/m-p/22905/highlight/true#M1596
      request: {
        retries: 3,
        retryAfter: 3,
      },
    }

    console.log(checkOptions)

    // const failedOptions = {
    //   status: 'completed',
    //   conclusion: 'failure',
    // }

    // const successOptions = {
    //   status: 'completed',
    //   conclusion: 'success',
    // }

    const res = await context.octokit.checks.create(context.repo(checkOptions))

    console.log(res)

    // const issueComment = context.issue({
    //   body: "Thanks for opening this issue!",
    // });
    // await context.octokit.issues.createComment(issueComment);
  })
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
