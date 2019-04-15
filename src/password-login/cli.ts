#!/usr/bin/env node
import * as request from "superagent";
import * as types from "../types";

function PasswordLogin(tokenGrantUrl: string, credential: types.PasswordLoginCredential) {
    return new Promise<types.AuthResult>((resolve: (value: types.AuthResult) => void, reject: (err: any) => void) => {
        request
        .post(tokenGrantUrl)
        .type('form')
        .send({grant_type: 'password'})
        .send(credential)
        .end((err: any, res: request.Response) => {
            if (err) {
                reject(err);
            } else {
                let body = (res.body ? res.body : JSON.parse(res.text ? res.text : "{}"));
                if (res.status !== 200)
                    reject(body);
                else
                    resolve(body);
            }
        });
    });
}

const tokenGrandUrl = process.argv[2];
if (!tokenGrandUrl) {
    console.error("tokenGrandUrl is missing");
    process.exit(1);
}

const s = process.argv[3];
if (!s) {
    console.error("password credential is missing");
    process.exit(1);
}

const credential: types.PasswordLoginCredential = JSON.parse(s);

PasswordLogin(tokenGrandUrl, credential)
.then((result) => {
    process.stdout.write(JSON.stringify(result, null, 2));
    return 0;
}).catch((err: any) => {
    console.error(`Error: ${JSON.stringify(err)}`);
    return 1;
})
