export default /* glsl */`
#if NUM_CLIPPING_PLANES > 0

	varying vec3 vClipPosition;

	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];

	// 裁剪部分的填充色
	uniform vec4 clippingFillColor;

	uniform float clippingFillOpacity;

#endif
`;
