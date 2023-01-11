# dynalist-date-parser

## Usage

```js
const Parser = require('dynalist-date-parser');

const exampleNode = {
    "id": "<node id>",
    "content": "Get it done !(2020-08-22)",
    "note": "A date range !(2020-08-21 - 2020-08-23)",
    "checkbox": true,
    "created": 1552959309904,
    "modified": 1552959359783
};

const exampleString = 'Get it done !(2020-08-22)'; 

// Create new object and extract dates from node
let ddp = new Parser(exampleNode);
// let ddp = new Parser(exampleString);

// ddp.dates will contain an array of dates as parsed objects
console.log(ddp.dates);
// TODO: Example output

// Modify all dates on object
ddp.modifyDates(dt => {
    // TODO
});

// Modify just the date at index 1 of the dates array
ddp.modifyDates(dt => {
    // TODO
}, 1);

// Return the node/string with modified dates
const updatedNode = ddp.updateSource();

```

## Build webpack version

- Update `version` in package.json
- `npm rum webpack`
- Remove old versions from `dist/`
- `git add` the new version
