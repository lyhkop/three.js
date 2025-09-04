export default /* glsl */`
#if NUM_CLIPPING_PLANES > 0

    vec4 plane;

    #ifdef ALPHA_TO_COVERAGE

        float distanceToPlane, distanceGradient;
        float clipOpacity = 1.0;

        #pragma unroll_loop_start
        for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {

            plane = clippingPlanes[ i ];
            distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
            distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );

        }
        #pragma unroll_loop_end

        #if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES

			float unionClipOpacity = 1.0;

            #pragma unroll_loop_start
            for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {

                plane = clippingPlanes[ i ];
                distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
                distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );

            }
            #pragma unroll_loop_end

			clipOpacity *= 1.0 - unionClipOpacity;

        #endif
        
        vec4 tempColor = diffuseColor;

        tempColor.a *= clipOpacity;

        // 被裁剪的部分设为clippingFillColor和diffuseColor的混合
        if ( tempColor.a == 0.0 ) {
            
            diffuseColor = mix( diffuseColor, clippingFillColor, clippingFillOpacity );

        }

    #else

        bool isClipped = false;

        #pragma unroll_loop_start
        for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {

            plane = clippingPlanes[ i ];
            isClipped = isClipped || ( dot( vClipPosition, plane.xyz ) > plane.w );

        }
        #pragma unroll_loop_end

        #if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES

            if ( !isClipped ) {
                bool intersectionClipped = true;

                #pragma unroll_loop_start
                for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {

                    plane = clippingPlanes[ i ];
                    intersectionClipped = intersectionClipped && ( dot( vClipPosition, plane.xyz ) > plane.w );

                }
                #pragma unroll_loop_end

                isClipped = intersectionClipped;
            }

        #endif

        // 被裁剪的部分设为clippingFillColor和diffuseColor的混合
        #ifdef OPAQUE

            if ( isClipped ) discard;

        #else

            if ( isClipped ) {
                
                diffuseColor = mix( diffuseColor, clippingFillColor, clippingFillOpacity );

            }

        #endif

    #endif

#endif
`;
