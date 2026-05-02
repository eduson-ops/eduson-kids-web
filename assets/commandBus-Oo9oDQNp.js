var t=new Set;function s(e){for(const n of t)n(e)}function o(e){return t.add(e),()=>{t.delete(e)}}function r(e){return new Promise(n=>setTimeout(n,e))}export{s as n,o as r,r as t};
