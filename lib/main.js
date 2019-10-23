"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const prMessage = core.getInput('pr-message');
            // Get client and context
            const client = new github.GitHub(core.getInput('repo-token', { required: true }));
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
            const sender = context.payload.sender.login;
            const issue = context.issue;
            console.log("Sender " + sender);
            let firstContribution = yield isFirstPull(client, issue.owner, issue.repo, sender, issue.number);
            if (!firstContribution) {
                console.log('Not the users first contribution');
                return;
            }
            const message = prMessage.replace(/#/, sender);
            console.log('Adding message: ' + message + ' owner ' + context.repo.owner + ' repo ' + context.repo.repo + ' issue repo ' + issue.repo);
            yield client.pulls.createReview({
                owner: context.repo.owner,
                repo: context.repo.repo,
                pull_number: issue.number,
                body: message,
                event: 'COMMENT'
            });
        }
        catch (error) {
            core.setFailed(error.message);
            return;
        }
    });
}
// No way to filter pulls by creator
function isFirstPull(client, owner, repo, sender, curPullNumber, page = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        // Provide console output if we loop for a while.
        console.log('Checking...');
        const { status, data: pulls } = yield client.pulls.list({
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
            const login = pull.user.login;
            if (login === sender && pull.number < curPullNumber) {
                return false;
            }
        }
        return yield isFirstPull(client, owner, repo, sender, curPullNumber, page + 1);
    });
}
run();
