class EligibilityService {
  /**
   * Compare cart data with criteria to compute eligibility.
   * If all criteria are fulfilled then the cart is eligible (return true).
   *
   * @param cart
   * @param criteria
   * @return {boolean}
   */
  isEligible(cart, criteria) {
    let criteriaArray = Object.entries(criteria);
    
    for (let [key, value] of criteriaArray) {
      let valueInCart = getValueInNestedObjects(key, cart);
      if (valueInCart == undefined) {
        return false;
      }
      if (isObject(value)) {
        if (!applyCriteria(valueInCart, value)) {
          return false;
        }
      } else if (Array.isArray(valueInCart)) {
          if (!valueInCart.includes(value)) {
            return false;
          }
      } else {
        if (valueInCart != value) {
          return false;
        }
      }
    } 
    return true;
  }
}

function andModifier(value, criteria) {
  let criterias = Object.entries(criteria);
  return criterias.every(([key, criteria]) => applyCriteria(value, { [key]: criteria } ));
}

function orModifier(value, criteria) {
  let criterias = Object.entries(criteria);
  return criterias.some(([key, criteria]) => applyCriteria(value, { [key]: criteria }));
}

function applyCriteria(value, criteria) {
  let [modifier, criteriaValue] = Object.entries(criteria)[0];
  switch (modifier) {
    case 'gt':
      return value > criteriaValue;
    case 'lt':
      return value < criteriaValue;
    case 'gte':
      return value >= criteriaValue;
    case 'lte':
      return value <= criteriaValue;
    case 'in':
      if (Array.isArray(value)) {
        return [...value].some(val => criteriaValue.includes(val));
      }
      return criteriaValue.includes(value);
    case 'and':
      return andModifier(value, criteriaValue);
    case 'or':
      return orModifier(value, criteriaValue);
    default:
      throw new Error(`Unknown modifier => ${modifier}`);
  }
}

function getValueInNestedObjects(key, obj) {
  const props = key.split('.');
  let value = obj;
  for (let i = 0; i < props.length; i++) {
    if (isObject(value)) {
      value = value[props[i]];
    } else if (Array.isArray(value)) {
      value = value.map((val) => val[props[i]]);
    } else {
      return undefined;
    }
  }
  return value;
}

function isObject(value) {
  return ({}).toString.call(value) === "[object Object]";
}

module.exports = {
  EligibilityService,
};
