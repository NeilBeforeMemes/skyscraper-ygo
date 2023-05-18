import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'
import { ygoWordlist, ygoWhitelist } from './topic/ygo-whitelist'

export class FirehoseSubscription extends FirehoseSubscriptionBase {


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
    const postsToCreate = ops.posts.creates
      .filter((create) => {
        // only yugioh-related posts
        var lowerPost = create.record.text.toLowerCase();

        for(var user of ygoWhitelist) {
          if(create.author == user) {
            console.log(`${user}: ${create.record.text}`)
            return true;
          }
        }

        for(var word of ygoWordlist) {
          if (lowerPost.includes(word)) {
            console.log(`${word}: ${create.record.text}`)
            return true;
          }
        };
      })
      .map((create) => {
        // map ygo-related posts to a db row
        return {
          uri: create.uri,
          cid: create.cid,
          replyParent: create.record?.reply?.parent.uri ?? null,
          replyRoot: create.record?.reply?.root.uri ?? null,
          indexedAt: new Date().toISOString(),
        }
      })

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
