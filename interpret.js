const fs = require('fs');
const console = require('console');

if(process.argv.length != 3)
{
  console.log("Error: No egg source file found");
}

var fileContent = fs.readFileSync( process.argv[2],"utf8");

function match_the_string(input)
{

   var token = {};
   var match = null;

   if(match = /^\s*"([^"]*)"/.exec(input))
   {
     token["value"] = match[1];
     token["type"] = "value";
   }
   else if(match = /^\s*(\d+)/.exec(input))
   {
     token["value"] = Number(match[1]);
     token["type"] = "value";
   }
   else if(match = /^\s*([^"(),]+\w*)/.exec(input))
   {
     token["name"] = match[1];
     token["type"] = "word";
   }
   else
   {
     throw new SyntaxError("Unexpected syntax: " + input);
   }

   input = input.slice(match[0].length);

   // Not an apply token.
   if(!(match = /^\s*\(/.exec(input)))
   {
     return {exp:token, rest:input};
   }

   var expression = { type : "apply", operator : token , args: []};

   // An Apply token.
   input = input.slice(match[0].length);
   while(!(match = /^\s*\)/.exec(input)))
   {
     var result = match_the_string(input);
     expression.args.push(result.exp);
     input = result.rest;
     if(match = /^\s*,/.exec(input))
     {
       input = input.slice(match[0].length);
     }
   }
   
   input = input.slice(match[0].length);
   
   return {exp:expression, rest:input};
}



var output = JSON.stringify(match_the_string(fileContent).exp);
console.log(output);
