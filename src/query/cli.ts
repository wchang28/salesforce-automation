import * as api from "rest-api-client";
import * as types from "../types";
import {Readable, Writable} from "stream";

function getAuthResultFromReadable(readable: Readable) {
    return new Promise<types.AuthResult>((resolve: (value: types.AuthResult) => void) => {
        let s = "";
        readable
        .on("data", (data: string) => {
            s += data;
        }).on("end", () => {
            resolve(JSON.parse(s) as types.AuthResult);
        });
    });
}

function getApiAccessForAuthResult(auth: types.AuthResult): api.ApiAccess {
    let apiAccess: api.ApiAccess = {
        baseUrl: auth.instance_url
        ,credentialPlacement: "header"
        ,credential: {
            value: {
                tokenType: auth.token_type
                ,token: auth.access_token
            }
        }
    };
    return apiAccess;
}

async function getLatestAPIVersionUrl(client: api.Client) {
    const versions = await client.api("/services/data").get() as types.APIVersionInfo[];
    let latestVersion: number = undefined;
    let url = undefined;
    for (const version of versions) {
        const ver = parseFloat(version.version);
        if (!latestVersion || ver > latestVersion) {
            latestVersion = ver;
            url = version.url;
        }
    }
    if (!latestVersion) {
        throw "unable to determine the latest api version";
    } else {
        return url;
    }
}

async function run(readable: Readable, soql: string, writable: Writable) {
    const auth = await getAuthResultFromReadable(readable);
    const client = api.Client.init(async () => {return getApiAccessForAuthResult(auth);});
    const versionUrl = await getLatestAPIVersionUrl(client);
    let count = 0;
    const onRecord = (record: any) => {
        if (count > 0) process.stdout.write(",")
        writable.write(JSON.stringify(record));
        count++;
    }
    writable.write("[");
    let result: types.QueryResult<any> = await client.api(`${versionUrl}/query`).query({q: soql}).get() as any;
    result.records.forEach(onRecord);
    while (result.nextRecordsUrl) {
        result = await client.api(result.nextRecordsUrl).get() as any;
        result.records.forEach(onRecord);
    }
    writable.write("]");
}

const soql = process.argv[2]
if (!soql) {
    console.error("missing soql");
    process.exit(1);
}

run(process.stdin, soql, process.stdout)
.then(() => {
    process.exit(0);
}).catch((err: any) => {
    console.error(JSON.stringify(err));
    process.exit(1);
})
