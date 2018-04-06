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

        if (isIfTestExpression(path)) {
          removeIfStatement(path.parentPath);
        } else if (isConditionalTestExpression(path)) {
          removeConditionalExpression(path.parentPath, false);
        }
      }
    }
  };

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

  function isIfTestExpression(expressionPath) {
    return expressionPath.parentPath.isIfStatement()
      && expressionPath.key === 'test';
  }

  function isConditionalTestExpression(expressionPath) {
    return expressionPath.parentPath.isConditionalExpression()
      && expressionPath.key === 'test';
  }

  function removeIfStatement(ifStatementPath) {
    const elseStatement = ifStatementPath.node.alternate;

    if (elseStatement) {
      ifStatementPath.replaceWith(elseStatement);
    } else {
      ifStatementPath.remove();
    }
  }

  function removeConditionalExpression(conditionalStatementPath, testValue) {
    const valueExpression = conditionalStatementPath.get(testValue ? 'consequent' : 'alternate').node;
    conditionalStatementPath.replaceWith(valueExpression);
  }
};

