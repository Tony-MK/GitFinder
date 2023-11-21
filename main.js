const { Octokit } = require("@octokit/core");
const { fetch } = require("node-fetch");

const octokit = new Octokit({
  request: {
    fetch: fetch,
  },
});const MAX_PAGE_SIZE = 100;
const OWNER =  "Expensify";
const NAME  =  "App";


async function get(params){
    let res = {data : [{}]};
    let query = {
        ...params,
        per_page: params["per_page"] || MAX_PAGE_SIZE,
        page: 0,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    };

    while(res.data.length){
        
        console.info(`Getting Page ${query['page'] + 1}.....`);
        console.info(query);

        res = await octokit.request(`GET /repos/${query['owner']}/${query['name']}/issues`, query);
        
        const data = res.data.filter(
            (issue) => {
                if (issue.state !== 'open' || issue.html_url.includes('pull') || issue.title.split("$")[0].toLowerCase().includes('hold')){
                    return;
                }
                issue.labels = issue.labels.map(l => l.name)
                return (issue.labels.includes('External') || issue.labels.includes('Help Wanted')) && !(!issue.labels.includes('Awaiting Payment') || issue.labels.includes('Reviewing'))
            },
        );
        
        console.log("\n".join(data.map((value, index)`${index + 1} ${toString(value)}`)), '\n\n\n')
        query['page']++;
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
        per_page: MAX_PAGE_SIZE,
    }

    await get(query)

}


function main(){
    update();
}

main();



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