const convertSLIToMongo = require('./main');

const examples = [
    `name:acid`,
    `name:acid & z:wizard`,
    `name:acid & (z:wizard | z:cleric)`,
    `(name:acid | name:flame) & (z:wizard | z:cleric)`,
    `(name:acid & (l:3 | (l:4 & (name: rust | cm: true | cv: false))))`
]

examples.forEach((example, index) => {
    const result = convertSLIToMongo(example);
    console.log(`Test ${index+1}: ${JSON.stringify(result)}`);
})