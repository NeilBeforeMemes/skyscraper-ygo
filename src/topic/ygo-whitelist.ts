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

async function getBlockwords() {
    var blockwords: string[] = []

    // keywords
    var keywords = JSON.parse(fs.readFileSync('./data/blockwords.json', 'utf-8'));
    for(var keyword of keywords) {
        blockwords.push(keyword);
    }

    return blockwords;

}

async function getYgoWordlistRegex() {
    var wordlist = await getYgoWordlist()

    return new RegExp('(' + wordlist.join('|') + ')');
}

async function getBlockwordsRegex() {
    var wordlist = await getBlockwords()

    return new RegExp('(' + wordlist.join('|') + ')');
}

async function getYgoWhitelist() {
    var whitelist: Set<string> = new Set<string>();

    var users = JSON.parse(fs.readFileSync('./data/ygo-users.json', 'utf-8'));
    for(var user of users) {
        whitelist.add(user.did);
    }

    console.log(whitelist);

    return whitelist;
}

async function getYgoBlocklist() {
    var blocklist: Set<string> = new Set<string>();

    var users = JSON.parse(fs.readFileSync('./data/blockusers.json', 'utf-8'));
    for(var user of users) {
        blocklist.add(user.did);
    }

    return blocklist;
}

var ygoWordlistRegex;
getYgoWordlistRegex().then(res => {
    ygoWordlistRegex = res;
})

var blockwordsRegex;
getBlockwordsRegex().then(res => {
    blockwordsRegex = res;
})

var ygoWhitelist;
getYgoWhitelist().then(res => {
    ygoWhitelist = res;
})

var ygoBlocklist;
getYgoBlocklist().then(res => {
    ygoBlocklist = res;
})

export { ygoWordlistRegex, ygoWhitelist, blockwordsRegex, ygoBlocklist };