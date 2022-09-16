/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
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
 * ContractACI module
 *
 * @module @aeternity/aepp-sdk/es/contract/aci
 * @export getContractInstance
 */
import _aeternityAeppCalldata from '@aeternity/aepp-calldata';
const {
    Encoder: Calldata
} = _aeternityAeppCalldata;
import { DRY_RUN_ACCOUNT, GAS_MAX } from "../tx/builder/schema.mjs";
import TxObject from "../tx/tx-object.mjs";
import { decode } from "../tx/builder/helpers.mjs";
import { MissingContractDefError, MissingContractAddressError, InactiveContractError, BytecodeMismatchError, InternalError, DuplicateContractError, MissingFunctionNameError, InvalidMethodInvocationError, NotPayableFunctionError, TypeError, NodeInvocationError, IllegalArgumentError, NoSuchContractFunctionError, MissingEventDefinitionError, AmbiguousEventDefinitionError } from "../utils/errors.mjs";
import { hash } from "../utils/crypto-ts.mjs";
/**
 * Generate contract ACI object with predefined js methods for contract usage - can be used for
 * creating a reference to already deployed contracts
 * @alias module:@aeternity/aepp-sdk/es/contract/aci
 * @param {Object} [options={}] Options object
 * @param {String} [options.source] Contract source code
 * @param {String} [options.bytecode] Contract bytecode
 * @param {Object} [options.aci] Contract ACI
 * @param {String} [options.contractAddress] Contract address
 * @param {Object} [options.filesystem] Contact source external namespaces map
 * @param {Boolean} [options.validateBytecode] Compare source code with on-chain version
 * @return {ContractInstance} JS Contract API
 * @example
 * const contractIns = await aeSdk.getContractInstance({ source })
 * await contractIns.deploy([321]) or await contractIns.methods.init(321)
 * const callResult = await contractIns.call('setState', [123]) or
 * await contractIns.methods.setState.send(123, options)
 * const staticCallResult = await contractIns.call('setState', [123], { callStatic: true }) or
 * await contractIns.methods.setState.get(123, options)
 * Also you can call contract like: await contractIns.methods.setState(123, options)
 * Then sdk decide to make on-chain or static call(dry-run API) transaction based on function is
 * stateful or not
 */

export default async function getContractInstance() {
    var _this = this;

    let {
        source,
        bytecode,
        aci: _aci,
        contractAddress,
        filesystem = {},
        validateBytecode,
        ...otherOptions
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!_aci && source) {
        _aci = await this.compilerApi.generateACI({
            code: source,
            options: {
                filesystem
            }
        });
    }

    if (!_aci) throw new MissingContractDefError();
    contractAddress = contractAddress && (await this.resolveName(contractAddress, 'contract_pubkey', {
        resolveByNode: true
    }));

    if (!contractAddress && !source && !bytecode) {
        throw new MissingContractAddressError('Can\'t create instance by ACI without address');
    }

    if (contractAddress) {
        const contract = await this.getContract(contractAddress);
        if (!contract.active) throw new InactiveContractError(contractAddress);
    }

    const instance = {
        _aci,
        _name: _aci.encodedAci.contract.name,
        calldata: new Calldata([_aci.encodedAci, ..._aci.externalEncodedAci]),
        source,
        bytecode,
        deployInfo: {
            address: contractAddress
        },
        options: {...this.Ae.defaults,
            callStatic: false,
            filesystem,
            ...otherOptions
        },
        compilerVersion: this.compilerVersion
    };

    if (validateBytecode) {
        if (!contractAddress) throw new MissingContractAddressError('Can\'t validate bytecode without contract address');
        const onChanBytecode = (await this.getContractByteCode(contractAddress)).bytecode;
        const isValid = source ? await this.compilerApi.validateByteCode({
            bytecode: onChanBytecode,
            source,
            options: instance.options
        }).then(res => Object.entries(res).length === 0, () => false) : bytecode === onChanBytecode;
        if (!isValid) throw new BytecodeMismatchError(source ? 'source' : 'bytecode');
    }
    /**
     * Compile contract
     * @alias module:@aeternity/aepp-sdk/es/contract/aci
     * @rtype () => ContractInstance: Object
     * @return {String} bytecode bytecode
     */


    instance.compile = async function() {
        let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        if (instance.bytecode) throw new IllegalArgumentError('Contract already compiled');
        if (!instance.source) throw new IllegalArgumentError('Can\'t compile without source code');
        const {
            bytecode
        } = await _this.compilerApi.compileContract({
            code: instance.source,
            options: {...instance.options,
                ...options
            }
        });
        instance.bytecode = bytecode;
        return instance.bytecode;
    };

    const sendAndProcess = async(tx, options) => {
        const txData = await this.send(tx, options);
        const result = {
            hash: txData.hash,
            tx: TxObject({
                tx: txData.rawTx
            }),
            txData,
            rawTx: txData.rawTx
        };
        if (options.waitMined === false) return result;
        const {
            callInfo
        } = await this.api.getTransactionInfoByHash(txData.hash);
        Object.assign(result.txData, callInfo); // TODO: don't duplicate data in result

        await handleCallError(callInfo);
        return {...result,
            result: callInfo
        };
    };

    const handleCallError = _ref => {
        let {
            returnType,
            returnValue
        } = _ref;
        let message; // TODO: ensure that it works correctly https://github.com/aeternity/aepp-calldata-js/issues/88

        switch (returnType) {
            case 'ok':
                return;

            case 'revert':
                message = instance.calldata.decodeFateString(returnValue);
                break;

            case 'error':
                message = decode(returnValue).toString();
                break;

            default:
                throw new InternalError(`Unknown returnType: ${returnType}`);
        }

        throw new NodeInvocationError(message);
    };

    instance._estimateGas = async(name, params, options) => {
        const {
            result: {
                gasUsed
            }
        } = await instance.call(name, params, {...options,
            callStatic: true
        }); // taken from https://github.com/aeternity/aepp-sdk-js/issues/1286#issuecomment-977814771

        return Math.floor(gasUsed * 1.25);
    };
    /**
     * Deploy contract
     * @alias module:@aeternity/aepp-sdk/es/contract/aci
     * @rtype (init: Array, options: Object) => ContractInstance: Object
     * @param {Array} params Contract init function arguments array
     * @param {Object} [options] options
     * @return {Object} deploy info
     */


    instance.deploy = async function() {
        var _opt$gas;

        let params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        let options = arguments.length > 1 ? arguments[1] : undefined;
        const opt = {...instance.options,
            ...options
        };
        if (!instance.bytecode) await instance.compile(opt);
        if (opt.callStatic) return instance.call('init', params, opt);
        if (instance.deployInfo.address) throw new DuplicateContractError();
        const ownerId = await _this.address(opt);
        const {
            tx,
            contractId
        } = await _this.contractCreateTx({...opt,
            gas: (_opt$gas = opt.gas) !== null && _opt$gas !== void 0 ? _opt$gas : await instance._estimateGas('init', params, opt),
            callData: instance.calldata.encode(instance._name, 'init', params),
            code: instance.bytecode,
            ownerId
        });
        const {
            hash,
            rawTx,
            result,
            txData
        } = await sendAndProcess(tx, opt);
        instance.deployInfo = Object.freeze({
            result,
            owner: ownerId,
            transaction: hash,
            rawTx,
            txData,
            address: contractId
        });
        return instance.deployInfo;
    };
    /**
     * Get function schema from contract ACI object
     * @param {String} name Function name
     * @return {Object} function ACI
     */


    function getFunctionACI(name) {
        const fn = instance._aci.encodedAci.contract.functions.find(f => f.name === name);

        if (fn) return fn;
        if (name === 'init') return {
            payable: false
        };
        throw new NoSuchContractFunctionError(`Function ${name} doesn't exist in contract`);
    }
    /**
     * Call contract function
     * @alias module:@aeternity/aepp-sdk/es/contract/aci
     * @rtype (init: Array, options: Object = { callStatic: false }) => CallResult: Object
     * @param {String} fn Function name
     * @param {Array} params Array of function arguments
     * @param {Object} [options={}] Array of function arguments
     * @param {Boolean} [options.callStatic=false] Static function call
     * @return {Object} CallResult
     */


    instance.call = async function(fn) {
        let params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        const opt = {...instance.options,
            ...options
        };
        const fnACI = getFunctionACI(fn);
        const contractId = instance.deployInfo.address;
        if (!fn) throw new MissingFunctionNameError();
        if (fn === 'init' && !opt.callStatic) throw new InvalidMethodInvocationError('"init" can be called only via dryRun');
        if (!contractId && fn !== 'init') throw new InvalidMethodInvocationError('You need to deploy contract before calling!');
        if (fn !== 'init' && opt.amount > 0 && fnACI.payable === false) throw new NotPayableFunctionError(`You try to pay "${opt.amount}" to function "${fn}" which is not payable. Only payable function can accept coins`);
        const callerId = await _this.address(opt).catch(error => {
            if (opt.callStatic) return DRY_RUN_ACCOUNT.pub;
            else throw error;
        });
        const callData = instance.calldata.encode(instance._name, fn, params);
        let res;

        if (opt.callStatic) {
            var _opt$gas2, _opt$nonce;

            if (typeof opt.top === 'number') {
                opt.top = (await _this.getKeyBlock(opt.top)).hash;
            }

            const txOpt = {...opt,
                gas: (_opt$gas2 = opt.gas) !== null && _opt$gas2 !== void 0 ? _opt$gas2 : GAS_MAX,
                callData,
                nonce: (_opt$nonce = opt.nonce) !== null && _opt$nonce !== void 0 ? _opt$nonce : opt.top && (await _this.getAccount(callerId, {
                    hash: opt.top
                })).nonce + 1
            };
            const tx = fn === 'init' ? (await _this.contractCreateTx({...txOpt,
                code: instance.bytecode,
                ownerId: callerId
            })).tx : await _this.contractCallTx({...txOpt,
                callerId,
                contractId
            });
            const {
                callObj,
                ...dryRunOther
            } = await _this.txDryRun(tx, callerId, opt);
            await handleCallError(callObj);
            res = {...dryRunOther,
                tx: TxObject({
                    tx
                }),
                result: callObj
            };
        } else {
            var _opt$gas3;

            const tx = await _this.contractCallTx({...opt,
                gas: (_opt$gas3 = opt.gas) !== null && _opt$gas3 !== void 0 ? _opt$gas3 : await instance._estimateGas(fn, params, opt),
                callerId,
                contractId,
                callData
            });
            res = await sendAndProcess(tx, opt);
        }

        if (opt.waitMined || opt.callStatic) {
            res.decodedResult = fnACI.returns && fnACI.returns !== 'unit' && fn !== 'init' && instance.calldata.decode(instance._name, fn, res.result.returnValue);
            res.decodedEvents = instance.decodeEvents(res.result.log, opt);
        }

        return res;
    };
    /**
     * @param {String} address Contract address that emitted event
     * @param {BigInt} nameHash Hash of emitted event name
     * @param {Object} [options]
     * @param {Object} [options.contractAddressToName] Map of contract addresses to their names
     * @return {String} Contract name
     * @throws {MissingEventDefinitionError}
     * @throws {AmbiguousEventDefinitionError}
     */


    function getContractNameByEvent(address, nameHash, _ref2) {
        let {
            contractAddressToName
        } = _ref2;
        const addressToName = {...instance.options.contractAddressToName,
            ...contractAddressToName
        };
        if (addressToName[address]) return addressToName[address];
        const matchedEvents = [instance._aci.encodedAci, ...instance._aci.externalEncodedAci].filter(_ref3 => {
            let {
                contract
            } = _ref3;
            return contract === null || contract === void 0 ? void 0 : contract.event;
        }).map(_ref4 => {
            let {
                contract
            } = _ref4;
            return [contract.name, contract.event.variant];
        }).map(_ref5 => {
            let [name, events] = _ref5;
            return events.map(event => [name, Object.keys(event)[0]]);
        }).flat().filter(_ref6 => {
            let [, eventName] = _ref6;
            return BigInt('0x' + hash(eventName).toString('hex')) === nameHash;
        });

        switch (matchedEvents.length) {
            case 0:
                throw new MissingEventDefinitionError(nameHash, address);

            case 1:
                return matchedEvents[0][0];

            default:
                throw new AmbiguousEventDefinitionError(address, matchedEvents);
        }
    }
    /**
     * Decode Events
     * @alias module:@aeternity/aepp-sdk/es/contract/aci
     * @rtype (events: Array) => DecodedEvents: Array
     * @param {Array} events Array of encoded events (callRes.result.log)
     * @param {Object} [options]
     * @param {Boolean} [options.omitUnknown] Omit events that can't be decoded in case ACI is not
     * complete
     * @return {Object} DecodedEvents
     */


    instance.decodeEvents = function(events) {
        let {
            omitUnknown,
            ...opt
        } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return events.map(event => {
            const topics = event.topics.map(t => BigInt(t));
            let contractName;

            try {
                contractName = getContractNameByEvent(event.address, topics[0], opt);
            } catch (error) {
                if (omitUnknown && error instanceof MissingEventDefinitionError) return null;
                throw error;
            }

            const decoded = instance.calldata.decodeEvent(contractName, event.data, topics);
            const [name, args] = Object.entries(decoded)[0];
            return {
                name,
                args,
                contract: {
                    name: contractName,
                    address: event.address
                }
            };
        }).filter(e => e);
    };
    /**
     * Generate proto function based on contract function using Contract ACI schema
     * All function can be called like:
     * 'await contract.methods.testFunction()' -> then sdk will decide to use dry-run or send tx
     * on-chain base on if function stateful or not.
     * Also you can manually do that:
     * `await contract.methods.testFunction.get()` -> use call-static(dry-run)
     * `await contract.methods.testFunction.send()` -> send tx on-chain
     */


    instance.methods = Object.fromEntries(instance._aci.encodedAci.contract.functions.map(_ref7 => {
        let {
            name,
            arguments: aciArgs,
            stateful
        } = _ref7;

        const genHandler = callStatic => function() {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            const options = args.length === aciArgs.length + 1 ? args.pop() : {};
            if (typeof options !== 'object') throw new TypeError(`Options should be an object: ${options}`);
            if (name === 'init') return instance.deploy(args, {
                callStatic,
                ...options
            });
            return instance.call(name, args, {
                callStatic,
                ...options
            });
        };

        return [name, Object.assign(genHandler(name === 'init' ? false : !stateful), {
            get: genHandler(true),
            send: genHandler(false)
        })];
    }));
    return instance;
}
//# sourceMappingURL=aci.mjs.map