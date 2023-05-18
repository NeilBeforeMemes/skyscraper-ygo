import axios from 'axios'
import dotenv from 'dotenv'
import * as fs from 'fs';

async function getYgoWordlist() {
    var wordlist: string[] = []

    // keywords
    var keywords = JSON.parse(fs.readFileSync('./data/ygo-keywords.json', 'utf-8'));
    for(var keyword of keywords) {
        wordlist.push(keyword);
    }

    console.log(wordlist);

    return wordlist;

}

async function getYgoWhitelist() {
    var whitelist: string[] = []

    var users = JSON.parse(fs.readFileSync('./data/ygo-users.json', 'utf-8'));
    for(var user of users) {
        whitelist.push(user.did);
    }

    console.log(whitelist);

    return whitelist;
}

var ygoWordlist;
getYgoWordlist().then(res => {
    ygoWordlist = res;
})

var ygoWhitelist;
getYgoWhitelist().then(res => {
    ygoWhitelist = res;
})

export { ygoWordlist, ygoWhitelist };