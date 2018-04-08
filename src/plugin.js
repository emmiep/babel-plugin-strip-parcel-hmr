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
          const {type, value} = evaluator.evaluate(testExpressionPath);

          if (type) {
            updatePath(testExpressionPath.parentPath, value);
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
  const elseStatement = ifStatementPath.node.alternate;

  if (elseStatement) {
    ifStatementPath.replaceWith(elseStatement);
  } else {
    ifStatementPath.remove();
  }
}

function extractIfClause(ifStatementPath) {
  ifStatementPath.replaceWith(ifStatementPath.get('consequent'));
}

function removeConditionalExpression(conditionalStatementPath, testValue) {
  const valueExpression = conditionalStatementPath.get(testValue ? 'consequent' : 'alternate').node;
  conditionalStatementPath.replaceWith(valueExpression);
}

function TestExpressionEvaluator(options) {
  Object.assign(this, options);
}

TestExpressionEvaluator.prototype.evaluate = function evaluate(path) {
  if (path.isMemberExpression()) {
    return this._evaluateMemberExpression(path);
  } else if (path.isUnaryExpression()) {
    return this._evaluateUnaryExpression(path);
  }

  return {};
};

TestExpressionEvaluator.prototype._evaluateMemberExpression = function _evaluateMemberExpression(path) {
  const {objectName, propertyName} = this;

  if (isMember(path, {objectName, propertyName}) && isGlobalVariable(path.get('object'))) {
    return {type: 'undefined', value: undefined};
  }

  return {};
};

TestExpressionEvaluator.prototype._evaluateUnaryExpression = function _evaluateUnaryExpression(path) {
  if (path.isUnaryExpression({operator: '!'})) {
    const {type, value} = this.evaluate(path.get('argument'));

    if (type) {
      return {type: typeof(value), value: !value};
    }
  }

  return {};
};

