import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
      const greeting: string = core.getInput('greeting');
      // Get client and context
      const client: github.GitHub = new github.GitHub(
	  core.getInput('repo-token', {required: true})
      );
      const context = github.context;

      if (context.payload.action !== 'opened') {
	  console.log('No issue was opened, skipping');
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
      let firstContribution: boolean = await isFirstIssue(
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

      const message: string = greeting.replace(/#/, sender);
      console.log('Adding message: ' + message );
      const res = await client.issues.createComment({
          owner: issue.owner,
          repo: issue.repo,
          issue_number: issue.number,
          body: message
      });
      console.log(res);
  } catch (error) {
      console.log(error);
      core.setFailed(error.message);
      return;
  }
}


async function isFirstIssue(
  client: github.GitHub,
  owner: string,
  repo: string,
  sender: string,
  curIssueNumber: number
): Promise<boolean> {
  const {status, data: issues} = await client.issues.listForRepo({
    owner: owner,
    repo: repo,
    creator: sender,
    state: 'all'
  });

  if (status !== 200) {
    throw new Error(`Received unexpected API status code ${status}`);
  }

  if (issues.length === 0) {
    return true;
  }

  for (const issue of issues) {
    if (issue.number < curIssueNumber && !issue.pull_request) {
      return false;
    }
  }

  return true;
}


run();
