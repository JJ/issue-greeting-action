import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
      const prMessage: string = core.getInput('pr-message');
      // Get client and context
      const client: github.GitHub = new github.GitHub(
	  core.getInput('repo-token', {required: true})
      );
      const context = github.context;

      if (context.payload.action !== 'opened') {
	  console.log('No issue or PR was opened, skipping');
	  return;
      }

      // Do nothing if its not their first contribution
      console.log("Checking if it's the users first contribution");
      if (!context.payload.sender) {
	  throw new Error('Internal error, no sender provided by GitHub');
      }
      const sender: string = context.payload.sender!.login;
      const issue: {owner: string; repo: string; number: number} = context.issue;
      console.log( "Sender " + sender);
      let firstContribution: boolean = await isFirstPull(
          client,
          issue.owner,
          issue.repo,
          sender,
          issue.number
      );

      if (!firstContribution) {
	  console.log('Not the users first contribution');
	  return;
      }

      const message: string = prMessage.replace(/#/, sender);
      console.log('Adding message: ' + message + ' owner ' + context.repo.owner + ' repo ' + context.repo.repo + ' issue repo ' + issue.repo );
      const res = await client.pulls.createReview({
          owner: context.repo.owner,
          repo: context.repo.repo,
          pull_number: issue.number,
          body: message,
          event: 'COMMENT'
      });
      console.log(res);
  } catch (error) {
    core.setFailed(error.message);
    return;
  }
}

// No way to filter pulls by creator
async function isFirstPull(
  client: github.GitHub,
  owner: string,
  repo: string,
  sender: string,
  curPullNumber: number,
  page: number = 1
): Promise<boolean> {
  // Provide console output if we loop for a while.
  console.log('Checking...');
  const {status, data: pulls} = await client.pulls.list({
    owner: owner,
    repo: repo,
    per_page: 100,
    page: page,
    state: 'all'
  });

  if (status !== 200) {
    throw new Error(`Received unexpected API status code ${status}`);
  }

  if (pulls.length === 0) {
    return true;
  }

  for (const pull of pulls) {
    const login: string = pull.user.login;
    if (login === sender && pull.number < curPullNumber) {
      return false;
    }
  }

  return await isFirstPull(
    client,
    owner,
    repo,
    sender,
    curPullNumber,
    page + 1
  );
}

run();
