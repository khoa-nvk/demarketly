/**
 * Error module
 * @module @aeternity/aepp-sdk/es/utils/errors
 * @example import { BytecodeMismatchError } from '@aeternity/aepp-sdk'
 */
/**
 * aepp-sdk originated error
 */
export declare abstract class BaseError extends Error {
    constructor(message: string);
}
export declare class AccountError extends BaseError {
    constructor(message: string);
}
export declare class AensError extends BaseError {
    constructor(message: string);
}
export declare class AeppError extends BaseError {
    constructor(message: string);
}
export declare class ChannelError extends BaseError {
    constructor(message: string);
}
export declare class CompilerError extends BaseError {
    constructor(message: string);
}
export declare class ContractError extends BaseError {
    constructor(message: string);
}
export declare class CryptographyError extends BaseError {
    constructor(message: string);
}
export declare class NodeError extends BaseError {
    constructor(message: string);
}
export declare class TransactionError extends BaseError {
    constructor(message: string);
}
export declare class WalletError extends BaseError {
    constructor(message: string);
}
export declare class ArgumentError extends BaseError {
    constructor(argumentName: string, requirement: string, argumentValue: any);
}
export declare class IllegalArgumentError extends CryptographyError {
    constructor(message: string);
}
export declare class ArgumentCountMismatchError extends BaseError {
    constructor(functionName: string, requiredCount: number, providedCount: number);
}
export declare class InsufficientBalanceError extends BaseError {
    constructor(message: string);
}
export declare class InvalidDenominationError extends BaseError {
    constructor(message: string);
}
export declare class InvalidNameError extends BaseError {
    constructor(message: string);
}
export declare class MissingParamError extends BaseError {
    constructor(message: string);
}
export declare class NoBrowserFoundError extends BaseError {
    constructor();
}
export declare class NoSerializerFoundError extends BaseError {
    constructor();
}
export declare class RequestTimedOutError extends BaseError {
    constructor(requestTime: number);
}
export declare class TxTimedOutError extends BaseError {
    constructor(blocks: number, th: string, status?: string);
}
export declare class TypeError extends BaseError {
    constructor(message: string);
}
export declare class UnsupportedPlatformError extends BaseError {
    constructor(message: string);
}
export declare class UnsupportedProtocolError extends BaseError {
    constructor(message: string);
}
export declare class NotImplementedError extends BaseError {
    constructor(message: string);
}
export declare class UnsupportedVersionError extends BaseError {
    constructor(dependency: string, version: string, geVersion: string, ltVersion: string);
}
export declare class InternalError extends BaseError {
    constructor(message: string);
}
export declare class InvalidKeypairError extends AccountError {
    constructor(message: string);
}
export declare class UnavailableAccountError extends AccountError {
    constructor(address: string);
}
export declare class AensPointerContextError extends AensError {
    constructor(nameOrId: string, prefix: string);
}
export declare class InsufficientNameFeeError extends AensError {
    constructor(nameFee: number, minNameFee: number);
}
export declare class InvalidAensNameError extends AensError {
    constructor(message: string);
}
export declare class DuplicateCallbackError extends AeppError {
    constructor();
}
export declare class InvalidRpcMessageError extends AeppError {
    constructor(message: string);
}
export declare class MissingCallbackError extends AeppError {
    constructor(id: string);
}
export declare class UnAuthorizedAccountError extends AeppError {
    constructor(onAccount: string);
}
export declare class UnknownRpcClientError extends AeppError {
    constructor(id: string);
}
export declare class UnsubscribedAccountError extends AeppError {
    constructor();
}
export declare class ChannelCallError extends ChannelError {
    constructor(message: string);
}
export declare class ChannelConnectionError extends ChannelError {
    constructor(message: string);
}
export declare class ChannelPingTimedOutError extends ChannelError {
    constructor();
}
export declare class UnexpectedChannelMessageError extends ChannelError {
    constructor(message: string);
}
export declare class UnknownChannelStateError extends ChannelError {
    constructor();
}
export declare class InvalidAuthDataError extends CompilerError {
    constructor(message: string);
}
export declare class BytecodeMismatchError extends ContractError {
    constructor(source: string);
}
export declare class DuplicateContractError extends ContractError {
    constructor();
}
export declare class InactiveContractError extends ContractError {
    constructor(contractAddress: string);
}
export declare class InvalidMethodInvocationError extends ContractError {
    constructor(message: string);
}
export declare class MissingContractAddressError extends ContractError {
    constructor(message: string);
}
export declare class MissingContractDefError extends ContractError {
    constructor();
}
export declare class MissingFunctionNameError extends ContractError {
    constructor();
}
export declare class NodeInvocationError extends ContractError {
    constructor(message?: string);
}
export declare class NoSuchContractFunctionError extends ContractError {
    constructor(name: string);
}
export declare class NotPayableFunctionError extends ContractError {
    constructor(amount: string, fn: string);
}
export declare class MissingEventDefinitionError extends ContractError {
    constructor(eventNameHash: string, eventAddress: string);
}
export declare class AmbiguousEventDefinitionError extends ContractError {
    constructor(eventAddress: string, matchedEvents: [string, string][]);
}
export declare class InvalidChecksumError extends CryptographyError {
    constructor();
}
export declare class InvalidDerivationPathError extends CryptographyError {
    constructor();
}
export declare class InvalidKeyError extends CryptographyError {
    constructor(message: string);
}
export declare class InvalidPasswordError extends CryptographyError {
    constructor(message: string);
}
export declare class MerkleTreeHashMismatchError extends CryptographyError {
    constructor();
}
export declare class MissingNodeInTreeError extends CryptographyError {
    constructor(message: string);
}
export declare class UnsupportedAlgorithmError extends CryptographyError {
    constructor(algo: string);
}
export declare class NotHardenedSegmentError extends CryptographyError {
    constructor(message: string);
}
export declare class UnknownNodeLengthError extends CryptographyError {
    constructor(nodeLength: number);
}
export declare class UnknownPathNibbleError extends CryptographyError {
    constructor(nibble: number);
}
export declare class UnsupportedChildIndexError extends CryptographyError {
    constructor(index: string);
}
export declare class DisconnectedError extends NodeError {
    constructor();
}
export declare class DuplicateNodeError extends NodeError {
    constructor(name: string);
}
export declare class NodeNotFoundError extends NodeError {
    constructor(message: string);
}
export declare class DecodeError extends TransactionError {
    constructor(message: string);
}
export declare class EncodeError extends TransactionError {
    constructor(message: string);
}
export declare class PayloadLengthError extends TransactionError {
    constructor(message: string);
}
export declare class DryRunError extends TransactionError {
    constructor(message: string);
}
export declare class IllegalBidFeeError extends TransactionError {
    constructor(message: string);
}
export declare class InvalidSignatureError extends TransactionError {
    constructor(message: string);
}
export declare class InvalidTxError extends TransactionError {
    constructor(message: string);
}
export declare class InvalidTxParamsError extends TransactionError {
    constructor(message: string);
}
export declare class NoDefaultAensPointerError extends TransactionError {
    constructor(prefix: string);
}
export declare class PrefixMismatchError extends TransactionError {
    constructor(prefix: string, requiredPrefix: string);
}
export declare class PrefixNotFoundError extends TransactionError {
    constructor(tag: string);
}
export declare class SchemaNotFoundError extends TransactionError {
    constructor(message: string);
}
export declare class TagNotFoundError extends TransactionError {
    constructor(prefix: string);
}
export declare class TxNotInChainError extends TransactionError {
    constructor(txHash: string);
}
export declare class UnknownTxError extends TransactionError {
    constructor(message: string);
}
export declare class UnsupportedABIversionError extends TransactionError {
    constructor(message: string);
}
export declare class UnsupportedVMversionError extends TransactionError {
    constructor(message: string);
}
export declare class AlreadyConnectedError extends WalletError {
    constructor(message: string);
}
export declare class MessageDirectionError extends WalletError {
    constructor(message: string);
}
export declare class NoWalletConnectedError extends WalletError {
    constructor(message: string);
}
export declare class RpcConnectionError extends WalletError {
    constructor(message: string);
}
