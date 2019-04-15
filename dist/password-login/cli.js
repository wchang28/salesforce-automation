#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("superagent");
function PasswordLogin(tokenGrantUrl, credential) {
    return new Promise(function (resolve, reject) {
        request
            .post(tokenGrantUrl)
            .type('form')
            .send({ grant_type: 'password' })
            .send(credential)
            .end(function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                var body = (res.body ? res.body : JSON.parse(res.text ? res.text : "{}"));
                if (res.status !== 200)
                    reject(body);
                else
                    resolve(body);
            }
        });
    });
}
var tokenGrandUrl = process.argv[2];
if (!tokenGrandUrl) {
    console.error("tokenGrandUrl is missing");
    process.exit(1);
}
var s = process.argv[3];
if (!s) {
    console.error("password credential is missing");
    process.exit(1);
}
var credential = JSON.parse(s);
PasswordLogin(tokenGrandUrl, credential)
    .then(function (result) {
    process.stdout.write(JSON.stringify(result, null, 2));
    return 0;
}).catch(function (err) {
    console.error("Error: " + JSON.stringify(err));
    return 1;
});
