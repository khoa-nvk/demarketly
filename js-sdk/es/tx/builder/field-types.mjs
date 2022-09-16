import _buffer from "buffer";
const {
  Buffer: _Buffer
} = _buffer;
import { writeId, readId, isNameValid, produceNameId, ensureNameValid, getMinimumNameFee, readInt, writeInt } from "./helpers.mjs";
import { InsufficientNameFeeError, IllegalArgumentError } from "../../utils/errors.mjs";
export class Field {
  static serialize(value) {
    return value;
  }

  static deserialize(value) {
    return value;
  }

}
export class Name extends Field {
  static serialize(value) {
    ensureNameValid(value);
    return _Buffer.from(value);
  }

  static deserialize(value) {
    return value.toString();
  }

}
export class NameId extends Field {
  static serialize(value) {
    return writeId(isNameValid(value) ? produceNameId(value) : value);
  }

  static deserialize(value) {
    return readId(value);
  }

}
export class NameFee extends Field {
  static serialize(value, _ref) {
    var _value;

    let {
      name
    } = _ref;
    const minNameFee = getMinimumNameFee(name);
    (_value = value) !== null && _value !== void 0 ? _value : value = minNameFee;

    if (minNameFee.gt(value)) {
      throw new InsufficientNameFeeError(value, minNameFee);
    }

    return writeInt(value);
  }

  static deserialize(value) {
    return readInt(value);
  }

}
export class Deposit extends Field {
  static serialize(value, _ref2) {
    let {
      name
    } = _ref2;
    if (+value) throw new IllegalArgumentError(`Contract deposit is not refundable, so it should be equal 0, got ${value} instead`);
    return writeInt(0);
  }

  static deserialize(value) {
    return readInt(value);
  }

}
//# sourceMappingURL=field-types.mjs.map