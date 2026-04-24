import{r as e,t}from"./rolldown-runtime-S-ySWqyJ.js";import{l as n}from"./blockly-D0AmV0q6.js";var{Order:r,PythonGenerator:i,pythonGenerator:a}=e(t(((e,t)=>{(function(r,i){typeof define==`function`&&define.amd?define([`./blockly_compressed.js`],i):typeof e==`object`?t.exports=i(n()):(r.python=i(r.Blockly),r.Blockly.Python=r.python.pythonGenerator)})(e,function(e){var t=e.__namespace__,n=function(e,t){return[`[]`,z.ATOMIC]},r=function(e,t){let n=Array(e.itemCount_);for(let r=0;r<e.itemCount_;r++)n[r]=t.valueToCode(e,`ADD`+r,z.NONE)||`None`;return[`[`+n.join(`, `)+`]`,z.ATOMIC]},i=function(e,t){let n=t.valueToCode(e,`ITEM`,z.NONE)||`None`;return e=t.valueToCode(e,`NUM`,z.MULTIPLICATIVE)||`0`,[`[`+n+`] * `+e,z.MULTIPLICATIVE]},a=function(e,t){return[`len(`+(t.valueToCode(e,`VALUE`,z.NONE)||`[]`)+`)`,z.FUNCTION_CALL]},o=function(e,t){return[`not len(`+(t.valueToCode(e,`VALUE`,z.NONE)||`[]`)+`)`,z.LOGICAL_NOT]},s=function(e,t){let n=t.valueToCode(e,`FIND`,z.NONE)||`[]`,r=t.valueToCode(e,`VALUE`,z.NONE)||`''`,i=` -1`,a=``,o=` - 1`;return e.workspace.options.oneBasedIndex&&(i=` 0`,a=` + 1`,o=``),[(e.getFieldValue(`END`)===`FIRST`?t.provideFunction_(`first_index`,`
def ${t.FUNCTION_NAME_PLACEHOLDER_}(my_list, elem):
  try: index = my_list.index(elem)${a}
  except: index =${i}
  return index
`):t.provideFunction_(`last_index`,`
def ${t.FUNCTION_NAME_PLACEHOLDER_}(my_list, elem):
  try: index = len(my_list) - my_list[::-1].index(elem)${o}
  except: index =${i}
  return index
`))+`(`+r+`, `+n+`)`,z.FUNCTION_CALL]},c=function(e,t){let n=e.getFieldValue(`MODE`)||`GET`,r=e.getFieldValue(`WHERE`)||`FROM_START`;var i=t.valueToCode(e,`VALUE`,r===`RANDOM`?z.NONE:z.MEMBER)||`[]`;switch(r){case`FIRST`:if(n===`GET`)return[i+`[0]`,z.MEMBER];if(n===`GET_REMOVE`)return[i+`.pop(0)`,z.FUNCTION_CALL];if(n===`REMOVE`)return i+`.pop(0)
`;break;case`LAST`:if(n===`GET`)return[i+`[-1]`,z.MEMBER];if(n===`GET_REMOVE`)return[i+`.pop()`,z.FUNCTION_CALL];if(n===`REMOVE`)return i+`.pop()
`;break;case`FROM_START`:if(e=t.getAdjustedInt(e,`AT`),n===`GET`)return[i+`[`+e+`]`,z.MEMBER];if(n===`GET_REMOVE`)return[i+`.pop(`+e+`)`,z.FUNCTION_CALL];if(n===`REMOVE`)return i+`.pop(`+e+`)
`;break;case`FROM_END`:if(e=t.getAdjustedInt(e,`AT`,1,!0),n===`GET`)return[i+`[`+e+`]`,z.MEMBER];if(n===`GET_REMOVE`)return[i+`.pop(`+e+`)`,z.FUNCTION_CALL];if(n===`REMOVE`)return i+`.pop(`+e+`)
`;break;case`RANDOM`:if(t.definitions_.import_random=`import random`,n===`GET`)return[`random.choice(`+i+`)`,z.FUNCTION_CALL];if(i=t.provideFunction_(`lists_remove_random_item`,`
def ${t.FUNCTION_NAME_PLACEHOLDER_}(myList):
  x = int(random.random() * len(myList))
  return myList.pop(x)
`)+`(`+i+`)`,n===`GET_REMOVE`)return[i,z.FUNCTION_CALL];if(n===`REMOVE`)return i+`
`}throw Error(`Unhandled combination (lists_getIndex).`)},l=function(e,n){let r=n.valueToCode(e,`LIST`,z.MEMBER)||`[]`,i=e.getFieldValue(`MODE`)||`GET`;var a=e.getFieldValue(`WHERE`)||`FROM_START`;let o=n.valueToCode(e,`TO`,z.NONE)||`None`;switch(a){case`FIRST`:if(i===`SET`)return r+`[0] = `+o+`
`;if(i===`INSERT`)return r+`.insert(0, `+o+`)
`;break;case`LAST`:if(i===`SET`)return r+`[-1] = `+o+`
`;if(i===`INSERT`)return r+`.append(`+o+`)
`;break;case`FROM_START`:if(n=n.getAdjustedInt(e,`AT`),i===`SET`)return r+`[`+n+`] = `+o+`
`;if(i===`INSERT`)return r+`.insert(`+n+`, `+o+`)
`;break;case`FROM_END`:if(n=n.getAdjustedInt(e,`AT`,1,!0),i===`SET`)return r+`[`+n+`] = `+o+`
`;if(i===`INSERT`)return r+`.insert(`+n+`, `+o+`)
`;break;case`RANDOM`:if(n.definitions_.import_random=`import random`,r.match(/^\w+$/)?e=``:(e=n.nameDB_.getDistinctName(`tmp_list`,t.NameType$$module$build$src$core$names.VARIABLE),a=e+` = `+r+`
`,r=e,e=a),n=n.nameDB_.getDistinctName(`tmp_x`,t.NameType$$module$build$src$core$names.VARIABLE),e+=n+` = int(random.random() * len(`+r+`))
`,i===`SET`)return e+(r+`[`+n+`] = `+o+`
`);if(i===`INSERT`)return e+(r+`.insert(`+n+`, `+o+`)
`)}throw Error(`Unhandled combination (lists_setIndex).`)},u=function(e,n){let r=n.valueToCode(e,`LIST`,z.MEMBER)||`[]`;var i=e.getFieldValue(`WHERE1`);let a=e.getFieldValue(`WHERE2`);switch(i){case`FROM_START`:i=n.getAdjustedInt(e,`AT1`),i===0&&(i=``);break;case`FROM_END`:i=n.getAdjustedInt(e,`AT1`,1,!0);break;case`FIRST`:i=``;break;default:throw Error(`Unhandled option (lists_getSublist)`)}switch(a){case`FROM_START`:e=n.getAdjustedInt(e,`AT2`,1);break;case`FROM_END`:e=n.getAdjustedInt(e,`AT2`,0,!0),t.isNumber$$module$build$src$core$utils$string(String(e))?e===0&&(e=``):(n.definitions_.import_sys=`import sys`,e+=` or sys.maxsize`);break;case`LAST`:e=``;break;default:throw Error(`Unhandled option (lists_getSublist)`)}return[r+`[`+i+` : `+e+`]`,z.MEMBER]},d=function(e,t){let n=t.valueToCode(e,`LIST`,z.NONE)||`[]`,r=e.getFieldValue(`TYPE`);return e=e.getFieldValue(`DIRECTION`)===`1`?`False`:`True`,[t.provideFunction_(`lists_sort`,`
def ${t.FUNCTION_NAME_PLACEHOLDER_}(my_list, type, reverse):
  def try_float(s):
    try:
      return float(s)
    except:
      return 0
  key_funcs = {
    "NUMERIC": try_float,
    "TEXT": str,
    "IGNORE_CASE": lambda s: str(s).lower()
  }
  key_func = key_funcs[type]
  list_cpy = list(my_list)
  return sorted(list_cpy, key=key_func, reverse=reverse)
`)+`(`+n+`, "`+r+`", `+e+`)`,z.FUNCTION_CALL]},ee=function(e,t){var n=e.getFieldValue(`MODE`);if(n===`SPLIT`)n=t.valueToCode(e,`INPUT`,z.MEMBER)||`''`,e=t.valueToCode(e,`DELIM`,z.NONE),e=n+`.split(`+e+`)`;else if(n===`JOIN`)n=t.valueToCode(e,`INPUT`,z.NONE)||`[]`,e=(t.valueToCode(e,`DELIM`,z.MEMBER)||`''`)+`.join(`+n+`)`;else throw Error(`Unknown mode: `+n);return[e,z.FUNCTION_CALL]},te=function(e,t){return[`list(reversed(`+(t.valueToCode(e,`LIST`,z.NONE)||`[]`)+`))`,z.FUNCTION_CALL]},f=function(e,t){let n=0,r=``,i,a;t.STATEMENT_PREFIX&&(r+=t.injectId(t.STATEMENT_PREFIX,e));do a=t.valueToCode(e,`IF`+n,z.NONE)||`False`,i=t.statementToCode(e,`DO`+n)||t.PASS,t.STATEMENT_SUFFIX&&(i=t.prefixLines(t.injectId(t.STATEMENT_SUFFIX,e),t.INDENT)+i),r+=(n===0?`if `:`elif `)+a+`:
`+i,n++;while(e.getInput(`IF`+n));return(e.getInput(`ELSE`)||t.STATEMENT_SUFFIX)&&(i=e.getInput(`ELSE`)&&t.statementToCode(e,`ELSE`)||t.PASS,t.STATEMENT_SUFFIX&&(i=t.prefixLines(t.injectId(t.STATEMENT_SUFFIX,e),t.INDENT)+i),r+=`else:
`+i),r},ne=function(e,t){let n={EQ:`==`,NEQ:`!=`,LT:`<`,LTE:`<=`,GT:`>`,GTE:`>=`}[e.getFieldValue(`OP`)],r=z.RELATIONAL,i=t.valueToCode(e,`A`,r)||`0`;return e=t.valueToCode(e,`B`,r)||`0`,[i+` `+n+` `+e,r]},re=function(e,t){let n=e.getFieldValue(`OP`)===`AND`?`and`:`or`,r=n===`and`?z.LOGICAL_AND:z.LOGICAL_OR,i=t.valueToCode(e,`A`,r);return e=t.valueToCode(e,`B`,r),i||e?(t=n===`and`?`True`:`False`,i||=t,e||=t):e=i=`False`,[i+` `+n+` `+e,r]},ie=function(e,t){return[`not `+(t.valueToCode(e,`BOOL`,z.LOGICAL_NOT)||`True`),z.LOGICAL_NOT]},ae=function(e,t){return[e.getFieldValue(`BOOL`)===`TRUE`?`True`:`False`,z.ATOMIC]},oe=function(e,t){return[`None`,z.ATOMIC]},p=function(e,t){let n=t.valueToCode(e,`IF`,z.CONDITIONAL)||`False`,r=t.valueToCode(e,`THEN`,z.CONDITIONAL)||`None`;return e=t.valueToCode(e,`ELSE`,z.CONDITIONAL)||`None`,[r+` if `+n+` else `+e,z.CONDITIONAL]},m=function(e,n){let r;r=e.getField(`TIMES`)?String(parseInt(e.getFieldValue(`TIMES`),10)):n.valueToCode(e,`TIMES`,z.NONE)||`0`,r=t.isNumber$$module$build$src$core$utils$string(r)?parseInt(r,10):`int(`+r+`)`;let i=n.statementToCode(e,`DO`);return i=n.addLoopTrap(i,e)||n.PASS,`for `+n.nameDB_.getDistinctName(`count`,t.NameType$$module$build$src$core$names.VARIABLE)+` in range(`+r+`):
`+i},se=function(e,t){let n=e.getFieldValue(`MODE`)===`UNTIL`,r=t.valueToCode(e,`BOOL`,n?z.LOGICAL_NOT:z.NONE)||`False`,i=t.statementToCode(e,`DO`);return i=t.addLoopTrap(i,e)||t.PASS,n&&(r=`not `+r),`while `+r+`:
`+i},h=function(e,n){let r=n.getVariableName(e.getFieldValue(`VAR`));var i=n.valueToCode(e,`FROM`,z.NONE)||`0`,a=n.valueToCode(e,`TO`,z.NONE)||`0`,o=n.valueToCode(e,`BY`,z.NONE)||`1`;let s=n.statementToCode(e,`DO`);s=n.addLoopTrap(s,e)||n.PASS;let c=``;e=function(){return n.provideFunction_(`upRange`,`
def ${n.FUNCTION_NAME_PLACEHOLDER_}(start, stop, step):
  while start <= stop:
    yield start
    start += abs(step)
`)};let l=function(){return n.provideFunction_(`downRange`,`
def ${n.FUNCTION_NAME_PLACEHOLDER_}(start, stop, step):
  while start >= stop:
    yield start
    start -= abs(step)
`)};if(t.isNumber$$module$build$src$core$utils$string(i)&&t.isNumber$$module$build$src$core$utils$string(a)&&t.isNumber$$module$build$src$core$utils$string(o))i=Number(i),a=Number(a),o=Math.abs(Number(o)),i%1==0&&a%1==0&&o%1==0?(i<=a?(a++,e=i===0&&o===1?a:i+`, `+a,o!==1&&(e+=`, `+o)):(a--,e=i+`, `+a+`, -`+o),e=`range(`+e+`)`):(e=i<a?e():l(),e+=`(`+i+`, `+a+`, `+o+`)`);else{let s=function(e,i){return t.isNumber$$module$build$src$core$utils$string(e)?e=String(Number(e)):e.match(/^\w+$/)||(i=n.nameDB_.getDistinctName(r+i,t.NameType$$module$build$src$core$names.VARIABLE),c+=i+` = `+e+`
`,e=i),e};i=s(i,`_start`),a=s(a,`_end`),o=s(o,`_inc`),typeof i==`number`&&typeof a==`number`?(e=i<a?e():l(),e+=`(`+i+`, `+a+`, `+o+`)`):e=`(`+i+` <= `+a+`) and `+e()+`(`+i+`, `+a+`, `+o+`) or `+l()+`(`+i+`, `+a+`, `+o+`)`}return c+=`for `+r+` in `+e+`:
`+s},g=function(e,t){let n=t.getVariableName(e.getFieldValue(`VAR`)),r=t.valueToCode(e,`LIST`,z.RELATIONAL)||`[]`,i=t.statementToCode(e,`DO`);return i=t.addLoopTrap(i,e)||t.PASS,`for `+n+` in `+r+`:
`+i},ce=function(e,t){let n=``;if(t.STATEMENT_PREFIX&&(n+=t.injectId(t.STATEMENT_PREFIX,e)),t.STATEMENT_SUFFIX&&(n+=t.injectId(t.STATEMENT_SUFFIX,e)),t.STATEMENT_PREFIX){let r=e.getSurroundLoop();r&&!r.suppressPrefixSuffix&&(n+=t.injectId(t.STATEMENT_PREFIX,r))}switch(e.getFieldValue(`FLOW`)){case`BREAK`:return n+`break
`;case`CONTINUE`:return n+`continue
`}throw Error(`Unknown flow statement.`)},le=function(e,t){return e=Number(e.getFieldValue(`NUM`)),e===1/0?[`float("inf")`,z.FUNCTION_CALL]:e===-1/0?[`-float("inf")`,z.UNARY_SIGN]:[String(e),e<0?z.UNARY_SIGN:z.ATOMIC]},ue=function(e,t){var n={ADD:[` + `,z.ADDITIVE],MINUS:[` - `,z.ADDITIVE],MULTIPLY:[` * `,z.MULTIPLICATIVE],DIVIDE:[` / `,z.MULTIPLICATIVE],POWER:[` ** `,z.EXPONENTIATION]}[e.getFieldValue(`OP`)];let r=n[0];n=n[1];let i=t.valueToCode(e,`A`,n)||`0`;return e=t.valueToCode(e,`B`,n)||`0`,[i+r+e,n]},_=function(e,t){let n=e.getFieldValue(`OP`),r;if(n===`NEG`)return r=t.valueToCode(e,`NUM`,z.UNARY_SIGN)||`0`,[`-`+r,z.UNARY_SIGN];switch(t.definitions_.import_math=`import math`,e=n===`SIN`||n===`COS`||n===`TAN`?t.valueToCode(e,`NUM`,z.MULTIPLICATIVE)||`0`:t.valueToCode(e,`NUM`,z.NONE)||`0`,n){case`ABS`:r=`math.fabs(`+e+`)`;break;case`ROOT`:r=`math.sqrt(`+e+`)`;break;case`LN`:r=`math.log(`+e+`)`;break;case`LOG10`:r=`math.log10(`+e+`)`;break;case`EXP`:r=`math.exp(`+e+`)`;break;case`POW10`:r=`math.pow(10,`+e+`)`;break;case`ROUND`:r=`round(`+e+`)`;break;case`ROUNDUP`:r=`math.ceil(`+e+`)`;break;case`ROUNDDOWN`:r=`math.floor(`+e+`)`;break;case`SIN`:r=`math.sin(`+e+` / 180.0 * math.pi)`;break;case`COS`:r=`math.cos(`+e+` / 180.0 * math.pi)`;break;case`TAN`:r=`math.tan(`+e+` / 180.0 * math.pi)`}if(r)return[r,z.FUNCTION_CALL];switch(n){case`ASIN`:r=`math.asin(`+e+`) / math.pi * 180`;break;case`ACOS`:r=`math.acos(`+e+`) / math.pi * 180`;break;case`ATAN`:r=`math.atan(`+e+`) / math.pi * 180`;break;default:throw Error(`Unknown math operator: `+n)}return[r,z.MULTIPLICATIVE]},de=function(e,t){let n={PI:[`math.pi`,z.MEMBER],E:[`math.e`,z.MEMBER],GOLDEN_RATIO:[`(1 + math.sqrt(5)) / 2`,z.MULTIPLICATIVE],SQRT2:[`math.sqrt(2)`,z.MEMBER],SQRT1_2:[`math.sqrt(1.0 / 2)`,z.MEMBER],INFINITY:[`float('inf')`,z.ATOMIC]};return e=e.getFieldValue(`CONSTANT`),e!==`INFINITY`&&(t.definitions_.import_math=`import math`),n[e]},fe=function(e,t){var n={EVEN:[` % 2 == 0`,z.MULTIPLICATIVE,z.RELATIONAL],ODD:[` % 2 == 1`,z.MULTIPLICATIVE,z.RELATIONAL],WHOLE:[` % 1 == 0`,z.MULTIPLICATIVE,z.RELATIONAL],POSITIVE:[` > 0`,z.RELATIONAL,z.RELATIONAL],NEGATIVE:[` < 0`,z.RELATIONAL,z.RELATIONAL],DIVISIBLE_BY:[null,z.MULTIPLICATIVE,z.RELATIONAL],PRIME:[null,z.NONE,z.FUNCTION_CALL]};let r=e.getFieldValue(`PROPERTY`),[i,a,o]=n[r];if(n=t.valueToCode(e,`NUMBER_TO_CHECK`,a)||`0`,r===`PRIME`)t.definitions_.import_math=`import math`,t.definitions_.from_numbers_import_Number=`from numbers import Number`,e=t.provideFunction_(`math_isPrime`,`
def ${t.FUNCTION_NAME_PLACEHOLDER_}(n):
  # https://en.wikipedia.org/wiki/Primality_test#Naive_methods
  # If n is not a number but a string, try parsing it.
  if not isinstance(n, Number):
    try:
      n = float(n)
    except:
      return False
  if n == 2 or n == 3:
    return True
  # False if n is negative, is 1, or not whole, or if n is divisible by 2 or 3.
  if n <= 1 or n % 1 != 0 or n % 2 == 0 or n % 3 == 0:
    return False
  # Check all the numbers of form 6k +/- 1, up to sqrt(n).
  for x in range(6, int(math.sqrt(n)) + 2, 6):
    if n % (x - 1) == 0 or n % (x + 1) == 0:
      return False
  return True
`)+`(`+n+`)`;else if(r===`DIVISIBLE_BY`){if(e=t.valueToCode(e,`DIVISOR`,z.MULTIPLICATIVE)||`0`,e===`0`)return[`False`,z.ATOMIC];e=n+` % `+e+` == 0`}else e=n+i;return[e,o]},pe=function(e,t){t.definitions_.from_numbers_import_Number=`from numbers import Number`;let n=t.valueToCode(e,`DELTA`,z.ADDITIVE)||`0`;return e=t.getVariableName(e.getFieldValue(`VAR`)),e+` = (`+e+` if isinstance(`+e+`, Number) else 0) + `+n+`
`},me=function(e,t){let n=e.getFieldValue(`OP`);switch(e=t.valueToCode(e,`LIST`,z.NONE)||`[]`,n){case`SUM`:t=`sum(`+e+`)`;break;case`MIN`:t=`min(`+e+`)`;break;case`MAX`:t=`max(`+e+`)`;break;case`AVERAGE`:t.definitions_.from_numbers_import_Number=`from numbers import Number`,t=t.provideFunction_(`math_mean`,`
def ${t.FUNCTION_NAME_PLACEHOLDER_}(myList):
  localList = [e for e in myList if isinstance(e, Number)]
  if not localList: return
  return float(sum(localList)) / len(localList)
`)+`(`+e+`)`;break;case`MEDIAN`:t.definitions_.from_numbers_import_Number=`from numbers import Number`,t=t.provideFunction_(`math_median`,`
def ${t.FUNCTION_NAME_PLACEHOLDER_}(myList):
  localList = sorted([e for e in myList if isinstance(e, Number)])
  if not localList: return
  if len(localList) % 2 == 0:
    return (localList[len(localList) // 2 - 1] + localList[len(localList) // 2]) / 2.0
  else:
    return localList[(len(localList) - 1) // 2]
`)+`(`+e+`)`;break;case`MODE`:t=t.provideFunction_(`math_modes`,`
def ${t.FUNCTION_NAME_PLACEHOLDER_}(some_list):
  modes = []
  # Using a lists of [item, count] to keep count rather than dict
  # to avoid "unhashable" errors when the counted item is itself a list or dict.
  counts = []
  maxCount = 1
  for item in some_list:
    found = False
    for count in counts:
      if count[0] == item:
        count[1] += 1
        maxCount = max(maxCount, count[1])
        found = True
    if not found:
      counts.append([item, 1])
  for counted_item, item_count in counts:
    if item_count == maxCount:
      modes.append(counted_item)
  return modes
`)+`(`+e+`)`;break;case`STD_DEV`:t.definitions_.import_math=`import math`,t=t.provideFunction_(`math_standard_deviation`,`
def ${t.FUNCTION_NAME_PLACEHOLDER_}(numbers):
  n = len(numbers)
  if n == 0: return
  mean = float(sum(numbers)) / n
  variance = sum((x - mean) ** 2 for x in numbers) / n
  return math.sqrt(variance)
`)+`(`+e+`)`;break;case`RANDOM`:t.definitions_.import_random=`import random`,t=`random.choice(`+e+`)`;break;default:throw Error(`Unknown operator: `+n)}return[t,z.FUNCTION_CALL]},he=function(e,t){let n=t.valueToCode(e,`DIVIDEND`,z.MULTIPLICATIVE)||`0`;return e=t.valueToCode(e,`DIVISOR`,z.MULTIPLICATIVE)||`0`,[n+` % `+e,z.MULTIPLICATIVE]},ge=function(e,t){let n=t.valueToCode(e,`VALUE`,z.NONE)||`0`,r=t.valueToCode(e,`LOW`,z.NONE)||`0`;return e=t.valueToCode(e,`HIGH`,z.NONE)||`float('inf')`,[`min(max(`+n+`, `+r+`), `+e+`)`,z.FUNCTION_CALL]},_e=function(e,t){t.definitions_.import_random=`import random`;let n=t.valueToCode(e,`FROM`,z.NONE)||`0`;return e=t.valueToCode(e,`TO`,z.NONE)||`0`,[`random.randint(`+n+`, `+e+`)`,z.FUNCTION_CALL]},v=function(e,t){return t.definitions_.import_random=`import random`,[`random.random()`,z.FUNCTION_CALL]},y=function(e,t){t.definitions_.import_math=`import math`;let n=t.valueToCode(e,`X`,z.NONE)||`0`;return[`math.atan2(`+(t.valueToCode(e,`Y`,z.NONE)||`0`)+`, `+n+`) / math.pi * 180`,z.MULTIPLICATIVE]},b=function(e,n){var r=[],i=e.workspace,a=t.allUsedVarModels$$module$build$src$core$variables(i)||[];for(var o of a)a=o.getName(),e.getVars().includes(a)||r.push(n.getVariableName(a));for(i=t.allDeveloperVariables$$module$build$src$core$variables(i),o=0;o<i.length;o++)r.push(n.nameDB_.getName(i[o],t.NameType$$module$build$src$core$names.DEVELOPER_VARIABLE));i=r.length?n.INDENT+`global `+r.join(`, `)+`
`:``,r=n.getProcedureName(e.getFieldValue(`NAME`)),o=``,n.STATEMENT_PREFIX&&(o+=n.injectId(n.STATEMENT_PREFIX,e)),n.STATEMENT_SUFFIX&&(o+=n.injectId(n.STATEMENT_SUFFIX,e)),o&&=n.prefixLines(o,n.INDENT),a=``,n.INFINITE_LOOP_TRAP&&(a=n.prefixLines(n.injectId(n.INFINITE_LOOP_TRAP,e),n.INDENT));let s=``;e.getInput(`STACK`)&&(s=n.statementToCode(e,`STACK`));let c=``;e.getInput(`RETURN`)&&(c=n.valueToCode(e,`RETURN`,z.NONE)||``);let l=``;s&&c&&(l=o),c?c=n.INDENT+`return `+c+`
`:s||=n.PASS;let u=[],d=e.getVars();for(let e=0;e<d.length;e++)u[e]=n.getVariableName(d[e]);return i=`def `+r+`(`+u.join(`, `)+`):
`+i+o+a+s+l+c,i=n.scrub_(e,i),n.definitions_[`%`+r]=i,null},x=function(e,t){let n=t.getProcedureName(e.getFieldValue(`NAME`)),r=[],i=e.getVars();for(let n=0;n<i.length;n++)r[n]=t.valueToCode(e,`ARG`+n,z.NONE)||`None`;return[n+`(`+r.join(`, `)+`)`,z.FUNCTION_CALL]},S=function(e,t){return t.forBlock.procedures_callreturn(e,t)[0]+`
`},C=function(e,t){let n=`if `+(t.valueToCode(e,`CONDITION`,z.NONE)||`False`)+`:
`;return t.STATEMENT_SUFFIX&&(n+=t.prefixLines(t.injectId(t.STATEMENT_SUFFIX,e),t.INDENT)),e.hasReturnValue_?(e=t.valueToCode(e,`VALUE`,z.NONE)||`None`,n+=t.INDENT+`return `+e+`
`):n+=t.INDENT+`return
`,n},w=function(e,t){return[t.quote_(e.getFieldValue(`TEXT`)),z.ATOMIC]},T=function(e,n){switch(e.itemCount_){case 0:return[`''`,z.ATOMIC];case 1:return e=n.valueToCode(e,`ADD0`,z.NONE)||`''`,q(e);case 2:var r=n.valueToCode(e,`ADD0`,z.NONE)||`''`;return e=n.valueToCode(e,`ADD1`,z.NONE)||`''`,[q(r)[0]+` + `+q(e)[0],z.ADDITIVE];default:r=[];for(let t=0;t<e.itemCount_;t++)r[t]=n.valueToCode(e,`ADD`+t,z.NONE)||`''`;return e=n.nameDB_.getDistinctName(`x`,t.NameType$$module$build$src$core$names.VARIABLE),[`''.join([str(`+e+`) for `+e+` in [`+r.join(`, `)+`]])`,z.FUNCTION_CALL]}},E=function(e,t){let n=t.getVariableName(e.getFieldValue(`VAR`));return e=t.valueToCode(e,`TEXT`,z.NONE)||`''`,n+` = str(`+n+`) + `+q(e)[0]+`
`},D=function(e,t){return[`len(`+(t.valueToCode(e,`VALUE`,z.NONE)||`''`)+`)`,z.FUNCTION_CALL]},O=function(e,t){return[`not len(`+(t.valueToCode(e,`VALUE`,z.NONE)||`''`)+`)`,z.LOGICAL_NOT]},k=function(e,t){let n=e.getFieldValue(`END`)===`FIRST`?`find`:`rfind`,r=t.valueToCode(e,`FIND`,z.NONE)||`''`;return t=(t.valueToCode(e,`VALUE`,z.MEMBER)||`''`)+`.`+n+`(`+r+`)`,e.workspace.options.oneBasedIndex?[t+` + 1`,z.ADDITIVE]:[t,z.FUNCTION_CALL]},A=function(e,t){let n=e.getFieldValue(`WHERE`)||`FROM_START`,r=t.valueToCode(e,`VALUE`,n===`RANDOM`?z.NONE:z.MEMBER)||`''`;switch(n){case`FIRST`:return[r+`[0]`,z.MEMBER];case`LAST`:return[r+`[-1]`,z.MEMBER];case`FROM_START`:return e=t.getAdjustedInt(e,`AT`),[r+`[`+e+`]`,z.MEMBER];case`FROM_END`:return e=t.getAdjustedInt(e,`AT`,1,!0),[r+`[`+e+`]`,z.MEMBER];case`RANDOM`:return t.definitions_.import_random=`import random`,[t.provideFunction_(`text_random_letter`,`
def ${t.FUNCTION_NAME_PLACEHOLDER_}(text):
  x = int(random.random() * len(text))
  return text[x]
`)+`(`+r+`)`,z.FUNCTION_CALL]}throw Error(`Unhandled option (text_charAt).`)},j=function(e,n){var r=e.getFieldValue(`WHERE1`);let i=e.getFieldValue(`WHERE2`),a=n.valueToCode(e,`STRING`,z.MEMBER)||`''`;switch(r){case`FROM_START`:r=n.getAdjustedInt(e,`AT1`),r===0&&(r=``);break;case`FROM_END`:r=n.getAdjustedInt(e,`AT1`,1,!0);break;case`FIRST`:r=``;break;default:throw Error(`Unhandled option (text_getSubstring)`)}switch(i){case`FROM_START`:e=n.getAdjustedInt(e,`AT2`,1);break;case`FROM_END`:e=n.getAdjustedInt(e,`AT2`,0,!0),t.isNumber$$module$build$src$core$utils$string(String(e))?e===0&&(e=``):(n.definitions_.import_sys=`import sys`,e+=` or sys.maxsize`);break;case`LAST`:e=``;break;default:throw Error(`Unhandled option (text_getSubstring)`)}return[a+`[`+r+` : `+e+`]`,z.MEMBER]},M=function(e,t){let n={UPPERCASE:`.upper()`,LOWERCASE:`.lower()`,TITLECASE:`.title()`}[e.getFieldValue(`CASE`)];return[(t.valueToCode(e,`TEXT`,z.MEMBER)||`''`)+n,z.FUNCTION_CALL]},N=function(e,t){let n={LEFT:`.lstrip()`,RIGHT:`.rstrip()`,BOTH:`.strip()`}[e.getFieldValue(`MODE`)];return[(t.valueToCode(e,`TEXT`,z.MEMBER)||`''`)+n,z.FUNCTION_CALL]},P=function(e,t){return`print(`+(t.valueToCode(e,`TEXT`,z.NONE)||`''`)+`)
`},F=function(e,t){var n=t.provideFunction_(`text_prompt`,`
def ${t.FUNCTION_NAME_PLACEHOLDER_}(msg):
  try:
    return raw_input(msg)
  except NameError:
    return input(msg)
`);return t=e.getField(`TEXT`)?t.quote_(e.getFieldValue(`TEXT`)):t.valueToCode(e,`TEXT`,z.NONE)||`''`,n=n+`(`+t+`)`,e.getFieldValue(`TYPE`)===`NUMBER`&&(n=`float(`+n+`)`),[n,z.FUNCTION_CALL]},I=function(e,t){let n=t.valueToCode(e,`TEXT`,z.MEMBER)||`''`;return e=t.valueToCode(e,`SUB`,z.NONE)||`''`,[n+`.count(`+e+`)`,z.FUNCTION_CALL]},ve=function(e,t){let n=t.valueToCode(e,`TEXT`,z.MEMBER)||`''`,r=t.valueToCode(e,`FROM`,z.NONE)||`''`;return e=t.valueToCode(e,`TO`,z.NONE)||`''`,[n+`.replace(`+r+`, `+e+`)`,z.MEMBER]},ye=function(e,t){return[(t.valueToCode(e,`TEXT`,z.MEMBER)||`''`)+`[::-1]`,z.MEMBER]},L=function(e,t){return[t.getVariableName(e.getFieldValue(`VAR`)),z.ATOMIC]},R=function(e,t){let n=t.valueToCode(e,`VALUE`,z.NONE)||`0`;return t.getVariableName(e.getFieldValue(`VAR`))+` = `+n+`
`},z;(function(e){e[e.ATOMIC=0]=`ATOMIC`,e[e.COLLECTION=1]=`COLLECTION`,e[e.STRING_CONVERSION=1]=`STRING_CONVERSION`,e[e.MEMBER=2.1]=`MEMBER`,e[e.FUNCTION_CALL=2.2]=`FUNCTION_CALL`,e[e.EXPONENTIATION=3]=`EXPONENTIATION`,e[e.UNARY_SIGN=4]=`UNARY_SIGN`,e[e.BITWISE_NOT=4]=`BITWISE_NOT`,e[e.MULTIPLICATIVE=5]=`MULTIPLICATIVE`,e[e.ADDITIVE=6]=`ADDITIVE`,e[e.BITWISE_SHIFT=7]=`BITWISE_SHIFT`,e[e.BITWISE_AND=8]=`BITWISE_AND`,e[e.BITWISE_XOR=9]=`BITWISE_XOR`,e[e.BITWISE_OR=10]=`BITWISE_OR`,e[e.RELATIONAL=11]=`RELATIONAL`,e[e.LOGICAL_NOT=12]=`LOGICAL_NOT`,e[e.LOGICAL_AND=13]=`LOGICAL_AND`,e[e.LOGICAL_OR=14]=`LOGICAL_OR`,e[e.CONDITIONAL=15]=`CONDITIONAL`,e[e.LAMBDA=16]=`LAMBDA`,e[e.NONE=99]=`NONE`})(z||={});var B=class extends t.CodeGenerator$$module$build$src$core$generator{constructor(e=`Python`){super(e),this.ORDER_OVERRIDES=[[z.FUNCTION_CALL,z.MEMBER],[z.FUNCTION_CALL,z.FUNCTION_CALL],[z.MEMBER,z.MEMBER],[z.MEMBER,z.FUNCTION_CALL],[z.LOGICAL_NOT,z.LOGICAL_NOT],[z.LOGICAL_AND,z.LOGICAL_AND],[z.LOGICAL_OR,z.LOGICAL_OR]],this.PASS=``,this.isInitialized=!1;for(let t in z)e=z[t],typeof e!=`string`&&(this[`ORDER_`+t]=e);this.addReservedWords(`False,None,True,and,as,assert,break,class,continue,def,del,elif,else,except,exec,finally,for,from,global,if,import,in,is,lambda,nonlocal,not,or,pass,print,raise,return,try,while,with,yield,NotImplemented,Ellipsis,__debug__,quit,exit,copyright,license,credits,ArithmeticError,AssertionError,AttributeError,BaseException,BlockingIOError,BrokenPipeError,BufferError,BytesWarning,ChildProcessError,ConnectionAbortedError,ConnectionError,ConnectionRefusedError,ConnectionResetError,DeprecationWarning,EOFError,Ellipsis,EnvironmentError,Exception,FileExistsError,FileNotFoundError,FloatingPointError,FutureWarning,GeneratorExit,IOError,ImportError,ImportWarning,IndentationError,IndexError,InterruptedError,IsADirectoryError,KeyError,KeyboardInterrupt,LookupError,MemoryError,ModuleNotFoundError,NameError,NotADirectoryError,NotImplemented,NotImplementedError,OSError,OverflowError,PendingDeprecationWarning,PermissionError,ProcessLookupError,RecursionError,ReferenceError,ResourceWarning,RuntimeError,RuntimeWarning,StandardError,StopAsyncIteration,StopIteration,SyntaxError,SyntaxWarning,SystemError,SystemExit,TabError,TimeoutError,TypeError,UnboundLocalError,UnicodeDecodeError,UnicodeEncodeError,UnicodeError,UnicodeTranslateError,UnicodeWarning,UserWarning,ValueError,Warning,ZeroDivisionError,_,__build_class__,__debug__,__doc__,__import__,__loader__,__name__,__package__,__spec__,abs,all,any,apply,ascii,basestring,bin,bool,buffer,bytearray,bytes,callable,chr,classmethod,cmp,coerce,compile,complex,copyright,credits,delattr,dict,dir,divmod,enumerate,eval,exec,execfile,exit,file,filter,float,format,frozenset,getattr,globals,hasattr,hash,help,hex,id,input,int,intern,isinstance,issubclass,iter,len,license,list,locals,long,map,max,memoryview,min,next,object,oct,open,ord,pow,print,property,quit,range,raw_input,reduce,reload,repr,reversed,round,set,setattr,slice,sorted,staticmethod,str,sum,super,tuple,type,unichr,unicode,vars,xrange,zip`)}init(e){super.init(e),this.PASS=this.INDENT+`pass
`,this.nameDB_?this.nameDB_.reset():this.nameDB_=new t.Names$$module$build$src$core$names(this.RESERVED_WORDS_),this.nameDB_.setVariableMap(e.getVariableMap()),this.nameDB_.populateVariables(e),this.nameDB_.populateProcedures(e);let n=[];var r=t.allDeveloperVariables$$module$build$src$core$variables(e);for(let e=0;e<r.length;e++)n.push(this.nameDB_.getName(r[e],t.Names$$module$build$src$core$names.DEVELOPER_VARIABLE_TYPE)+` = None`);for(e=t.allUsedVarModels$$module$build$src$core$variables(e),r=0;r<e.length;r++)n.push(this.getVariableName(e[r].getId())+` = None`);this.definitions_.variables=n.join(`
`),this.isInitialized=!0}finish(e){let t=[],n=[];for(let e in this.definitions_){let r=this.definitions_[e];r.match(/^(from\s+\S+\s+)?import\s+\S+/)?t.push(r):n.push(r)}return e=super.finish(e),this.isInitialized=!1,this.nameDB_.reset(),(t.join(`
`)+`

`+n.join(`

`)).replace(/\n\n+/g,`

`).replace(/\n*$/,`


`)+e}scrubNakedValue(e){return e+`
`}quote_(e){e=e.replace(/\\/g,`\\\\`).replace(/\n/g,`\\
`);let t=`'`;return e.includes(`'`)&&(e.includes(`"`)?e=e.replace(/'/g,`\\'`):t=`"`),t+e+t}multiline_quote_(e){return e.split(/\n/g).map(this.quote_).join(` + '\\n' + 
`)}scrub_(e,n,r=!1){let i=``;if(!e.outputConnection||!e.outputConnection.targetConnection){var a=e.getCommentText();a&&(a=t.wrap$$module$build$src$core$utils$string(a,this.COMMENT_WRAP-3),i+=this.prefixLines(a+`
`,`# `));for(let n=0;n<e.inputList.length;n++)e.inputList[n].type===t.inputTypes$$module$build$src$core$inputs$input_types.VALUE&&(a=e.inputList[n].connection.targetBlock())&&(a=this.allNestedComments(a))&&(i+=this.prefixLines(a,`# `))}return e=e.nextConnection&&e.nextConnection.targetBlock(),r=r?``:this.blockToCode(e),i+n+r}getAdjustedInt(e,n,r=0,i=!1){e.workspace.options.oneBasedIndex&&r--;let a=e.workspace.options.oneBasedIndex?`1`:`0`;return e=this.valueToCode(e,n,r?z.ADDITIVE:z.NONE)||a,t.isNumber$$module$build$src$core$utils$string(e)?(e=parseInt(e,10)+r,i&&(e=-e)):(e=r>0?`int(`+e+` + `+r+`)`:r<0?`int(`+e+` - `+-r+`)`:`int(`+e+`)`,i&&(e=`-`+e)),e}},V={};V.Order=z,V.PythonGenerator=B;var H={};H.lists_create_empty=n,H.lists_create_with=r,H.lists_getIndex=c,H.lists_getSublist=u,H.lists_indexOf=s,H.lists_isEmpty=o,H.lists_length=a,H.lists_repeat=i,H.lists_reverse=te,H.lists_setIndex=l,H.lists_sort=d,H.lists_split=ee;var U={};U.controls_if=f,U.controls_ifelse=f,U.logic_boolean=ae,U.logic_compare=ne,U.logic_negate=ie,U.logic_null=oe,U.logic_operation=re,U.logic_ternary=p;var W={};W.controls_flow_statements=ce,W.controls_for=h,W.controls_forEach=g,W.controls_repeat=m,W.controls_repeat_ext=m,W.controls_whileUntil=se;var G={};G.math_arithmetic=ue,G.math_atan2=y,G.math_change=pe,G.math_constant=de,G.math_constrain=ge,G.math_modulo=he,G.math_number=le,G.math_number_property=fe,G.math_on_list=me,G.math_random_float=v,G.math_random_int=_e,G.math_round=_,G.math_single=_,G.math_trig=_;var K={};K.procedures_callnoreturn=S,K.procedures_callreturn=x,K.procedures_defnoreturn=b,K.procedures_defreturn=b,K.procedures_ifreturn=C;var be=/^\s*'([^']|\\')*'\s*$/,q=function(e){return be.test(e)?[e,z.ATOMIC]:[`str(`+e+`)`,z.FUNCTION_CALL]},J={};J.text=w,J.text_append=E,J.text_changeCase=M,J.text_charAt=A,J.text_count=I,J.text_getSubstring=j,J.text_indexOf=k,J.text_isEmpty=O,J.text_join=T,J.text_length=D,J.text_print=P,J.text_prompt=F,J.text_prompt_ext=F,J.text_replace=ve,J.text_reverse=ye,J.text_trim=N;var Y={};Y.variables_get=L,Y.variables_set=R;var X={};X.variables_get_dynamic=L,X.variables_set_dynamic=R;var Z=new B;Z.addReservedWords(`math,random,Number`);var Q=Object.assign({},H,U,W,G,K,J,Y,X);for(let e in Q)Z.forBlock[e]=Q[e];var $={};return $.Order=z,$.PythonGenerator=B,$.pythonGenerator=Z,$.__namespace__=t,$})}))(),1).default;export{a as n,r as t};