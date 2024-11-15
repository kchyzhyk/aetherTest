import*as i from"https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js";import{OrbitControls as T}from"https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/controls/OrbitControls.js";import{Line2 as H}from"https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/lines/Line2.js";import{LineGeometry as C}from"https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/lines/LineGeometry.js";import{LineMaterial as G}from"https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/lines/LineMaterial.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const d of s.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&r(d)}).observe(document,{childList:!0,subtree:!0});function o(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(n){if(n.ep)return;n.ep=!0;const s=o(n);fetch(n.href,s)}})();const l=new i.Scene,p=new i.PerspectiveCamera(75,window.innerWidth/window.innerHeight,.1,1e3),f=new i.WebGLRenderer({antialias:!0});f.setSize(window.innerWidth,window.innerHeight);f.setClearColor(16777215,0);document.getElementById("three-container").appendChild(f.domElement);const O=new i.GridHelper(100,10);l.add(O);const y=new i.Raycaster,h=new i.Vector2,W=new G({color:65280,linewidth:10,resolution:new i.Vector2(window.innerWidth,window.innerHeight)}),k=new T(p,f.domElement);p.position.set(0,60,40);const I=new C;let u,a=[],z=[],c=null,m=!1,w=!1;const F=async()=>{console.log("Loading google");const e="AIzaSyCePxIeTCrTCpbw4sbBhsXjnec-QHGE1e8",t=document.getElementById("address-input").value||"Zahradnicka 4833/43, 821 08 Bratislava",o=parseInt(document.getElementById("zoom-input").value,10)||18,r=`https://maps.googleapis.com/maps/api/staticmap?center=${t}&zoom=${o}&size=600x400&maptype=satellite&key=${e}`;return new Promise((n,s)=>{if(!r||!t){s(new Error("No image URL found"));return}new i.TextureLoader().load(r,n,void 0,s)})},v=async()=>{const e=await F();if(!e)return;const t=new i.PlaneGeometry(100,100),o=new i.MeshBasicMaterial({map:e,side:i.FrontSide}),r=new i.Mesh(t,o);r.rotation.x=-Math.PI/2,l.children.filter(n=>n.isMesh&&n.material.map).forEach(n=>l.remove(n)),l.add(r)},N=(e,t)=>{let o;return(...r)=>{clearTimeout(o),o=setTimeout(()=>e(...r),t)}};v();const R=N(()=>v(),500);document.getElementById("address-button").addEventListener("click",()=>{v()});const L=()=>{u&&(l.remove(u),u.geometry.dispose(),u.material.dispose()),a.length>1&&(I.setPositions(a.flatMap(e=>[e.x,e.y,e.z])),u=new H(I,W),u.computeLineDistances(),l.add(u))},D=e=>{if(h.x=e.clientX/window.innerWidth*2-1,h.y=-(e.clientY/window.innerHeight)*2+1,y.setFromCamera(h,p),w)z.forEach((t,o)=>{y.intersectObject(t).length>0&&(l.remove(t),t.geometry.dispose(),t.material.dispose(),z.splice(o,1))});else if(m){const t=y.intersectObject(l.children.find(o=>o.isMesh&&o.material.map));t.length>0&&(a.push(t[0].point.clone()),L())}},V=()=>{m=!m,m?(console.log("Drawing Started"),a=[]):console.log("Drawing Stopped"),console.log(m)},A=()=>{w=!w,console.log(w?"Eraser Started":"Eraser Stopped"),console.log(w)},j=e=>{D(e)},U=e=>{if(m){h.x=e.clientX/window.innerWidth*2-1,h.y=-(e.clientY/window.innerHeight)*2+1,y.setFromCamera(h,p);const t=y.intersectObject(l.children.find(o=>o.isMesh&&o.material.map));t.length>0&&a.length>0&&(a[a.length-1]=t[0].point.clone(),L())}},X=()=>{m&&a.length>2&&a[0].distanceTo(a[a.length-1])<1&&(a[a.length-1]=a[0],L())};document.getElementById("eraser-button").addEventListener("click",A);const $=(e,t,o,r)=>{if(e.length<3){alert("Please draw a closed polygon first.");return}c&&(l.remove(c),c.geometry.dispose(),c.material.dispose());const n=new i.Shape;n.moveTo(e[0].x,e[0].z);for(let g=1;g<e.length;g++)n.lineTo(e[g].x,e[g].z);n.lineTo(e[0].x,e[0].z);const s=new i.ShapeGeometry(n),d=new i.MeshBasicMaterial({color:65280,side:i.DoubleSide});c=new i.Mesh(s,d),c.position.set(0,t,0);const E=i.MathUtils.degToRad(o);r==="x"?c.rotation.x=E:r==="z"&&(c.rotation.z=E),c.rotation.y=0,l.add(c)},q=(e,t)=>{if(!(e.length<3)){l.children.forEach(o=>{o.name==="wall"&&(l.remove(o),o.geometry.dispose(),o.material.dispose())});for(let o=0;o<e.length;o++){const r=e[o],n=e[(o+1)%e.length],s=r.distanceTo(n),d=t,E=.1,g=new i.BoxGeometry(s,d,E),P=new i.MeshBasicMaterial({color:11184810}),M=new i.Mesh(g,P);M.name="wall";const b=new i.Vector3().addVectors(r,n).multiplyScalar(.5);M.position.set(b.x,d/2,b.z);const B=new i.Vector3().subVectors(n,r).normalize(),S=Math.atan2(B.z,B.x);M.rotation.y=S,l.add(M)}}};document.getElementById("apply-button").addEventListener("click",()=>{const e=parseFloat(document.getElementById("height-input").value),t=parseFloat(document.getElementById("pitch-input").value),o=document.getElementById("pitch-side-input").value;if(isNaN(e)||isNaN(t)){alert("Please enter valid numbers for height and pitch.");return}$(a,e,t,o),q(a,e)});window.addEventListener("mousedown",j);window.addEventListener("mousemove",U);window.addEventListener("mouseup",X);document.getElementById("drawing-button").addEventListener("click",V);document.getElementById("zoom-input").addEventListener("input",e=>{R(parseInt(e.target.value,10)||18)});document.onkeydown=function(e){e=e||window.event;let t=!1;"key"in e?t=e.key==="Escape"||e.key==="Esc":t=e.keyCode===27,t&&(m=!1,w=!1)};const x=()=>{requestAnimationFrame(x),k.update(),f.render(l,p)};x();window.addEventListener("resize",()=>{f.setSize(window.innerWidth,window.innerHeight),p.aspect=window.innerWidth/window.innerHeight,p.updateProjectionMatrix()});
