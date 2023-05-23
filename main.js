const makeExpressionArray = require('./makeExpressionArray');
const convertExpressionToPreScript = require('./convertExpressionToPreScript');
const preScriptArrayToMongo = require('./psArrayToMongo');


const convertSLIToMongo = (str) => {

    const expArray = makeExpressionArray(str);

    const preScriptArray = convertExpressionToPreScript(expArray);

    const mongoObject = preScriptArrayToMongo(preScriptArray);

    return mongoObject;
}

module.exports = convertSLIToMongo;