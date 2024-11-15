import"https://cdn.skypack.dev/three";import*as c from"three";import{Controls as Tt,Vector3 as p,MOUSE as I,TOUCH as U,Quaternion as rt,Spherical as lt,Vector2 as E,Ray as Lt,MathUtils as wt,Plane as At,InstancedBufferGeometry as Ot,Float32BufferAttribute as ht,InstancedInterleavedBuffer as J,InterleavedBufferAttribute as R,WireframeGeometry as zt,Box3 as tt,Sphere as bt,ShaderMaterial as Ct,ShaderLib as Z,UniformsUtils as St,UniformsLib as K,Mesh as Ut,Vector4 as H,Line3 as Rt,Matrix4 as jt}from"three";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(s){if(s.ep)return;s.ep=!0;const o=e(s);fetch(s.href,o)}})();const ct={type:"change"},et={type:"start"},Et={type:"end"},W=new Lt,dt=new At,It=Math.cos(70*wt.DEG2RAD),d=new p,S=2*Math.PI,l={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},X=1e-6;class Nt extends Tt{constructor(t,e=null){super(t,e),this.state=l.NONE,this.enabled=!0,this.target=new p,this.cursor=new p,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:I.ROTATE,MIDDLE:I.DOLLY,RIGHT:I.PAN},this.touches={ONE:U.ROTATE,TWO:U.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new p,this._lastQuaternion=new rt,this._lastTargetPosition=new p,this._quat=new rt().setFromUnitVectors(t.up,new p(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new lt,this._sphericalDelta=new lt,this._scale=1,this._panOffset=new p,this._rotateStart=new E,this._rotateEnd=new E,this._rotateDelta=new E,this._panStart=new E,this._panEnd=new E,this._panDelta=new E,this._dollyStart=new E,this._dollyEnd=new E,this._dollyDelta=new E,this._dollyDirection=new p,this._mouse=new E,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=kt.bind(this),this._onPointerDown=Bt.bind(this),this._onPointerUp=Ht.bind(this),this._onContextMenu=Vt.bind(this),this._onMouseWheel=Ft.bind(this),this._onKeyDown=Gt.bind(this),this._onTouchStart=Zt.bind(this),this._onTouchMove=Kt.bind(this),this._onMouseDown=Wt.bind(this),this._onMouseMove=Yt.bind(this),this._interceptControlDown=Xt.bind(this),this._interceptControlUp=qt.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(ct),this.update(),this.state=l.NONE}update(t=null){const e=this.object.position;d.copy(e).sub(this.target),d.applyQuaternion(this._quat),this._spherical.setFromVector3(d),this.autoRotate&&this.state===l.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=S:n>Math.PI&&(n-=S),s<-Math.PI?s+=S:s>Math.PI&&(s-=S),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let o=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),o=a!=this._spherical.radius}if(d.setFromSpherical(this._spherical),d.applyQuaternion(this._quatInverse),e.copy(this.target).add(d),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){const r=d.length();a=this._clampDistance(r*this._scale);const h=r-a;this.object.position.addScaledVector(this._dollyDirection,h),this.object.updateMatrixWorld(),o=!!h}else if(this.object.isOrthographicCamera){const r=new p(this._mouse.x,this._mouse.y,0);r.unproject(this.object);const h=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),o=h!==this.object.zoom;const g=new p(this._mouse.x,this._mouse.y,0);g.unproject(this.object),this.object.position.sub(g).add(r),this.object.updateMatrixWorld(),a=d.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(W.origin.copy(this.object.position),W.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(W.direction))<It?this.object.lookAt(this.target):(dt.setFromNormalAndCoplanarPoint(this.object.up,this.target),W.intersectPlane(dt,this.target))))}else if(this.object.isOrthographicCamera){const a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),o=!0)}return this._scale=1,this._performCursorZoom=!1,o||this._lastPosition.distanceToSquared(this.object.position)>X||8*(1-this._lastQuaternion.dot(this.object.quaternion))>X||this._lastTargetPosition.distanceToSquared(this.target)>X?(this.dispatchEvent(ct),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?S/60*this.autoRotateSpeed*t:S/60/60*this.autoRotateSpeed}_getZoomScale(t){const e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){d.setFromMatrixColumn(e,0),d.multiplyScalar(-t),this._panOffset.add(d)}_panUp(t,e){this.screenSpacePanning===!0?d.setFromMatrixColumn(e,1):(d.setFromMatrixColumn(e,0),d.crossVectors(this.object.up,d)),d.multiplyScalar(t),this._panOffset.add(d)}_pan(t,e){const n=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;d.copy(s).sub(this.target);let o=d.length();o*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*o/n.clientHeight,this.object.matrix),this._panUp(2*e*o/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),s=t-n.left,o=e-n.top,a=n.width,r=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(o/r)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(S*this._rotateDelta.x/e.clientHeight),this._rotateUp(S*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateUp(S*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateUp(-S*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateLeft(S*this.rotateSpeed/this.domElement.clientHeight):this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateLeft(-S*this.rotateSpeed/this.domElement.clientHeight):this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,o=Math.sqrt(n*n+s*s);this._dollyStart.set(0,o)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{const n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),o=.5*(t.pageY+n.y);this._rotateEnd.set(s,o)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(S*this._rotateDelta.x/e.clientHeight),this._rotateUp(S*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,o=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,o),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const a=(t.pageX+e.x)*.5,r=(t.pageY+e.y)*.5;this._updateZoomParameters(a,r)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new E,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){const e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){const e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function Bt(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i)))}function kt(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function Ht(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Et),this.state=l.NONE;break;case 1:const t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function Wt(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case I.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=l.DOLLY;break;case I.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=l.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=l.ROTATE}break;case I.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=l.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=l.PAN}break;default:this.state=l.NONE}this.state!==l.NONE&&this.dispatchEvent(et)}function Yt(i){switch(this.state){case l.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case l.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case l.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function Ft(i){this.enabled===!1||this.enableZoom===!1||this.state!==l.NONE||(i.preventDefault(),this.dispatchEvent(et),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Et))}function Gt(i){this.enabled===!1||this.enablePan===!1||this._handleKeyDown(i)}function Zt(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case U.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=l.TOUCH_ROTATE;break;case U.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=l.TOUCH_PAN;break;default:this.state=l.NONE}break;case 2:switch(this.touches.TWO){case U.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=l.TOUCH_DOLLY_PAN;break;case U.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=l.TOUCH_DOLLY_ROTATE;break;default:this.state=l.NONE}break;default:this.state=l.NONE}this.state!==l.NONE&&this.dispatchEvent(et)}function Kt(i){switch(this._trackPointer(i),this.state){case l.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case l.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case l.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case l.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=l.NONE}}function Vt(i){this.enabled!==!1&&i.preventDefault()}function Xt(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function qt(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const pt=new tt,Y=new p;class vt extends Ot{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const t=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],e=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],n=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(n),this.setAttribute("position",new ht(t,3)),this.setAttribute("uv",new ht(e,2))}applyMatrix4(t){const e=this.attributes.instanceStart,n=this.attributes.instanceEnd;return e!==void 0&&(e.applyMatrix4(t),n.applyMatrix4(t),e.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(t){let e;t instanceof Float32Array?e=t:Array.isArray(t)&&(e=new Float32Array(t));const n=new J(e,6,1);return this.setAttribute("instanceStart",new R(n,3,0)),this.setAttribute("instanceEnd",new R(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(t){let e;t instanceof Float32Array?e=t:Array.isArray(t)&&(e=new Float32Array(t));const n=new J(e,6,1);return this.setAttribute("instanceColorStart",new R(n,3,0)),this.setAttribute("instanceColorEnd",new R(n,3,3)),this}fromWireframeGeometry(t){return this.setPositions(t.attributes.position.array),this}fromEdgesGeometry(t){return this.setPositions(t.attributes.position.array),this}fromMesh(t){return this.fromWireframeGeometry(new zt(t.geometry)),this}fromLineSegments(t){const e=t.geometry;return this.setPositions(e.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new tt);const t=this.attributes.instanceStart,e=this.attributes.instanceEnd;t!==void 0&&e!==void 0&&(this.boundingBox.setFromBufferAttribute(t),pt.setFromBufferAttribute(e),this.boundingBox.union(pt))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new bt),this.boundingBox===null&&this.computeBoundingBox();const t=this.attributes.instanceStart,e=this.attributes.instanceEnd;if(t!==void 0&&e!==void 0){const n=this.boundingSphere.center;this.boundingBox.getCenter(n);let s=0;for(let o=0,a=t.count;o<a;o++)Y.fromBufferAttribute(t,o),s=Math.max(s,n.distanceToSquared(Y)),Y.fromBufferAttribute(e,o),s=Math.max(s,n.distanceToSquared(Y));this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(t){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(t)}}K.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new E(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};Z.line={uniforms:St.merge([K.common,K.fog,K.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};class it extends Ct{static get type(){return"LineMaterial"}constructor(t){super({uniforms:St.clone(Z.line.uniforms),vertexShader:Z.line.vertexShader,fragmentShader:Z.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(t)}get color(){return this.uniforms.diffuse.value}set color(t){this.uniforms.diffuse.value=t}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(t){t===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(t){this.uniforms.linewidth&&(this.uniforms.linewidth.value=t)}get dashed(){return"USE_DASH"in this.defines}set dashed(t){t===!0!==this.dashed&&(this.needsUpdate=!0),t===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(t){this.uniforms.dashScale.value=t}get dashSize(){return this.uniforms.dashSize.value}set dashSize(t){this.uniforms.dashSize.value=t}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(t){this.uniforms.dashOffset.value=t}get gapSize(){return this.uniforms.gapSize.value}set gapSize(t){this.uniforms.gapSize.value=t}get opacity(){return this.uniforms.opacity.value}set opacity(t){this.uniforms&&(this.uniforms.opacity.value=t)}get resolution(){return this.uniforms.resolution.value}set resolution(t){this.uniforms.resolution.value.copy(t)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(t){this.defines&&(t===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),t===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const q=new H,ut=new p,mt=new p,u=new H,m=new H,x=new H,Q=new p,$=new jt,f=new Rt,ft=new p,F=new tt,G=new bt,M=new H;let D,O;function _t(i,t,e){return M.set(0,0,-t,1).applyMatrix4(i.projectionMatrix),M.multiplyScalar(1/M.w),M.x=O/e.width,M.y=O/e.height,M.applyMatrix4(i.projectionMatrixInverse),M.multiplyScalar(1/M.w),Math.abs(Math.max(M.x,M.y))}function Qt(i,t){const e=i.matrixWorld,n=i.geometry,s=n.attributes.instanceStart,o=n.attributes.instanceEnd,a=Math.min(n.instanceCount,s.count);for(let r=0,h=a;r<h;r++){f.start.fromBufferAttribute(s,r),f.end.fromBufferAttribute(o,r),f.applyMatrix4(e);const g=new p,y=new p;D.distanceSqToSegment(f.start,f.end,y,g),y.distanceTo(g)<O*.5&&t.push({point:y,pointOnLine:g,distance:D.origin.distanceTo(y),object:i,face:null,faceIndex:r,uv:null,uv1:null})}}function $t(i,t,e){const n=t.projectionMatrix,o=i.material.resolution,a=i.matrixWorld,r=i.geometry,h=r.attributes.instanceStart,g=r.attributes.instanceEnd,y=Math.min(r.instanceCount,h.count),b=-t.near;D.at(1,x),x.w=1,x.applyMatrix4(t.matrixWorldInverse),x.applyMatrix4(n),x.multiplyScalar(1/x.w),x.x*=o.x/2,x.y*=o.y/2,x.z=0,Q.copy(x),$.multiplyMatrices(t.matrixWorldInverse,a);for(let v=0,V=y;v<V;v++){if(u.fromBufferAttribute(h,v),m.fromBufferAttribute(g,v),u.w=1,m.w=1,u.applyMatrix4($),m.applyMatrix4($),u.z>b&&m.z>b)continue;if(u.z>b){const C=u.z-m.z,L=(u.z-b)/C;u.lerp(m,L)}else if(m.z>b){const C=m.z-u.z,L=(m.z-b)/C;m.lerp(u,L)}u.applyMatrix4(n),m.applyMatrix4(n),u.multiplyScalar(1/u.w),m.multiplyScalar(1/m.w),u.x*=o.x/2,u.y*=o.y/2,m.x*=o.x/2,m.y*=o.y/2,f.start.copy(u),f.start.z=0,f.end.copy(m),f.end.z=0;const ot=f.closestPointToPointParameter(Q,!0);f.at(ot,ft);const at=wt.lerp(u.z,m.z,ot),Pt=at>=-1&&at<=1,Dt=Q.distanceTo(ft)<O*.5;if(Pt&&Dt){f.start.fromBufferAttribute(h,v),f.end.fromBufferAttribute(g,v),f.start.applyMatrix4(a),f.end.applyMatrix4(a);const C=new p,L=new p;D.distanceSqToSegment(f.start,f.end,L,C),e.push({point:L,pointOnLine:C,distance:D.origin.distanceTo(L),object:i,face:null,faceIndex:v,uv:null,uv1:null})}}}class Jt extends Ut{constructor(t=new vt,e=new it({color:Math.random()*16777215})){super(t,e),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const t=this.geometry,e=t.attributes.instanceStart,n=t.attributes.instanceEnd,s=new Float32Array(2*e.count);for(let a=0,r=0,h=e.count;a<h;a++,r+=2)ut.fromBufferAttribute(e,a),mt.fromBufferAttribute(n,a),s[r]=r===0?0:s[r-1],s[r+1]=s[r]+ut.distanceTo(mt);const o=new J(s,2,1);return t.setAttribute("instanceDistanceStart",new R(o,1,0)),t.setAttribute("instanceDistanceEnd",new R(o,1,1)),this}raycast(t,e){const n=this.material.worldUnits,s=t.camera;s===null&&!n&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const o=t.params.Line2!==void 0&&t.params.Line2.threshold||0;D=t.ray;const a=this.matrixWorld,r=this.geometry,h=this.material;O=h.linewidth+o,r.boundingSphere===null&&r.computeBoundingSphere(),G.copy(r.boundingSphere).applyMatrix4(a);let g;if(n)g=O*.5;else{const b=Math.max(s.near,G.distanceToPoint(D.origin));g=_t(s,b,h.resolution)}if(G.radius+=g,D.intersectsSphere(G)===!1)return;r.boundingBox===null&&r.computeBoundingBox(),F.copy(r.boundingBox).applyMatrix4(a);let y;if(n)y=O*.5;else{const b=Math.max(s.near,F.distanceToPoint(D.origin));y=_t(s,b,h.resolution)}F.expandByScalar(y),D.intersectsBox(F)!==!1&&(n?Qt(this,e):$t(this,s,e))}onBeforeRender(t){const e=this.material.uniforms;e&&e.resolution&&(t.getViewport(q),this.material.uniforms.resolution.value.set(q.z,q.w))}}class xt extends vt{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(t){const e=t.length-3,n=new Float32Array(2*e);for(let s=0;s<e;s+=3)n[2*s]=t[s],n[2*s+1]=t[s+1],n[2*s+2]=t[s+2],n[2*s+3]=t[s+3],n[2*s+4]=t[s+4],n[2*s+5]=t[s+5];return super.setPositions(n),this}setColors(t){const e=t.length-3,n=new Float32Array(2*e);for(let s=0;s<e;s+=3)n[2*s]=t[s],n[2*s+1]=t[s+1],n[2*s+2]=t[s+2],n[2*s+3]=t[s+3],n[2*s+4]=t[s+4],n[2*s+5]=t[s+5];return super.setColors(n),this}fromLine(t){const e=t.geometry;return this.setPositions(e.attributes.position.array),this}}class te extends Jt{constructor(t=new xt,e=new it({color:Math.random()*16777215})){super(t,e),this.isLine2=!0,this.type="Line2"}}const w=new c.Scene,z=new c.PerspectiveCamera(75,window.innerWidth/window.innerHeight,.1,1e3),B=new c.WebGLRenderer({antialias:!0});B.setSize(window.innerWidth,window.innerHeight);B.setClearColor(16777215,0);document.getElementById("three-container").appendChild(B.domElement);const ee=new c.GridHelper(100,10);w.add(ee);const k=new c.Raycaster,N=new c.Vector2,ie=new it({color:65280,linewidth:10,resolution:new c.Vector2(window.innerWidth,window.innerHeight)}),se=new Nt(z,B.domElement);z.position.set(0,60,40);const gt=new xt;let A,_=[],yt=[],P=null,T=!1,j=!1;const ne=async()=>{console.log("Loading google");const i="AIzaSyCePxIeTCrTCpbw4sbBhsXjnec-QHGE1e8",t=document.getElementById("address-input").value||"Zahradnicka 4833/43, 821 08 Bratislava",e=parseInt(document.getElementById("zoom-input").value,10)||18,n=`https://maps.googleapis.com/maps/api/staticmap?center=${t}&zoom=${e}&size=600x400&maptype=satellite&key=${i}`;return new Promise((s,o)=>{if(!n||!t){o(new Error("No image URL found"));return}new c.TextureLoader().load(n,s,void 0,o)})},st=async()=>{const i=await ne();if(!i)return;const t=new c.PlaneGeometry(100,100),e=new c.MeshBasicMaterial({map:i,side:c.FrontSide}),n=new c.Mesh(t,e);n.rotation.x=-Math.PI/2,w.children.filter(s=>s.isMesh&&s.material.map).forEach(s=>w.remove(s)),w.add(n)},oe=(i,t)=>{let e;return(...n)=>{clearTimeout(e),e=setTimeout(()=>i(...n),t)}};st();const ae=oe(()=>st(),500);document.getElementById("address-button").addEventListener("click",()=>{st()});const nt=()=>{A&&(w.remove(A),A.geometry.dispose(),A.material.dispose()),_.length>1&&(gt.setPositions(_.flatMap(i=>[i.x,i.y,i.z])),A=new te(gt,ie),A.computeLineDistances(),w.add(A))},re=i=>{if(N.x=i.clientX/window.innerWidth*2-1,N.y=-(i.clientY/window.innerHeight)*2+1,k.setFromCamera(N,z),j)yt.forEach((t,e)=>{k.intersectObject(t).length>0&&(w.remove(t),t.geometry.dispose(),t.material.dispose(),yt.splice(e,1))});else if(T){const t=k.intersectObject(w.children.find(e=>e.isMesh&&e.material.map));t.length>0&&(_.push(t[0].point.clone()),nt())}},le=()=>{T=!T,T?(console.log("Drawing Started"),_=[]):console.log("Drawing Stopped"),console.log(T)},he=()=>{j=!j,console.log(j?"Eraser Started":"Eraser Stopped"),console.log(j)},ce=i=>{re(i)},de=i=>{if(T){N.x=i.clientX/window.innerWidth*2-1,N.y=-(i.clientY/window.innerHeight)*2+1,k.setFromCamera(N,z);const t=k.intersectObject(w.children.find(e=>e.isMesh&&e.material.map));t.length>0&&_.length>0&&(_[_.length-1]=t[0].point.clone(),nt())}},pe=()=>{T&&_.length>2&&_[0].distanceTo(_[_.length-1])<1&&(_[_.length-1]=_[0],nt())};document.getElementById("eraser-button").addEventListener("click",he);const ue=(i,t,e,n)=>{if(i.length<3){alert("Please draw a closed polygon first.");return}P&&(w.remove(P),P.geometry.dispose(),P.material.dispose());const s=new c.Shape;s.moveTo(i[0].x,i[0].z);for(let h=1;h<i.length;h++)s.lineTo(i[h].x,i[h].z);s.lineTo(i[0].x,i[0].z);const o=new c.ShapeGeometry(s),a=new c.MeshBasicMaterial({color:65280,side:c.DoubleSide});P=new c.Mesh(o,a),P.position.set(0,t,0);const r=c.MathUtils.degToRad(e);n==="x"?P.rotation.x=r:n==="z"&&(P.rotation.z=r),P.rotation.y=0,w.add(P)},me=(i,t)=>{if(!(i.length<3)){w.children.forEach(e=>{e.name==="wall"&&(w.remove(e),e.geometry.dispose(),e.material.dispose())});for(let e=0;e<i.length;e++){const n=i[e],s=i[(e+1)%i.length],o=n.distanceTo(s),a=t,r=.1,h=new c.BoxGeometry(o,a,r),g=new c.MeshBasicMaterial({color:11184810}),y=new c.Mesh(h,g);y.name="wall";const b=new c.Vector3().addVectors(n,s).multiplyScalar(.5);y.position.set(b.x,a/2,b.z);const v=new c.Vector3().subVectors(s,n).normalize(),V=Math.atan2(v.z,v.x);y.rotation.y=V,w.add(y)}}};document.getElementById("apply-button").addEventListener("click",()=>{const i=parseFloat(document.getElementById("height-input").value),t=parseFloat(document.getElementById("pitch-input").value),e=document.getElementById("pitch-side-input").value;if(isNaN(i)||isNaN(t)){alert("Please enter valid numbers for height and pitch.");return}ue(_,i,t,e),me(_,i)});window.addEventListener("mousedown",ce);window.addEventListener("mousemove",de);window.addEventListener("mouseup",pe);document.getElementById("drawing-button").addEventListener("click",le);document.getElementById("zoom-input").addEventListener("input",i=>{ae(parseInt(i.target.value,10)||18)});document.onkeydown=function(i){i=i||window.event;let t=!1;"key"in i?t=i.key==="Escape"||i.key==="Esc":t=i.keyCode===27,t&&(T=!1,j=!1)};const Mt=()=>{requestAnimationFrame(Mt),se.update(),B.render(w,z)};Mt();window.addEventListener("resize",()=>{B.setSize(window.innerWidth,window.innerHeight),z.aspect=window.innerWidth/window.innerHeight,z.updateProjectionMatrix()});
