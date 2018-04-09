'use strict';

const defaultOptions = {
  objectName: 'module',
  propertyName: 'hot'
};

module.exports = function plugin() {
  return {
    visitor: {
      MemberExpression(path, {opts}) {
        const {objectName, propertyName} = Object.assign({}, defaultOptions, opts);

        if (!isMember(path, {objectName, propertyName})) return;
        if (!isGlobalVariable(path.get('object'))) return;

        const testExpressionPath = getTestExpressionPath(path);

        if (testExpressionPath) {
          const evaluator = new TestExpressionEvaluator({objectName, propertyName});
          const test = evaluator.evaluate(testExpressionPath);

          if (test.hasValue) {
            updatePath(testExpressionPath.parentPath, test.value);
          }
        }
      }
    }
  };

  function updatePath(path, testValue) {
    if (path.isIfStatement()) {
      if (testValue) {
        extractIfClause(path);
      } else {
        removeIfClause(path);
      }
    } else if (path.isConditionalExpression()) {
      removeConditionalExpression(path, testValue);
    }
  }
};

function getTestExpressionPath(memberExpressionPath) {
  return memberExpressionPath.find((path) => {
    const parentPath = path.parentPath;
    return parentPath
      && (parentPath.isIfStatement() || parentPath.isConditionalExpression())
      && path.key === 'test';
  });
}

function isGlobalVariable(identifierPath) {
  const name = identifierPath.node.name;
  return identifierPath.isIdentifier()
    && !identifierPath.scope.hasBinding(name)
    && identifierPath.scope.hasGlobal(name);
}

function isMember(expressionPath, {objectName, propertyName}) {
  return expressionPath.isMemberExpression({computed: false})
    && expressionPath.get('object').isIdentifier({name: objectName})
    && expressionPath.get('property').isIdentifier({name: propertyName});
}

function removeIfClause(ifStatementPath) {
  ifStatementPath.assertIfStatement();

  const elseStatement = ifStatementPath.node.alternate;

  if (elseStatement) {
    ifStatementPath.replaceWith(elseStatement);
  } else {
    ifStatementPath.remove();
  }
}

function extractIfClause(ifStatementPath) {
  ifStatementPath.assertIfStatement();
  ifStatementPath.replaceWith(ifStatementPath.get('consequent'));
}

function removeConditionalExpression(conditionalExpressionPath, testValue) {
  conditionalExpressionPath.assertConditionalExpression();

  const valueExpression = conditionalExpressionPath.get(testValue ? 'consequent' : 'alternate').node;
  conditionalExpressionPath.replaceWith(valueExpression);
}

function TestExpressionEvaluator(options) {
  Object.assign(this, options);
}

TestExpressionEvaluator.prototype.evaluate = function evaluate(path) {
  if (path.isMemberExpression()) {
    return this._evaluateMemberExpression(path);
  } else if (path.isBinaryExpression()) {
    return this._evaluateBinaryExpression(path);
  } else if (path.isUnaryExpression()) {
    return this._evaluateUnaryExpression(path);
  } else if (path.isLiteral()) {
    return this._evaluateLiteral(path);
  }

  return MaybeValue.nothing();
};

TestExpressionEvaluator.prototype._evaluateMemberExpression = function _evaluateMemberExpression(path) {
  path.assertMemberExpression();

  const {objectName, propertyName} = this;

  if (isMember(path, {objectName, propertyName}) && isGlobalVariable(path.get('object'))) {
    return MaybeValue.from(undefined);
  }

  return MaybeValue.nothing();
};

TestExpressionEvaluator.prototype._evaluateBinaryExpression = function _evaluateBinaryExpression(path) {
  path.assertBinaryExpression();

  const left = this.evaluate(path.get('left'));
  const right = this.evaluate(path.get('right'));

  switch (path.node.operator) {
    case '==':
      return left.equals(right);
    case '!=':
      return left.notEquals(right);
    case '===':
      return left.strictEquals(right);
    case '!==':
      return left.strictNotEquals(right);
    default:
      return MaybeValue.nothing();
  }
};

TestExpressionEvaluator.prototype._evaluateUnaryExpression = function _evaluateUnaryExpression(path) {
  path.assertUnaryExpression();

  const argument = this.evaluate(path.get('argument'));

  switch (path.node.operator) {
    case '!':
      return argument.not();
    case 'typeof':
      return argument.typeof();
    default:
      return MaybeValue.nothing();
  }
};

TestExpressionEvaluator.prototype._evaluateLiteral = function _evaluateLiteral(path) {
  path.assertLiteral();

  return MaybeValue.from(path.node.value);
};

function MaybeValue({type, value} = {}) {
  Object.assign(this, {type, value});
}

MaybeValue.from = function fromValue(value) {
  return new MaybeValue({type: typeof value, value});
};

MaybeValue.any = function any() {
  return new MaybeValue({type: 'any'});
};

MaybeValue.nothing = function nothing() {
  return new MaybeValue();
};

Object.defineProperties(MaybeValue.prototype, {
  hasType: {
    get() {
      return typeof this.type != 'undefined' && this.type !== 'any';
    }
  },

  hasValue: {
    get() {
      return (this.type === 'undefined' && this.value === undefined)
        || (this.type === 'object' && this.value === null)
        || (typeof this.type != 'undefined' && typeof this.value != 'undefined');
    }
  },

  isAny: {
    get() {
      return this.type === 'any';
    }
  },

  isNothing: {
    get() {
      return typeof this.type == 'undefined';
    }
  }
});

MaybeValue._binaryOperation = function _binaryOperation(fn) {
  return function (rhs) {
    if (this.isAny || rhs.isAny) {
      return MaybeValue.any();
    } else if (this.isNothing || rhs.isNothing) {
      return MaybeValue.nothing();
    } else {
      const value = fn(this.value, rhs.value);
      const type = typeof value;
      return new MaybeValue({type, value});
    }
  };
};

MaybeValue._unaryOperation = function _unaryOperation(fn) {
  return function () {
    if (this.isAny) {
      return MaybeValue.any();
    } else if (this.isNothing) {
      return MaybeValue.nothing();
    } else {
      const value = fn(this.value);
      const type = typeof value;
      return new MaybeValue({type, value});
    }
  };
};

MaybeValue.prototype.not = MaybeValue._unaryOperation((value) => !value);

MaybeValue.prototype.typeof = MaybeValue._unaryOperation((value) => typeof value);

// eslint-disable-next-line eqeqeq
MaybeValue.prototype.equals = MaybeValue._binaryOperation((lhs, rhs) => lhs == rhs);

// eslint-disable-next-line eqeqeq
MaybeValue.prototype.notEquals = MaybeValue._binaryOperation((lhs, rhs) => lhs != rhs);

MaybeValue.prototype.strictEquals = MaybeValue._binaryOperation((lhs, rhs) => lhs === rhs);

MaybeValue.prototype.strictNotEquals = MaybeValue._binaryOperation((lhs, rhs) => lhs !== rhs);

