var express = require('express');
var request = require('request')
const {response} = require("express");
var router = express.Router();
let accessToken = require('../../constants.js');

async function getUser(req, res) {
    let maxUserID = 1000 * 1000;
    while (true) {
        let randomUserId = Math.floor(Math.random() * maxUserID) + 1;
        let api_req = new Promise((resolve, reject) => {
            request('https://api.vk.com/method/users.getSubscriptions?access_token=' + accessToken + '&user_id=' + randomUserId.toString() + '&v=5.131', (err, response, body) => {
                if (err) {
                    return console.log(err);
                }
                resolve(body);
            });
        });
        let req_body = await api_req;
        req_body = JSON.parse(req_body);
        if (req_body.response === undefined || req_body.response.groups.items.length === 0) {
            continue;
        }
        let randomIndex = Math.floor(Math.random() * Number(req_body.response.groups.count));
        return req_body.response.groups.items[randomIndex];
    }
}

function sleep(ms) {
    return(
        new Promise(function(resolve, reject) {setTimeout(function() { resolve(); }, ms);})
    );
}

async function getGroup(req, res, groupID) {
    while (true) {
        let api_req = new Promise((resolve, reject) => {
            request('https://api.vk.com/method/groups.getById?access_token=' + accessToken + '&group_id=' + groupID.toString() + '&fields=members_count&v=5.131', (err, response, body) => {
                if (err) {
                    console.log('Too many req per sec');
                    return err;
                }
                resolve(body);
            });
        });
        let req_body = await api_req;
        req_body = JSON.parse(req_body);
        console.log(req_body);
        if (req_body.error) {
            await sleep(300);
            continue;
        }
        let members_count = req_body.response[0].members_count;
        if (!req_body.response[0].members_count) {
            members_count = 0;
        }
        return {
            name: req_body.response[0].name,
            photo: req_body.response[0].photo_200,
            members_count: members_count
        };
    }
}

router.get('/', function(req, res, next) {
    getUser(req, res)
        .then(groupID => getGroup(req, res, groupID))
        .then(group => res.json(group));
});

module.exports = router;
