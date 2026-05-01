const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/SmartPythonEditor-DbQqXXaJ.js","assets/rolldown-runtime-Bnw7wDfq.js","assets/index-CL0sHvIa.js","assets/vendor-postfx-DYtuMyHg.js","assets/vendor-livekit-CaBMaWNx.js","assets/vendor-livekit-BJb23pw-.css","assets/vendor-physics-F49l8o9R.js","assets/vendor-capacitor-qb7y-bzK.js","assets/vendor-react-CicXw91Z.js","assets/client-CqtENVXp.js","assets/authStorage-J-w-ktpb.js","assets/api-DuRuRh7C.js","assets/curriculum-7bdjrhUB.js","assets/publicPath-B7demQuV.js","assets/progress-DKx6rm13.js","assets/worldEdits-Ca7kHwzT.js","assets/worldScripts-CBbgvSbx.js","assets/sitesState-DcliBvB0.js","assets/index.browser-E-R2ztJc.js","assets/editorState-DhMxZPW3.js","assets/index-B6K3BHp7.css"])))=>i.map(i=>d[i]);
import{r as w}from"./rolldown-runtime-Bnw7wDfq.js";import{l as C}from"./vendor-capacitor-qb7y-bzK.js";import{m as I}from"./vendor-livekit-CaBMaWNx.js";import{an as P}from"./vendor-physics-F49l8o9R.js";import{E as O}from"./index-CL0sHvIa.js";import{n as R,r as H}from"./pyodide-executor-CmnRQoOe.js";import"./constants-BVGg52jI.js";var n=w(I(),1),e=P(),D=(0,n.lazy)(()=>C(()=>import("./SmartPythonEditor-DbQqXXaJ.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]))),b="ek_python_ide_code",N="ek_python_ide_history",L=[{name:"Hello World",code:`print("Привет, мир!")
`},{name:"Цикл до 10",code:`for i in range(1, 11):
    print(i)
`},{name:"Список чисел",code:`nums = [1, 2, 3, 4, 5]
for n in nums:
    print(n * 2)
`},{name:"Функция приветствия",code:`def greet(name):
    print(f"Привет, {name}!")

greet("Саша")
greet("Лена")
`},{name:"Простой калькулятор",code:`def calc(a, op, b):
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
`},{name:"Фибоначчи",code:`def fib(n):
    a, b = 0, 1
    for _ in range(n):
        print(a)
        a, b = b, a + b

fib(10)
`},{name:"Пирамида из звёздочек",code:`for i in range(1, 6):
    print("*" * i)
`}];function T(){try{const r=localStorage.getItem(N);if(!r)return[];const l=JSON.parse(r);return Array.isArray(l)?l.filter(a=>typeof a=="object"&&a!==null&&typeof a.at=="number"&&typeof a.lines=="number"):[]}catch{return[]}}function v(r){try{localStorage.setItem(N,JSON.stringify(r.slice(0,5)))}catch{}}function F(){const[r,l]=(0,n.useState)(()=>{try{return localStorage.getItem(b)??`print("Привет, мир!")
`}catch{return`print("Привет, мир!")
`}}),[a,m]=(0,n.useState)([]),[c,d]=(0,n.useState)(null),[p,g]=(0,n.useState)(!1),[u,x]=(0,n.useState)(()=>T()),[h,y]=(0,n.useState)(!1),f=(0,n.useRef)(null);(0,n.useEffect)(()=>{try{localStorage.setItem(b,r)}catch{}},[r]),(0,n.useEffect)(()=>{H().catch(t=>console.warn("Pyodide warmup:",t))},[]),(0,n.useEffect)(()=>{if(!h)return;const t=s=>{f.current&&!f.current.contains(s.target)&&y(!1)};return window.addEventListener("mousedown",t),()=>window.removeEventListener("mousedown",t)},[h]);const j=(0,n.useCallback)(async()=>{if(!p){g(!0),d(null),m([]);try{const t=await R(r),s=[];let o="";for(const i of t)i.op==="print"&&typeof i.text=="string"?s.push(i.text):i.op==="stderr"&&typeof i.text=="string"&&(o+=(o?`
`:"")+i.text);m(s),o&&d(o);const S=[{at:Date.now(),lines:s.length,error:o||null},...u].slice(0,5);x(S),v(S)}catch(t){const s=t instanceof Error?t.message:String(t);d(s);const o=[{at:Date.now(),lines:0,error:s},...u].slice(0,5);x(o),v(o)}finally{g(!1)}}},[r,p,u]),_=(0,n.useCallback)(()=>{m([]),d(null)},[]),k=(0,n.useCallback)(()=>{try{localStorage.setItem(b,r)}catch{}},[r]),E=(0,n.useCallback)(t=>{l(t.code),y(!1),m([]),d(null)},[]);return(0,e.jsx)(O,{activeKey:"python-ide",children:(0,e.jsxs)("div",{className:"python-ide-layout",children:[(0,e.jsxs)("div",{className:"python-ide-toolbar",children:[(0,e.jsxs)("button",{className:"kb-btn",type:"button",onClick:j,disabled:p,children:[p?"⏳ Работаю…":"▶ Запустить",(0,e.jsx)("span",{className:"python-ide-hk",children:"Ctrl+Enter"})]}),(0,e.jsx)("button",{className:"kb-btn kb-btn--ghost kb-btn--sm",type:"button",onClick:_,children:"🧹 Очистить"}),(0,e.jsx)("button",{className:"kb-btn kb-btn--ghost kb-btn--sm",type:"button",onClick:k,title:"Сохранить в браузер (localStorage)",children:"💾 Сохранить"}),(0,e.jsxs)("div",{className:"python-ide-snippets",ref:f,children:[(0,e.jsx)("button",{className:"kb-btn kb-btn--ghost kb-btn--sm",type:"button",onClick:()=>y(t=>!t),"aria-expanded":h,children:"📚 Примеры ▾"}),h&&(0,e.jsx)("div",{className:"python-ide-snippet-dropdown",role:"menu",children:L.map(t=>(0,e.jsx)("button",{className:"python-ide-snippet-item",type:"button",role:"menuitem",onClick:()=>E(t),children:t.name},t.name))})]}),(0,e.jsx)("div",{className:"python-ide-toolbar-spacer"}),(0,e.jsx)("div",{className:"python-ide-history",title:"Последние запуски",children:u.length>0?`↻ Последний запуск: ${new Date(u[0].at).toLocaleTimeString()}`:"↻ Ещё не запускалось"})]}),(0,e.jsxs)("div",{className:"python-ide-split",children:[(0,e.jsx)("div",{className:"python-ide-editor",children:(0,e.jsx)(n.Suspense,{fallback:(0,e.jsx)("div",{className:"py-editor-loading",role:"status",children:"Загружаем редактор…"}),children:(0,e.jsx)(D,{code:r,onChange:l,onRun:j,isRunning:p,error:c})})}),(0,e.jsxs)("div",{className:"python-ide-output",children:[(0,e.jsxs)("div",{className:"python-ide-output-head",children:[(0,e.jsx)("span",{children:"Вывод"}),(0,e.jsxs)("span",{className:"python-ide-output-count",children:[a.length," строк ",c?"· ⚠ ошибка":""]})]}),(0,e.jsx)("pre",{className:"python-ide-output-body",children:a.length===0&&!c?(0,e.jsx)("span",{className:"python-ide-output-empty",children:"— пока пусто — нажми «Запустить»"}):(0,e.jsxs)(e.Fragment,{children:[a.map((t,s)=>(0,e.jsx)("div",{className:"python-ide-output-line",children:t||"·"},s)),c&&(0,e.jsxs)("div",{className:"python-ide-output-err",children:["⚠ ",c]})]})})]})]})]})})}export{F as default};
