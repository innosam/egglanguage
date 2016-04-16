const fs = require('fs');
const console = require('console');

if(process.argv.length != 3)
{
  console.log("Error: No egg source file found");
}

var fileContent = fs.readFileSync( process.argv[2],"utf8");

function parse_egg(input)
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
     var result = parse_egg(input);
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
var ast = parse_egg(fileContent).exp;



function evals(ast, env)
{
  if(ast.type == "apply")
  {
    return env[ast.operator["name"]](ast.args, env);
  }
  else if(ast.type == "word")
  {
    return env[ast.name];
  }
  else if(ast.type == "value")
  {
    return ast.value;
  }
  console.log(ast);
  throw new Error("Unexpected expression " + ast.type);
}

var builtIn = {};

builtIn["do"] = function(args, env)
{
  var argn = args.length;
  var result = null;
  for( var i=0; i<(argn) ; i++ )
  {
    result = evals(args[i], env);
  }
  return result;
}

builtIn["define"] = function(args, env)
{
  if(args.length != 2 || args[0].type != "word")
  {
    throw Error("Number of arguements for define should be two");
  }
  
  var result  = evals(args[1],env) 
  env[args[0].name] = result;
  return result;
}

builtIn["if"] = function(args, env)
{
  if(args.length != 3)
  {
    throw Error("Number of arguements for if should be three");
  }
 
  var result  = evals(args[0],env) 
  if (result == true)
  {
     return evals(args[1], env);
  }
  if (result == false)
  {
     return evals(args[2], env);
  }

  throw new Error("first arguement should be a boolean value");
}

var ops= ["+", "-", "*", "/", "==", "<", ">"]
ops.forEach(function(op) 
{
  builtIn[op] = function(args, env) 
  {
    if(args.length != 2)
    {
      throw new Error("Expected only two arguments");
    }

    var op_func = new Function("a, b",  "return a " + op + " b;");
    return op_func(evals(args[0], env), evals(args[1], env));    
  }
});


builtIn["print"] = function(args, env)
{
  if(!(args.length >= 1))
  {
    throw Error("Number of arguement should be atleast one");
  }
 
  var argn = args.length;
  for(var i = 0; i < argn ; i++)
  {
    console.log(evals(args[i], env));
  }
}

var globals = Object.create(builtIn);

evals(ast, globals);

