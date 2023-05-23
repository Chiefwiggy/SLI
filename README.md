# Command Line Parsing to MongoDB

In this project, our goal is to convert the following formatting rules of a search line interface into code which our database can parse.
The database we will be using for this project is MongoDB, and the project files for the backend will be included if you want to try this live.

## The Assignment

Our Search Line Interface should provide users the ability to query spells via different components. The formatting we will be using will be illustrated in the following examples:

#### Basic Query

> `name:acid`

This would return all spells which contain the word acid somewhere in their name.

> `z:wizard`

This would return all spells of the class "wizard"

But we may want the ability to do more advanced queries, and this is where the challenge of this assignment comes from

#### Case 1: AND, OR, XOR, NOT

These are our four operators that can be used as part of this SLI. Let's look at how they would be used.

> `name:acid & z:wizard`

This would look for all spells which are BOTH wizard spells and have "acid" in their name.

> `name:acid | z:wizard`

This would look for all spells which are EITHER wizard spells OR have "acid" in their name.

> `name:acid ^ z:wizard`

This would look for all spells which are EITHER wizard spells OR have "acid" in their name, but NOT both.

> `!name: acid`

This is a unary operator which would find all spells which do NOT contain the word acid in their name.

> `name: acid | z:wizard | l:3`

This would return all spells which are EITHER wizard spells, level 3, OR have acid in their name.

We can also mix and match, and this is where things can get a bit tricky.

Without parentheses, as seen in the next case, we interpret like this

> `name: acid & z:wizard | l:3`

It is up to interpretation how we would evaluate something like this, and in our case, all binary operators will have equal precedence, so this evaluates to `(name: acid & z:wizard) | l:3` which you will see how to deal with in the next topic.

#### Case 2: Parenthetical Expressions

We also may want the ability to lay out our logic with parentheses. Some examples include:

> `name:acid & (z:wizard | z:cleric)`

This would return all spells with acid in its name which are EITHER wizard OR cleric spells.

> `(name:acid | name:flame) & (z:wizard | z:cleric)`

This would return all spells with acid OR flame in its name which are EITHER wizard or cleric spells.

> `name:acid & (l:0 | (l:1 & (z:cleric | z:wizard | cm:false)))`

This is a more advanced query which would return all spells with acid in its name so long as it met one of the following conditions:
 - the spell is level 0
 OR
 - the spell is level 1 AND either a cleric spell, wizard spell OR does not have material components (cm:false)
 

### Command Line Parsing

Our first goal is to get our single line into a JSON object. The easiest way to do this would be spliting logical statements into groups of 3.

For example:

> `name:acid & z:wizard`

could become the object

```
    const query1 = [ "name:acid", "&", "z:wizard"]
```

##### Handling Parentheses

We may want to have a similar data structure to the command format with nested arrays. So for example:

> `name:acid & (z:cleric | z:wizard)`

could be expressed thusly

```
    const query2 = ["name:acid", "&", ["z:cleric", "|", "z:wizard"]]
```

Finally, an example of a way to handle a more complex query:

> `(name:acid & (l:3 | (l:4 & (name: rust | cm: true | cv: false))))`

```
    const query3 = [
        "name:acid",
        "&",
        [
            "l:3",
            "|",
            [
                "l:4",
                "&",
                [
                    "name: rust",
                    "|",
                    "cm: true",
                    "|",
                    "cv: false"
                ]
            ]
        ]
    ]
```


### MongoDB Conversion

So the goal of this project is to be able to turn any request in the format above into a request we can send to our mongodb database. For the following request:

> `(name:acid & (l:3 | (l:4 & (name: rust | cm: true | cv: false))))`

the mongodb format is:

```
{
      $and: [
        { name: 'acid' },
        {
          $or: [
            { l: 3 },
            {
              $and: [
                { l: 4 },
                {
                  $or: [
                    { name: 'rust' },
                    { cm: true },
                    { cv: false }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
```

Something interesting to notice about the mongodb format is that it used prefix operator format. That is to say, it writes expressions as:

> `AND, <ELEMENT 1>, <ELEMENT 2>`

whereas our SLI uses infix operator format:

> `<ELEMENT 1> AND <ELEMENT 2>`

### Hints
##### DO NOT READ UNLESS YOU ARE STUCK



<details>
<summary>Reveal Hint 1</summary>

#### Hint 1
Using the nested array structure we created above, it may help us if we were to convert that from infix notation to prefix notation.

</details>

<details>
<summary>Reveal Hint 2</summary>

#### Hint 2
Notice how for 3 elements, we don't have multiple ORs or ANDs in MongoDB, so we want to find a way to rewrite a statement like this:

`
['|', '|', "l:0","l:1","l:2"]
`

TO
`
['|', "l:0","l:1","l:2"]
`
</details>
 <details>
<summary>Reveal Hint 3</summary>
  
#### Hint 3

If you just want to get into the conversion part of the problem, this function will help you get there. It's not the most efficient way to do it, but that's something you can come back to later if you'd like.

```
const makeExpressionArray = (exp) => {
    exp = exp.trim();
    if (exp === "")
        return "";
    if (exp.charAt(0) === '(')
        exp = exp.substring(1, exp.length);
    let expArray = [];
    let depth = 0;
    let entered = false;
    let startIndex = 0;
    [...exp].forEach((e, index) => {
        if (e === '(') {
            depth++;
            entered = true;
        }
        else if (e === ')') {
            depth--;
        }
        if (!entered) {
            if (e === '|') {
                expArray.push(exp.substring(startIndex, index).trim());
                expArray.push("|");
                startIndex = index + 1;
            }
            else if (e === '&') {
                expArray.push(exp.substring(startIndex, index).trim());
                expArray.push("&");
                startIndex = index + 1;
            }
            else if (e === '^') {
                expArray.push(exp.substring(startIndex, index).trim());
                expArray.push("^");
                startIndex = index + 1;
            }
        }
        else {
            if (depth === 0) {
                expArray.push(makeExpressionArray(exp.substring(startIndex, index)));
                startIndex = index + 1;
                entered = false;
            }
        }
    });
    expArray.push(exp.substring(startIndex, exp.length).trim());
    expArray = expArray.filter((e) => e !== ' ' && e !== '');
    return expArray;
};
```
</details>








