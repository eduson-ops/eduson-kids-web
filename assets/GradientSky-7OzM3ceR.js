import{r as i}from"./rolldown-runtime-Bnw7wDfq.js";import{m as n}from"./vendor-livekit-CaBMaWNx.js";import{C as l,in as s}from"./vendor-physics-DXTlMK5L.js";var m=i(n(),1),o=s();function u({top:e="#4c97ff",bottom:r="#d4ebff",radius:a=450}){const t=(0,m.useMemo)(()=>({topColor:{value:new l(e)},bottomColor:{value:new l(r)},offset:{value:50},exponent:{value:.5}}),[e,r]);return(0,o.jsxs)("mesh",{renderOrder:-10,frustumCulled:!1,children:[(0,o.jsx)("sphereGeometry",{args:[a,32,16]}),(0,o.jsx)("shaderMaterial",{side:1,depthWrite:!1,toneMapped:!1,uniforms:t,vertexShader:`
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

            // Horizon glow — warm orange band
            float horizonGlow = pow(1.0 - abs(normalize(vWorldPos + vec3(0.0, offset, 0.0)).y), 4.0) * 0.3;
            col = mix(col, vec3(1.0, 0.5, 0.1), horizonGlow * 0.4);

            // Sun disc + halo
            vec3 sunDir = normalize(vec3(50.0, 45.0, 20.0));
            vec3 viewDir = normalize(vWorldPos);
            float sunDot = dot(viewDir, sunDir);

            // Core disc
            float sunDisc = smoothstep(0.9995, 0.9999, sunDot);
            // Inner halo
            float halo1 = pow(max(sunDot, 0.0), 64.0) * 0.6;
            // Outer halo
            float halo2 = pow(max(sunDot, 0.0), 16.0) * 0.15;

            vec3 sunColor = vec3(1.0, 0.95, 0.7);
            vec3 haloColor = mix(vec3(1.0, 0.6, 0.2), sunColor, 0.5);

            col = col + sunDisc * sunColor + halo1 * haloColor + halo2 * haloColor * 0.5;

            gl_FragColor = vec4(col, 1.0);
          }
        `})]})}export{u as t};
