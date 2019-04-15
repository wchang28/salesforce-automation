export interface PasswordLoginCredential {
    client_id?: string;
    client_secret?: string;
    username?: string;
    password?: string;
}

export interface AuthResult {
    instance_url: string;
    access_token: string;
    refresh_token?: string;
    id: string;
    token_type: string;
    issued_at: string;
    signature: string;
}

export interface APIVersionInfo {
    version: string;
    lebel: string;
    url: string;
}

export interface QueryResult<T> {
    done: boolean;
    totalSize: number;
    nextRecordsUrl?: string;
    records: T[];
}