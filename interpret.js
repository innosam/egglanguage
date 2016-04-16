const fs = require('fs');
const console = require('console');
eval(fs.readFileSync('interpret_lib.js')+'');


if(process.argv.length != 3)
{
  console.log("Error: No egg source file found");
}

var fileContent = fs.readFileSync( process.argv[2],"utf8");

var ast = parse_egg(fileContent).exp;
evaluate(ast);

