'use strict';

const defaultOptions = {
  objectName: 'module',
  propertyName: 'hot'
};

module.exports = function plugin({types: t}) {
  return {
    visitor: {
      MemberExpression(path) {
        const {objectName, propertyName} = defaultOptions;

        if (!isMember(path, {objectName, propertyName})) return;
        if (!isGlobalVariable(path.get('object'))) return;
        if (!isIfTestExpression(path)) return;

        path.parentPath.remove();
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
      && expressionPath.parentPath.node.test === expressionPath.node;
  }
};

