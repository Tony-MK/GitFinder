/*

issue Keys

[
  'url',
  'repository_url',
  'labels_url',
  'issues_url',
  'events_url',
  'html_url',
  'id',
  'node_id',
  'number',
  'title',
  'user',
  'labels',
  'state',
  'locked',
  'assignee',
  'assignees',
  'milestone',
  'issues',
  'created_at',
  'updated_at',
  'closed_at',
  'author_association',
  'active_lock_reason',
  'draft',
  'pull_request',
  'body',
  'reactions',
  'timeline_url',
  'performed_via_github_app',
  'state_reason'
]

*/
const { Octokit } = require("@octokit/core");

const octokit = new Octokit({});
const OWNER =  "Expensify";
const NAME  =  "App";


async function get(query){
    let res = {data : [{}]};
    let page = 0;

    while(res.data.length && page++ < 1){
        console.info(`\n\n\nGetting Page ${page}`);
        res = await octokit.request(`GET /repos/${OWNER}/${NAME}/issues`, {
            ...query,
            page: page,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        const data = res.data.reduce(
            (issues, issue) => {
                if (issue.state !== 'open' || issue.html_url.includes('pull') || issue.title.split("$")[0].toLowerCase().includes('hold')){
                    return issues;
                }
                issue.labels = issue.labels.map(l => l.name)
                if (!issue.labels.includes('External') || !issue.labels.includes('Help Wanted') || issue.labels.includes('Awaiting Payment') || issue.labels.includes('Reviewing')){
                    return issues;
                }
                return [
                    ...issues,
                    issue,
                ]
            },
            [],
        );
        
        let i = 0;
        while(i < data.length) {
            const issueStr = toString(data[i]);
            console.log(++i, issueStr);
        }
    }
}

function toString(issue){
    issue.labels.toString = () => issue.labels.reduce((s, c) => `${s ? s.concat(", ") : ""}${c}`, "") 
    return `${issue.comments} ${issue.created_at} ${issue.labels} ${issue.html_url} ${issue.title}\n`
}

async function update(){

    const query = {
        owner: OWNER,
        repo: NAME,
        state: 'open',
        sort: 'comments',
        direction: 'asc',
        labels: 'Help Wanted',
        per_page: 100,
    }

    await get(query)

}

update();
