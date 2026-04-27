const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./SmartPythonEditor-BySGlp9_.js","./rolldown-runtime-S-ySWqyJ.js","./index-C-wbFowG.js","./vendor-capacitor-B_f_dcov.js","./vendor-livekit-BzmvgSqw.js","./vendor-livekit-BJb23pw-.css","./vendor-physics-AUvR81v8.js","./vendor-react-D_bBS7I7.js","./PlatformShell-PE4wtw92.js","./Niksel-BYRdBkhn.js","./progress-B4zfHuYz.js","./api-BdpT7R8O.js","./curriculum-TkO6BD6R.js","./publicPath-J5b42Dh2.js","./index-C-AXtrqN.css"])))=>i.map(i=>d[i]);
import{r as e}from"./rolldown-runtime-S-ySWqyJ.js";import{l as t}from"./vendor-capacitor-B_f_dcov.js";import{f as n}from"./vendor-livekit-BzmvgSqw.js";import{wt as r}from"./vendor-physics-AUvR81v8.js";import{t as i}from"./PlatformShell-PE4wtw92.js";import{n as a,t as o}from"./pyodide-executor-CEO6xKid.js";var s=e(n(),1),c=r(),l=(0,s.lazy)(()=>t(()=>import(`./SmartPythonEditor-BySGlp9_.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]),import.meta.url)),u=`ek_python_ide_code`,d=`ek_python_ide_history`,f=5,p=[{name:`Hello World`,code:`print("Привет, мир!")
`},{name:`Цикл до 10`,code:`for i in range(1, 11):
    print(i)
`},{name:`Список чисел`,code:`nums = [1, 2, 3, 4, 5]
for n in nums:
    print(n * 2)
`},{name:`Функция приветствия`,code:`def greet(name):
    print(f"Привет, {name}!")

greet("Саша")
greet("Лена")
`},{name:`Простой калькулятор`,code:`def calc(a, op, b):
    if op == "+":
        return a + b
    if op == "-":
        return a - b
    if op == "*":
        return a * b
    if op == "/":
        return a / b
    return 0

print(calc(10, "+", 5))
print(calc(10, "-", 3))
print(calc(4, "*", 6))
`},{name:`Фибоначчи`,code:`def fib(n):
    a, b = 0, 1
    for _ in range(n):
        print(a)
        a, b = b, a + b

fib(10)
`},{name:`Пирамида из звёздочек`,code:`for i in range(1, 6):
    print("*" * i)
`}];function m(){try{let e=localStorage.getItem(d);if(!e)return[];let t=JSON.parse(e);return Array.isArray(t)?t.filter(e=>typeof e==`object`&&!!e&&typeof e.at==`number`&&typeof e.lines==`number`):[]}catch{return[]}}function h(e){try{localStorage.setItem(d,JSON.stringify(e.slice(0,f)))}catch{}}function g(){let[e,t]=(0,s.useState)(()=>{try{return localStorage.getItem(u)??`print("Привет, мир!")
`}catch{return`print("Привет, мир!")
`}}),[n,r]=(0,s.useState)([]),[d,g]=(0,s.useState)(null),[_,v]=(0,s.useState)(!1),[y,b]=(0,s.useState)(()=>m()),[x,S]=(0,s.useState)(!1),C=(0,s.useRef)(null);(0,s.useEffect)(()=>{try{localStorage.setItem(u,e)}catch{}},[e]),(0,s.useEffect)(()=>{a().catch(e=>console.warn(`Pyodide warmup:`,e))},[]),(0,s.useEffect)(()=>{if(!x)return;let e=e=>{C.current&&!C.current.contains(e.target)&&S(!1)};return window.addEventListener(`mousedown`,e),()=>window.removeEventListener(`mousedown`,e)},[x]);let w=(0,s.useCallback)(async()=>{if(!_){v(!0),g(null),r([]);try{let t=await o(e),n=[],i=``;for(let e of t)e.op===`print`&&typeof e.text==`string`?n.push(e.text):e.op===`stderr`&&typeof e.text==`string`&&(i+=(i?`
`:``)+e.text);r(n),i&&g(i);let a=[{at:Date.now(),lines:n.length,error:i||null},...y].slice(0,f);b(a),h(a)}catch(e){let t=e instanceof Error?e.message:String(e);g(t);let n=[{at:Date.now(),lines:0,error:t},...y].slice(0,f);b(n),h(n)}finally{v(!1)}}},[e,_,y]),T=(0,s.useCallback)(()=>{r([]),g(null)},[]),E=(0,s.useCallback)(()=>{try{localStorage.setItem(u,e)}catch{}},[e]),D=(0,s.useCallback)(e=>{t(e.code),S(!1),r([]),g(null)},[]);return(0,c.jsx)(i,{activeKey:`learn`,children:(0,c.jsxs)(`div`,{className:`python-ide-layout`,children:[(0,c.jsxs)(`div`,{className:`python-ide-toolbar`,children:[(0,c.jsxs)(`button`,{className:`kb-btn`,type:`button`,onClick:w,disabled:_,children:[_?`⏳ Работаю…`:`▶ Запустить`,(0,c.jsx)(`span`,{className:`python-ide-hk`,children:`Ctrl+Enter`})]}),(0,c.jsx)(`button`,{className:`kb-btn kb-btn--ghost kb-btn--sm`,type:`button`,onClick:T,children:`🧹 Очистить`}),(0,c.jsx)(`button`,{className:`kb-btn kb-btn--ghost kb-btn--sm`,type:`button`,onClick:E,title:`Сохранить в браузер (localStorage)`,children:`💾 Сохранить`}),(0,c.jsxs)(`div`,{className:`python-ide-snippets`,ref:C,children:[(0,c.jsx)(`button`,{className:`kb-btn kb-btn--ghost kb-btn--sm`,type:`button`,onClick:()=>S(e=>!e),"aria-expanded":x,children:`📚 Примеры ▾`}),x&&(0,c.jsx)(`div`,{className:`python-ide-snippet-dropdown`,role:`menu`,children:p.map(e=>(0,c.jsx)(`button`,{className:`python-ide-snippet-item`,type:`button`,role:`menuitem`,onClick:()=>D(e),children:e.name},e.name))})]}),(0,c.jsx)(`div`,{className:`python-ide-toolbar-spacer`}),(0,c.jsx)(`div`,{className:`python-ide-history`,title:`Последние запуски`,children:y.length>0?`↻ Последний запуск: ${new Date(y[0].at).toLocaleTimeString()}`:`↻ Ещё не запускалось`})]}),(0,c.jsxs)(`div`,{className:`python-ide-split`,children:[(0,c.jsx)(`div`,{className:`python-ide-editor`,children:(0,c.jsx)(s.Suspense,{fallback:(0,c.jsx)(`div`,{className:`py-editor-loading`,children:`Загружаем редактор…`}),children:(0,c.jsx)(l,{code:e,onChange:t,onRun:w,isRunning:_,error:d})})}),(0,c.jsxs)(`div`,{className:`python-ide-output`,children:[(0,c.jsxs)(`div`,{className:`python-ide-output-head`,children:[(0,c.jsx)(`span`,{children:`Вывод`}),(0,c.jsxs)(`span`,{className:`python-ide-output-count`,children:[n.length,` строк `,d?`· ⚠ ошибка`:``]})]}),(0,c.jsx)(`pre`,{className:`python-ide-output-body`,children:n.length===0&&!d?(0,c.jsx)(`span`,{className:`python-ide-output-empty`,children:`— пока пусто — нажми «Запустить»`}):(0,c.jsxs)(c.Fragment,{children:[n.map((e,t)=>(0,c.jsx)(`div`,{className:`python-ide-output-line`,children:e||`·`},t)),d&&(0,c.jsxs)(`div`,{className:`python-ide-output-err`,children:[`⚠ `,d]})]})})]})]})]})})}export{g as default};