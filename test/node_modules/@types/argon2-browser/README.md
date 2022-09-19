# Installation
> `npm install --save @types/argon2-browser`

# Summary
This package contains type definitions for argon2-browser (https://github.com/antelle/argon2-browser#readme).

# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/argon2-browser.
## [index.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/argon2-browser/index.d.ts)
````ts
// Type definitions for argon2-browser 1.18
// Project: https://github.com/antelle/argon2-browser#readme
// Definitions by: Ivan Gabriele <https://github.com/ivangabriele>
//                 Brendan Early <https://github.com/mymindstorm>
//                 Jeremy Forsythe <https://github.com/jdforsythe>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.1

export { };

// Argon2Error is provided on promise rejection
export function hash(
  options: Argon2BrowserHashOptions,
): Promise<Argon2BrowserHashResult>;

export function unloadRuntime(): void;

export interface Argon2BrowserHashOptions {
  pass: string | Uint8Array;
  salt: string | Uint8Array;
  time?: number | undefined;
  mem?: number | undefined;
  hashLen?: number | undefined;
  parallelism?: number | undefined;
  type?: ArgonType | undefined;
  distPath?: string | undefined;
  secret?: Uint8Array | undefined;
  ad?: Uint8Array | undefined;
}

export interface Argon2BrowserHashResult {
  encoded: string;
  hash: Uint8Array;
  hashHex: string;
}

// Argon2Error provided on promise rejection
export function verify(options: Argon2VerifyOptions): Promise<undefined>;

export interface Argon2VerifyOptions {
  pass: string;
  encoded: string | Uint8Array;
  type?: ArgonType | undefined;
  secret?: Uint8Array | undefined;
  ad?: Uint8Array | undefined;
}

export interface Argon2Error {
  message: string;
  code: number;
}

export enum ArgonType {
  Argon2d = 0,
  Argon2i = 1,
  Argon2id = 2,
}

````

### Additional Details
 * Last updated: Wed, 07 Jul 2021 21:44:31 GMT
 * Dependencies: none
 * Global values: none

# Credits
These definitions were written by [Ivan Gabriele](https://github.com/ivangabriele), [Brendan Early](https://github.com/mymindstorm), and [Jeremy Forsythe](https://github.com/jdforsythe).
