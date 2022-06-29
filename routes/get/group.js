var express = require('express');
var request = require('request')
const {response} = require("express");
var router = express.Router();

async function getUser(req, res) {
    let accessToken = '31596f0031596f0031596f0071312457493315931596f0053e564fe0eb8dbe3c6b809bd';
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

async function getGroup(req, res, groupID) {
    let accessToken = '31596f0031596f0031596f0071312457493315931596f0053e564fe0eb8dbe3c6b809bd';
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
            continue;
        }
        return {
            name: req_body.response[0].name,
            photo: req_body.response[0].photo_200,
            members_count: req_body.response[0].members_count
        };
    }
}

router.get('/', function(req, res, next) {
    getUser(req, res)
        .then(groupID => getGroup(req, res, groupID))
        .then(group => res.json(group));
});

module.exports = router;
