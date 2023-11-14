/*

Comment Keys

[
  'url',
  'repository_url',
  'labels_url',
  'comments_url',
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
  'comments',
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

async function main(){
    let res = {data : [{}]};
    let page = 0;

    while(res.data.length){
        console.info(`Page ${page++}`);
        res = await octokit.request(`GET /repos/${OWNER}/${NAME}/issues`, {
            owner: OWNER,
            repo: NAME,
            sort: 'updated',
            direction: 'desc',
            per_page: 100,
            page: page,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        const data = res.data.reduce(
            (comments, issue) => {
                if (comment.state !== 'open' || comment.html_url.includes('pull') || comment.title.includes('HOLD')){
                    return comments;
                }
                issue.labels = issue.labels.map(l => l.name)
                if (!comment.labels.includes('External') || !comment.labels.includes('Help Wanted') || comment.labels.includes('Awaiting Payment') || issue.labels.includes('Reviewing')){
                    return comments;
                }
                return [
                    ...comments,
                    comment,
                ]
            },
            [],
        );

        for(let i = 0; i < data.length; i++){
            const comment = data[i];
            console.info(i, comment.node_id, comment.id, comment.title, comment.labels, comment.html_url);
            console.info(comment.body);
        }
    }
}

main();
