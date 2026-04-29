import{r as l}from"./rolldown-runtime-Bnw7wDfq.js";import{m as i}from"./vendor-livekit-CaBMaWNx.js";import{v as s,wt as n,xt as f}from"./vendor-physics-uw1kRHH9.js";import{c as m}from"./vendor-three-DYdaC6CB.js";var e=n();function v({position:o,distance:t=220}){const r=new f(...o).normalize().multiplyScalar(t);return(0,e.jsxs)(m,{position:[r.x,r.y,r.z],follow:!0,children:[(0,e.jsxs)("mesh",{renderOrder:-2,frustumCulled:!1,children:[(0,e.jsx)("circleGeometry",{args:[22,32]}),(0,e.jsx)("meshBasicMaterial",{color:"#fff1a6",transparent:!0,opacity:.35,depthWrite:!1,toneMapped:!1})]}),(0,e.jsxs)("mesh",{renderOrder:-1,frustumCulled:!1,children:[(0,e.jsx)("circleGeometry",{args:[13,32]}),(0,e.jsx)("meshBasicMaterial",{color:"#ffe066",transparent:!0,opacity:.75,depthWrite:!1,toneMapped:!1})]}),(0,e.jsxs)("mesh",{renderOrder:0,frustumCulled:!1,children:[(0,e.jsx)("circleGeometry",{args:[7,32]}),(0,e.jsx)("meshBasicMaterial",{color:"#ffffff",depthWrite:!1,toneMapped:!1})]})]})}var c=l(i(),1);function h({top:o="#4c97ff",bottom:t="#d4ebff",radius:r=450}){const a=(0,c.useMemo)(()=>({topColor:{value:new s(o)},bottomColor:{value:new s(t)},offset:{value:50},exponent:{value:.5}}),[o,t]);return(0,e.jsxs)("mesh",{renderOrder:-10,frustumCulled:!1,children:[(0,e.jsx)("sphereGeometry",{args:[r,32,16]}),(0,e.jsx)("shaderMaterial",{side:1,depthWrite:!1,toneMapped:!1,uniforms:a,vertexShader:`
          varying vec3 vWorldPos;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,fragmentShader:`
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPos;
          void main() {
            float h = normalize(vWorldPos + vec3(0.0, offset, 0.0)).y;
            float t = pow(max(h, 0.0), exponent);
            vec3 col = mix(bottomColor, topColor, t);
            gl_FragColor = vec4(col, 1.0);
          }
        `})]})}export{v as n,h as t};
