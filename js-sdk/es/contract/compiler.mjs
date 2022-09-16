/*
 * ISC License (ISC)
 * Copyright (c) 2021 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */

/**
 * ContractCompilerHttp module
 *
 * @module @aeternity/aepp-sdk/es/contract/compiler
 * @export ContractCompilerHttp
 * @example import { ContractCompilerHttp } from '@aeternity/aepp-sdk'
 */
import semverSatisfies from "../utils/semver-satisfies.mjs";
import AsyncInit from "../utils/async-init.mjs";
import genSwaggerClient from "../utils/swagger.mjs";
import { MissingParamError, UnsupportedVersionError } from "../utils/errors.mjs";
import { mapObject } from "../utils/other.mjs";
/**
 * Contract Compiler Stamp
 *
 * This stamp include api call's related to contract compiler functionality.
 * @function
 * @alias module:@aeternity/aepp-sdk/es/contract/compiler
 * @rtype Stamp
 * @param {Object} [options={}] - Initializer object
 * @param {String} [options.compilerUrl] compilerUrl - Url for compiler API
 * @return {Object} Contract compiler instance
 * @example ContractCompilerHttp({ compilerUrl: 'COMPILER_URL' })
 */

export default AsyncInit.compose({
  async init(_ref) {
    let {
      compilerUrl,
      ignoreVersion
    } = _ref;
    if (!compilerUrl) return;
    await this.setCompilerUrl(compilerUrl, {
      ignoreVersion
    });
  },

  methods: {
    async setCompilerUrl(compilerUrl) {
      let {
        ignoreVersion = false
      } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!compilerUrl) throw new MissingParamError('compilerUrl required');
      compilerUrl = compilerUrl.replace(/\/$/, '');
      const client = await genSwaggerClient(`${compilerUrl}/api`, {
        disableBigNumbers: true,
        disableCaseConversion: true,
        responseInterceptor: response => {
          if (response.ok) return;
          let message = `${new URL(response.url).pathname.slice(1)} error`;

          if (response.body.reason) {
            message += ': ' + response.body.reason + (response.body.parameter ? ` in ${response.body.parameter}` : '') + ( // TODO: revising after improving documentation https://github.com/aeternity/aesophia_http/issues/78
            response.body.info ? ` (${JSON.stringify(response.body.info)})` : '');
          }

          if (Array.isArray(response.body)) {
            message += ':\n' + response.body.map(e => `${e.type}:${e.pos.line}:${e.pos.col}: ${e.message}${e.context ? `(${e.context})` : ''}`).map(e => e.trim()) // TODO: remove after fixing https://github.com/aeternity/aesophia_http/issues/80
            .join('\n');
          }

          response.statusText = message;
          return response;
        }
      });
      this.compilerVersion = client.spec.info.version;
      this.compilerApi = mapObject(client.api, _ref2 => {
        let [key, fn] = _ref2;
        return [key, function () {
          let {
            options: {
              filesystem,
              ...options
            } = {},
            ...args
          } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          return fn({ ...args,
            options: { ...options,
              file_system: filesystem
            }
          });
        }];
      });
      if (ignoreVersion) return;

      if (!semverSatisfies(this.compilerVersion, COMPILER_GE_VERSION, COMPILER_LT_VERSION)) {
        throw new UnsupportedVersionError('compiler', this.compilerVersion, COMPILER_GE_VERSION, COMPILER_LT_VERSION);
      }
    }

  },
  props: {
    compilerVersion: null
  }
});
const COMPILER_GE_VERSION = '6.1.0';
const COMPILER_LT_VERSION = '7.0.0';
//# sourceMappingURL=compiler.mjs.map