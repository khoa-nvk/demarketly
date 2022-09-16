import JsonBig from '@aeternity/json-bigint';
import BigNumber from 'bignumber.js';
const jsonBig = JsonBig({
  storeAsString: true
});

const convertValuesToBigNumbers = value => {
  if (typeof value === 'object' && value !== null && value.constructor === Object) {
    return Object.entries(value).map(_ref => {
      let [key, value] = _ref;
      return [key, convertValuesToBigNumbers(value)];
    }).reduce((p, _ref2) => {
      let [k, v] = _ref2;
      return { ...p,
        [k]: v
      };
    }, {});
  }

  if (Array.isArray(value)) {
    return value.map(item => convertValuesToBigNumbers(item));
  }

  if (typeof value === 'string' && BigNumber(value).toString(10) === value) {
    const bn = BigNumber(value);

    bn.toJSON = () => bn.toString(10);

    return bn;
  }

  return value;
};

export default {
  stringify: function (object) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return jsonBig.stringify(convertValuesToBigNumbers(object), ...args);
  },
  parse: jsonBig.parse
};
//# sourceMappingURL=json-big.mjs.map