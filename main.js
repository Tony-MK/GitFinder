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
const QUERIES = {
    ISSUES : {
        
    }
}


async function get(query){
    let res = {data : [{}]};
    let page = 0;

    while(res.data.length || page <= 8){
        console.info(`Page ${page++}`);
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
        while(i < data.length) display(data[i], i++);
    }
}

function display(issue, i = undefined){
    console.info(`${i ? i.toString().concat(" ") : ""}${issue.created_at}`, issue.labels.reduce((s, c) => `${s ? s.concat(", ") : ""}${c}`, ""));
    console.info(issue.issues, issue.title, issue.html_url);
}

async function update(){

    const query = {
        owner: OWNER,
        repo: NAME,
        state: 'open',
        sort: 'issues',
        direction: 'asc',
        labels: 'Help Wanted',
        per_page: 100,
    }

    await get(query)

}

update();
