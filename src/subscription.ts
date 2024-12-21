import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { AtpAgent } from '@atproto/api'
import * as lexicon from './lexicon'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'
import { ygoWordlistRegex, ygoWhitelist, ygoBlocklist, blockwordsRegex } from './topic/ygo-whitelist'
import { Database } from './db'
import { ThreadViewPost } from './lexicon/types/app/bsky/feed/defs'

export class FirehoseSubscription extends FirehoseSubscriptionBase {

  agent: AtpAgent;

  constructor(db: Database, service: string, agent: AtpAgent) {
    super(db, service);
    this.agent = agent;
  }
  
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return

    const ops = await getOpsByType(evt)

    // This logs the text of every post off the firehose.
    // Just for fun :)
    // Delete before actually using
    // for (const post of ops.posts.creates) {
    //   ops
    //   console.log(post.record);
    //   //console.log(post.record.text)
      
    // }

    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const postsToCreate: any[] = [];
    for(var create of ops.posts.creates)
    {
      // only yugioh-related posts
        
      if(ygoBlocklist.has(create.author)) {
        continue;
      }

      if(ygoWhitelist.has(create.author)) {
        console.log(`${create.author}: ${create.record.text}`)
        postsToCreate.push({
          uri: create.uri,
          cid: create.cid,
          indexedAt: new Date().toISOString(),
        });
        continue;
      }

      
      var lowerPost = create.record.text.toLowerCase();

      if (!blockwordsRegex.test(lowerPost) && ygoWordlistRegex.test(lowerPost)) {
        var safe = true;
        try {
          if(create.record.reply !== null && create.record.reply !== undefined)
            {
              var thread = await this.agent.getPostThread({
                uri: create.record.reply.parent.uri
              }).then(x => x);
              var threadpost = thread.data.thread
              
              while (safe && threadpost !== null && threadpost !== undefined)
              {
                var lowerThreadPost = ((threadpost as ThreadViewPost).post.record as any)?.text?.toLowerCase();
                if (blockwordsRegex.test(lowerThreadPost))
                {
                  safe = false;
                }
                else
                {
                  threadpost = threadpost.parent as ThreadViewPost
                }
              }

            }
        }
        catch(ex)
        {
          console.log("failed to read thread")
          console.log(ex)
          safe = false;
        }
        
        if(safe) {
          console.log(`${create.uri}: ${create.record.text}`)
          postsToCreate.push({
            uri: create.uri,
            cid: create.cid,
            indexedAt: new Date().toISOString(),
          });
        }
        
      }                
    }

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
    }
    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
