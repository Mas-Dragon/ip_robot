/* global THREE */

(() => {
    const CONFIG = {
        modelPath: new URL("rob-draco.glb", document.baseURI).href,

        colors: {
            ember: 0xff4a0a,
            heat: 0xff7a20,
            glow: 0xff9d4a,
            blueFill: 0x5674a8,
            screen: 0x10253a
        },

        breakpoints: {
            mobile: 900
        }
    };

    const supportsFinePointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches;

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // =====================================================
    // Custom Cursor
    // =====================================================

    function initCursor() {
        const cursor =
            document.getElementById("cursor");

        const cursorRing =
            document.getElementById("cursorRing");

        if (
            !supportsFinePointer ||
            !cursor ||
            !cursorRing
        ) {
            return;
        }

        document.body.classList.add(
            "cursor-enabled"
        );

        let mouseX =
            window.innerWidth / 2;

        let mouseY =
            window.innerHeight / 2;

        let ringX =
            mouseX;

        let ringY =
            mouseY;

        let cursorVisible =
            false;

        const showCursor = () => {
            if (cursorVisible) {
                return;
            }

            cursorVisible =
                true;

            cursor.style.opacity =
                "1";

            cursorRing.style.opacity =
                "1";
        };

        const hideCursor = () => {
            cursorVisible =
                false;

            cursor.style.opacity =
                "0";

            cursorRing.style.opacity =
                "0";
        };

        document.addEventListener(
            "mousemove",

            (event) => {
                mouseX =
                    event.clientX;

                mouseY =
                    event.clientY;

                cursor.style.left =
                    `${mouseX}px`;

                cursor.style.top =
                    `${mouseY}px`;

                showCursor();
            },

            {
                passive: true
            }
        );

        document.addEventListener(
            "mouseleave",
            hideCursor,
            {
                passive: true
            }
        );

        function animateCursor() {
            ringX +=
                (
                    mouseX -
                    ringX
                ) *
                0.14;

            ringY +=
                (
                    mouseY -
                    ringY
                ) *
                0.14;

            cursorRing.style.left =
                `${ringX}px`;

            cursorRing.style.top =
                `${ringY}px`;

            requestAnimationFrame(
                animateCursor
            );
        }

        animateCursor();

        document
            .querySelectorAll(
                "a, button, .callout, .spec-card"
            )
            .forEach(
                (element) => {
                    element.addEventListener(
                        "mouseenter",

                        () => {
                            cursorRing.style.width =
                                "56px";

                            cursorRing.style.height =
                                "56px";

                            cursorRing.style.borderColor =
                                "rgba(255,74,10,0.85)";
                        }
                    );

                    element.addEventListener(
                        "mouseleave",

                        () => {
                            cursorRing.style.width =
                                "36px";

                            cursorRing.style.height =
                                "36px";

                            cursorRing.style.borderColor =
                                "rgba(255,74,10,0.5)";
                        }
                    );
                }
            );
    }

    // =====================================================
    // Reveal on Scroll
    // =====================================================

    function initReveal() {
        const revealElements =
            document.querySelectorAll(
                ".reveal"
            );

        if (!revealElements.length) {
            return;
        }

        if (
            !(
                "IntersectionObserver" in
                window
            ) ||
            prefersReducedMotion
        ) {
            revealElements.forEach(
                (element) => {
                    element.classList.add(
                        "visible"
                    );
                }
            );

            return;
        }

        const revealObserver =
            new IntersectionObserver(
                (
                    entries,
                    observer
                ) => {
                    entries.forEach(
                        (entry) => {
                            if (
                                !entry.isIntersecting
                            ) {
                                return;
                            }

                            entry.target
                                .classList
                                .add(
                                    "visible"
                                );

                            observer.unobserve(
                                entry.target
                            );
                        }
                    );
                },

                {
                    threshold:
                        0.14,

                    rootMargin:
                        "0px 0px -40px 0px"
                }
            );

        revealElements.forEach(
            (element) => {
                revealObserver.observe(
                    element
                );
            }
        );
    }

    // =====================================================
    // Three shared helpers
    // =====================================================

    function hasThree() {
        return (
            typeof THREE !==
            "undefined" &&

            typeof THREE.GLTFLoader !==
            "undefined" &&

            typeof THREE.DRACOLoader !==
            "undefined"
        );
    }

    function setStatus(
        id,
        message,
        state = "loading"
    ) {
        const element =
            document.getElementById(
                id
            );

        if (!element) {
            return;
        }

        element.textContent =
            message;

        element.classList.toggle(
            "is-hidden",
            state === "hidden"
        );

        element.classList.toggle(
            "is-error",
            state === "error"
        );
    }

    function fitModelToView(
        model,
        size = 3.2
    ) {
        const box =
            new THREE.Box3()
                .setFromObject(
                    model
                );

        const boxSize =
            new THREE.Vector3();

        const boxCenter =
            new THREE.Vector3();

        box.getSize(
            boxSize
        );

        box.getCenter(
            boxCenter
        );

        const maxAxis =
            Math.max(
                boxSize.x,
                boxSize.y,
                boxSize.z
            ) || 1;

        const scale =
            size /
            maxAxis;

        model.scale.setScalar(
            scale
        );

        box.setFromObject(
            model
        );

        box.getCenter(
            boxCenter
        );

        model.position.sub(
            boxCenter
        );

        return {
            scale,
            boxSize
        };
    }

    function cloneMaterial(
        material
    ) {
        if (!material) {
            return material;
        }

        return Array.isArray(
            material
        )
            ? material.map(
                (item) =>
                    item
                        ? item.clone()
                        : item
            )

            : material.clone();
    }

    function applyPremiumMaterials(
        root
    ) {
        root.traverse(
            (child) => {
                if (
                    !child.isMesh
                ) {
                    return;
                }

                child.castShadow =
                    true;

                child.receiveShadow =
                    true;

                if (
                    !child.material
                ) {
                    return;
                }

                child.material =
                    cloneMaterial(
                        child.material
                    );

                const materials =
                    Array.isArray(
                        child.material
                    )
                        ? child.material
                        : [
                            child.material
                        ];

                materials.forEach(
                    (material) => {
                        if (!material) {
                            return;
                        }

                        material.needsUpdate =
                            true;

                        if (
                            "envMapIntensity" in
                            material
                        ) {
                            material.envMapIntensity =
                                1.25;
                        }

                        if (
                            "metalness" in
                            material
                        ) {
                            material.metalness =
                                Math.min(
                                    1,

                                    Math.max(
                                        0,

                                        material
                                            .metalness ??
                                        0.65
                                    )
                                );
                        }

                        if (
                            "roughness" in
                            material
                        ) {
                            material.roughness =
                                Math.min(
                                    1,

                                    Math.max(
                                        0.08,

                                        material
                                            .roughness ??
                                        0.35
                                    )
                                );
                        }

                        const name =
                            `${child.name} ${material.name || ""}`
                                .toLowerCase();

                        const looksLikeGlass =
                            name.includes(
                                "glass"
                            ) ||

                            name.includes(
                                "screen"
                            ) ||

                            name.includes(
                                "display"
                            );

                        const looksLikeHeat =
                            name.includes(
                                "red"
                            ) ||

                            name.includes(
                                "heat"
                            ) ||

                            name.includes(
                                "light"
                            ) ||

                            name.includes(
                                "led"
                            ) ||

                            name.includes(
                                "glow"
                            );

                        if (
                            looksLikeGlass
                        ) {
                            if (
                                "transparent" in
                                material
                            ) {
                                material.transparent =
                                    true;
                            }

                            if (
                                "opacity" in
                                material
                            ) {
                                material.opacity =
                                    0.88;
                            }

                            if (
                                "metalness" in
                                material
                            ) {
                                material.metalness =
                                    0.15;
                            }

                            if (
                                "roughness" in
                                material
                            ) {
                                material.roughness =
                                    0.02;
                            }

                            if (
                                "emissive" in
                                material
                            ) {
                                material.emissive =
                                    new THREE.Color(
                                        CONFIG
                                            .colors
                                            .screen
                                    );
                            }

                            if (
                                "emissiveIntensity" in
                                material
                            ) {
                                material.emissiveIntensity =
                                    0.8;
                            }
                        }

                        if (
                            looksLikeHeat
                        ) {
                            if (
                                "color" in
                                material
                            ) {
                                material.color.set(
                                    0x260701
                                );
                            }

                            if (
                                "emissive" in
                                material
                            ) {
                                material.emissive.set(
                                    0xff4a0a
                                );
                            }

                            if (
                                "emissiveIntensity" in
                                material
                            ) {
                                material.emissiveIntensity =
                                    1.35;
                            }

                            if (
                                "metalness" in
                                material
                            ) {
                                material.metalness =
                                    0.05;
                            }

                            if (
                                "roughness" in
                                material
                            ) {
                                material.roughness =
                                    0.45;
                            }
                        }
                    }
                );
            }
        );
    }

    function createParticles(
        scene,
        count
    ) {
        const geometry =
            new THREE.BufferGeometry();

        const positions =
            new Float32Array(
                count * 3
            );

        const velocities =
            new Float32Array(
                count
            );

        for (
            let index = 0;
            index < count;
            index += 1
        ) {
            positions[
                index * 3
            ] =
                (
                    Math.random() -
                    0.5
                ) *
                2.1;

            positions[
                index * 3 + 1
            ] =
                Math.random() *
                2.2 -
                0.2;

            positions[
                index * 3 + 2
            ] =
                (
                    Math.random() -
                    0.5
                ) *
                1.3;

            velocities[
                index
            ] =
                0.0018 +
                Math.random() *
                0.0026;
        }

        geometry.setAttribute(
            "position",

            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        geometry.userData.velocities =
            velocities;

        const points =
            new THREE.Points(
                geometry,

                new THREE.PointsMaterial({
                    color:
                        CONFIG
                            .colors
                            .heat,

                    size:
                        0.028,

                    transparent:
                        true,

                    opacity:
                        0.28,

                    sizeAttenuation:
                        true
                })
            );

        scene.add(
            points
        );

        return points;
    }

    function updateParticles(
        points
    ) {
        const positionAttribute =
            points
                .geometry
                .attributes
                .position;

        const positions =
            positionAttribute.array;

        const velocities =
            points
                .geometry
                .userData
                .velocities;

        for (
            let index = 0;
            index <
            positions.length / 3;
            index += 1
        ) {
            positions[
                index * 3 + 1
            ] +=
                velocities[
                index
                ];

            positions[
                index * 3
            ] +=
                Math.sin(
                    index +
                    performance.now() *
                    0.001
                ) *
                0.00035;

            if (
                positions[
                index * 3 + 1
                ] >
                2.3
            ) {
                positions[
                    index * 3 + 1
                ] =
                    -0.3;

                positions[
                    index * 3
                ] =
                    (
                        Math.random() -
                        0.5
                    ) *
                    2.1;
            }
        }

        positionAttribute.needsUpdate =
            true;
    }

    function setupVisibilityLoop(
        section,
        animateFrame
    ) {
        let frameId =
            null;

        let active =
            true;

        const renderLoop =
            () => {
                if (!active) {
                    frameId =
                        null;

                    return;
                }

                frameId =
                    requestAnimationFrame(
                        renderLoop
                    );

                animateFrame();
            };

        const start =
            () => {
                active =
                    true;

                if (
                    frameId ===
                    null
                ) {
                    frameId =
                        requestAnimationFrame(
                            renderLoop
                        );
                }
            };

        const stop =
            () => {
                active =
                    false;
            };

        if (
            "IntersectionObserver" in
            window
        ) {
            const observer =
                new IntersectionObserver(
                    (
                        [entry]
                    ) => {
                        if (
                            entry.isIntersecting &&
                            !document.hidden
                        ) {
                            start();
                        } else {
                            stop();
                        }
                    },

                    {
                        threshold:
                            0.05
                    }
                );

            observer.observe(
                section
            );
        }

        document.addEventListener(
            "visibilitychange",

            () => {
                if (
                    document.hidden
                ) {
                    stop();
                } else {
                    start();
                }
            }
        );

        start();
    }

    // =====================================================
    // Robot loader
    // =====================================================

    let robotModelPromise =
        null;

    function loadRobotModel() {
        if (
            robotModelPromise
        ) {
            return robotModelPromise;
        }

        const candidateUrls =
            Array.from(
                new Set([
                    CONFIG.modelPath,

                    new URL(
                        "./rob-draco.glb",
                        window.location.href
                    ).href,

                    new URL(
                        "/ip_robot/rob-draco.glb",
                        window.location.origin
                    ).href
                ])
            );

        robotModelPromise =
            new Promise(
                (
                    resolve,
                    reject
                ) => {
                    const dracoLoader =
                        new THREE.DRACOLoader();

                    dracoLoader.setDecoderPath(
                        "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
                    );

                    dracoLoader.setDecoderConfig({
                        type:
                            "js"
                    });

                    const loader =
                        new THREE.GLTFLoader();

                    loader.setDRACOLoader(
                        dracoLoader
                    );

                    let currentIndex =
                        0;

                    const tryNextUrl =
                        () => {
                            if (
                                currentIndex >=
                                candidateUrls.length
                            ) {
                                dracoLoader.dispose?.();

                                robotModelPromise =
                                    null;

                                reject(
                                    new Error(
                                        `Robot model could not be loaded from: ${candidateUrls.join(", ")}`
                                    )
                                );

                                return;
                            }

                            const currentUrl =
                                candidateUrls[
                                currentIndex
                                ];

                            currentIndex +=
                                1;

                            loader.load(
                                currentUrl,

                                (
                                    gltf
                                ) => {
                                    dracoLoader.dispose?.();

                                    resolve(
                                        gltf
                                    );
                                },

                                (
                                    xhr
                                ) => {
                                    if (
                                        xhr.total >
                                        0
                                    ) {
                                        const percent =
                                            Math.round(
                                                (
                                                    xhr.loaded /
                                                    xhr.total
                                                ) *
                                                100
                                            );

                                        console.log(
                                            `Robot loading: ${percent}%`
                                        );
                                    }
                                },

                                (
                                    error
                                ) => {
                                    console.warn(
                                        "Robot model load attempt failed:",

                                        currentUrl,

                                        error
                                    );

                                    tryNextUrl();
                                }
                            );
                        };

                    tryNextUrl();
                }
            );

        return robotModelPromise.catch(
            (
                error
            ) => {
                robotModelPromise =
                    null;

                throw error;
            }
        );
    }

    function cloneRobotScene(
        gltf
    ) {
        return gltf.scene.clone(
            true
        );
    }

    // =====================================================
    // Renderer config
    // =====================================================

    function configureRobotRenderer(
        renderer,
        mobile = false
    ) {
        renderer.shadowMap.enabled =
            !mobile;

        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        if (
            "outputColorSpace" in
            renderer &&
            THREE.SRGBColorSpace
        ) {
            renderer.outputColorSpace =
                THREE.SRGBColorSpace;
        } else {
            renderer.outputEncoding =
                THREE.sRGBEncoding;
        }

        renderer.toneMapping =
            THREE.ACESFilmicToneMapping;

        renderer.toneMappingExposure =
            1.02;
    }

    // =====================================================
    // Studio environment
    // =====================================================

    function createRobotStudioEnvironment(
        renderer,
        scene
    ) {
        if (
            !THREE.PMREMGenerator
        ) {
            return null;
        }

        const pmremGenerator =
            new THREE.PMREMGenerator(
                renderer
            );

        const environmentScene =
            new THREE.Scene();

        environmentScene.background =
            new THREE.Color(
                0x030303
            );

        const room =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    18,
                    18,
                    18
                ),

                new THREE.MeshBasicMaterial({
                    color:
                        0x050403,

                    side:
                        THREE.BackSide
                })
            );

        environmentScene.add(
            room
        );

        function addReflectionPanel({
            color,
            intensity,
            width,
            height,
            position
        }) {
            const panelColor =
                new THREE.Color(
                    color
                );

            panelColor.multiplyScalar(
                intensity
            );

            const panel =
                new THREE.Mesh(
                    new THREE.PlaneGeometry(
                        width,
                        height
                    ),

                    new THREE.MeshBasicMaterial({
                        color:
                            panelColor,

                        side:
                            THREE.DoubleSide
                    })
                );

            panel.position.set(
                position[0],
                position[1],
                position[2]
            );

            panel.lookAt(
                0,
                0.25,
                0
            );

            environmentScene.add(
                panel
            );
        }

        addReflectionPanel({
            color:
                0xffead7,

            intensity:
                3.2,

            width:
                4.5,

            height:
                7,

            position: [
                4.8,
                3.4,
                4.2
            ]
        });

        addReflectionPanel({
            color:
                0xb9cada,

            intensity:
                1.15,

            width:
                3.5,

            height:
                6,

            position: [
                -4.8,
                1.5,
                3.6
            ]
        });

        addReflectionPanel({
            color:
                CONFIG
                    .colors
                    .ember,

            intensity:
                2.1,

            width:
                2.2,

            height:
                5.5,

            position: [
                3.2,
                1.2,
                -4.5
            ]
        });

        addReflectionPanel({
            color:
                0xffffff,

            intensity:
                1.6,

            width:
                5.5,

            height:
                1.35,

            position: [
                0,
                6,
                0.8
            ]
        });

        const environmentTarget =
            pmremGenerator.fromScene(
                environmentScene,
                0.04
            );

        scene.environment =
            environmentTarget.texture;

        pmremGenerator.dispose();

        environmentScene.traverse(
            (
                object
            ) => {
                if (
                    !object.isMesh
                ) {
                    return;
                }

                object.geometry?.dispose?.();

                if (
                    Array.isArray(
                        object.material
                    )
                ) {
                    object.material.forEach(
                        (
                            material
                        ) => {
                            material?.dispose?.();
                        }
                    );
                } else {
                    object.material?.dispose?.();
                }
            }
        );

        return environmentTarget;
    }

    // =====================================================
    // Studio lighting
    // =====================================================

    function createRobotStudioLighting(
        scene,
        {
            mobile = false,
            floorY = -1.55,
            targetY = 0.15
        } = {}
    ) {
        const target =
            new THREE.Object3D();

        target.position.set(
            0,
            targetY,
            0
        );

        scene.add(
            target
        );

        const hemisphere =
            new THREE.HemisphereLight(
                0xd9e2ed,
                0x150806,
                0.34
            );

        scene.add(
            hemisphere
        );

        const keyLight =
            new THREE.SpotLight(
                0xffead8,

                mobile
                    ? 2.3
                    : 3.6,

                18,

                Math.PI /
                4.6,

                0.88,

                1.25
            );

        keyLight.position.set(
            4.8,
            6.2,
            5.5
        );

        keyLight.target =
            target;

        keyLight.castShadow =
            !mobile;

        keyLight.shadow.mapSize.set(
            mobile
                ? 1024
                : 2048,

            mobile
                ? 1024
                : 2048
        );

        keyLight.shadow.camera.near =
            0.5;

        keyLight.shadow.camera.far =
            20;

        keyLight.shadow.bias =
            -0.00025;

        keyLight.shadow.normalBias =
            0.025;

        keyLight.shadow.radius =
            4;

        scene.add(
            keyLight
        );

        const fillLight =
            new THREE.DirectionalLight(
                0xc2d1df,
                0.72
            );

        fillLight.position.set(
            -5,
            2.6,
            3.5
        );

        scene.add(
            fillLight
        );

        const rimLight =
            new THREE.SpotLight(
                CONFIG
                    .colors
                    .ember,

                mobile
                    ? 2.1
                    : 3.2,

                15,

                Math.PI /
                4,

                0.87,

                1.5
            );

        rimLight.position.set(
            4,
            2.6,
            -5
        );

        rimLight.target =
            target;

        scene.add(
            rimLight
        );

        const topLight =
            new THREE.DirectionalLight(
                0xffffff,
                0.65
            );

        topLight.position.set(
            0,
            7,
            -0.5
        );

        scene.add(
            topLight
        );

        const heaterLight =
            new THREE.PointLight(
                0xff5b22,
                0.55,
                3.4,
                2
            );

        heaterLight.position.set(
            0.7,
            0.45,
            1.15
        );

        scene.add(
            heaterLight
        );

        const shadowFloor =
            new THREE.Mesh(
                new THREE.CircleGeometry(
                    5.4,
                    96
                ),

                new THREE.ShadowMaterial({
                    color:
                        0x000000,

                    opacity:
                        0.22,

                    transparent:
                        true
                })
            );

        shadowFloor.rotation.x =
            -Math.PI /
            2;

        shadowFloor.position.y =
            floorY;

        shadowFloor.receiveShadow =
            true;

        scene.add(
            shadowFloor
        );

        const ring =
            new THREE.Mesh(
                new THREE.RingGeometry(
                    2.35,
                    2.43,
                    96
                ),

                new THREE.MeshBasicMaterial({
                    color:
                        CONFIG
                            .colors
                            .ember,

                    transparent:
                        true,

                    opacity:
                        0.24,

                    side:
                        THREE.DoubleSide,

                    depthWrite:
                        false
                })
            );

        ring.rotation.x =
            -Math.PI /
            2;

        ring.position.y =
            floorY +
            0.015;

        scene.add(
            ring
        );

        return {
            hemisphere,
            keyLight,
            fillLight,
            rimLight,
            topLight,
            heaterLight,
            shadowFloor,
            ring
        };
    }

    // =====================================================
    // Hero Scene
    // =====================================================

    function initHeroScene() {
        const canvas =
            document.getElementById(
                "three-canvas"
            );

        const section =
            document.getElementById(
                "hero"
            );

        if (
            !canvas ||
            !section
        ) {
            return;
        }

        if (
            !hasThree()
        ) {
            setStatus(
                "hero-model-status",
                "3D engine failed to load.",
                "error"
            );

            return;
        }

        const isMobile =
            () =>
                window.innerWidth <
                CONFIG.breakpoints.mobile;

        // =====================================================
        // REAL CANVAS SIZE
        // =====================================================

        function getHeroViewportSize() {
            const rect =
                canvas.getBoundingClientRect();

            return {
                width:
                    Math.max(
                        1,
                        Math.round(
                            rect.width ||
                            canvas.clientWidth ||
                            window.innerWidth
                        )
                    ),

                height:
                    Math.max(
                        1,
                        Math.round(
                            rect.height ||
                            canvas.clientHeight ||
                            window.innerHeight
                        )
                    )
            };
        }

        const initialViewport =
            getHeroViewportSize();

        // =====================================================
        // RENDERER
        // =====================================================

        const renderer =
            new THREE.WebGLRenderer({
                canvas,

                antialias:
                    !isMobile(),

                alpha:
                    true,

                powerPreference:
                    "high-performance"
            });

        renderer.setSize(
            initialViewport.width,
            initialViewport.height,
            false
        );

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,

                isMobile()
                    ? 1.15
                    : 1.7
            )
        );

        configureRobotRenderer(
            renderer,
            isMobile()
        );

        // الموبايل بدون Shadows
        // لتخفيف الضغط على GPU

        renderer.shadowMap.enabled =
            !isMobile();

        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        renderer.toneMapping =
            THREE.ACESFilmicToneMapping;

        renderer.toneMappingExposure =
            0.96;

        // =====================================================
        // SCENE
        // =====================================================

        const scene =
            new THREE.Scene();

        createRobotStudioEnvironment(
            renderer,
            scene
        );

        const heroLighting =
            createRobotStudioLighting(
                scene,

                {
                    mobile:
                        isMobile(),

                    floorY:
                        -1.65,

                    targetY:
                        isMobile()
                            ? -0.1
                            : 0.1
                }
            );

        // =====================================================
        // PARTICLES
        // =====================================================

        const particles =
            prefersReducedMotion

                ? null

                : createParticles(
                    scene,

                    isMobile()
                        ? 32
                        : 90
                );

        // =====================================================
        // CAMERA
        // =====================================================

        const camera =
            new THREE.PerspectiveCamera(
                isMobile()
                    ? 32
                    : 30,

                initialViewport.width /
                initialViewport.height,

                0.1,

                100
            );

        camera.position.set(
            isMobile()
                ? 0
                : 4.8,

            isMobile()
                ? 0.15
                : 0.9,

            isMobile()
                ? 8.3
                : 9.4
        );

        // =====================================================
        // MODEL GROUP
        // =====================================================

        const modelGroup =
            new THREE.Group();

        scene.add(
            modelGroup
        );

        let model =
            null;

        let modelBaseScale =
            1;

        let targetRotY =
            0;

        let currentRotY =
            0;

        let mouseOffsetX =
            0;

        let mouseOffsetY =
            0;

        let scrollY =
            window.scrollY;

        let introProgress =
            prefersReducedMotion
                ? 1
                : 0;

        // =====================================================
        // MOUSE
        // =====================================================

        const updateMouse =
            (
                event
            ) => {

                if (
                    isMobile() ||
                    prefersReducedMotion
                ) {
                    return;
                }

                const nx =
                    event.clientX /
                    window.innerWidth -
                    0.5;

                const ny =
                    event.clientY /
                    window.innerHeight -
                    0.5;

                targetRotY =
                    nx *
                    0.38;

                mouseOffsetX =
                    nx *
                    0.55;

                mouseOffsetY =
                    ny *
                    0.28;
            };

        document.addEventListener(
            "mousemove",
            updateMouse,
            {
                passive: true
            }
        );

        // =====================================================
        // SCROLL
        // =====================================================

        window.addEventListener(
            "scroll",

            () => {
                scrollY =
                    window.scrollY;
            },

            {
                passive: true
            }
        );

        // =====================================================
        // LOAD ROBOT
        // =====================================================

        loadRobotModel()
            .then(
                (
                    gltf
                ) => {

                    model =
                        cloneRobotScene(
                            gltf
                        );

                    modelGroup.add(
                        model
                    );

                    applyPremiumMaterials(
                        model
                    );

                    /*
                     * مهم جدًا:
                     *
                     * نعمل fit مرة واحدة فقط.
                     *
                     * لا نعيد fitModelToView
                     * عند resize.
                     */

                    fitModelToView(
                        model,

                        isMobile()
                            ? 2.25
                            : 3
                    );

                    modelBaseScale =
                        model.scale.x;

                    model.rotation.y =
                        -0.45;

                    model.position.set(
                        isMobile()
                            ? 0
                            : 2.6,

                        isMobile()
                            ? -0.1
                            : 1.05,

                        0.15
                    );

                    setStatus(
                        "hero-model-status",
                        "",
                        "hidden"
                    );
                }
            )

            .catch(
                (
                    error
                ) => {

                    console.error(
                        "Failed to load hero robot model",
                        error
                    );

                    setStatus(
                        "hero-model-status",

                        "3D model could not be loaded.",

                        "error"
                    );
                }
            );

        // =====================================================
        // CLOCK
        // =====================================================

        const clock =
            new THREE.Clock();

        // =====================================================
        // RESIZE
        // =====================================================

        function updateHeroLayout() {
            const mobile =
                isMobile();

            const {
                width,
                height
            } =
                getHeroViewportSize();

            /*
             * نستخدم الحجم الحقيقي للـ canvas.
             *
             * false تعني:
             * لا تجعل Three.js يعدل CSS
             * للـ canvas.
             */

            renderer.setSize(
                width,
                height,
                false
            );

            renderer.setPixelRatio(
                Math.min(
                    window.devicePixelRatio ||
                    1,

                    mobile
                        ? 1.15
                        : 1.7
                )
            );

            renderer.shadowMap.enabled =
                !mobile;

            // تحديث Aspect Ratio الصحيح

            camera.aspect =
                width /
                height;

            // Camera FOV

            camera.fov =
                mobile
                    ? 32
                    : 30;

            // Camera Z

            camera.position.z =
                mobile
                    ? 9.4
                    : 9.4;
            // Camera Y

            camera.position.y =
                mobile
                    ? 0.15
                    : 0.9;

            camera.updateProjectionMatrix();

            /*
             * لا تضع هنا:
             *
             * fitModelToView(...)
             *
             * لأنه كان يسبب تغير Scale
             * واختفاء المجسم على بعض الهواتف.
             */
        }

        // =====================================================
        // RESIZE OBSERVER
        // =====================================================

        const heroResizeObserver =
            "ResizeObserver" in
                window

                ? new ResizeObserver(
                    () => {
                        updateHeroLayout();
                    }
                )

                : null;

        heroResizeObserver?.observe(
            canvas
        );

        // =====================================================
        // WINDOW RESIZE
        // =====================================================

        let resizeFrame =
            null;

        window.addEventListener(
            "resize",

            () => {

                if (
                    resizeFrame !==
                    null
                ) {
                    cancelAnimationFrame(
                        resizeFrame
                    );
                }

                resizeFrame =
                    requestAnimationFrame(
                        updateHeroLayout
                    );
            },

            {
                passive: true
            }
        );

        // تحديث أولي للحجم

        updateHeroLayout();

        // =====================================================
        // RENDER LOOP
        // =====================================================

        setupVisibilityLoop(
            section,

            () => {

                const t =
                    clock.getElapsedTime();

                const mobile =
                    isMobile();

                // =================================================
                // MODEL MOVEMENT
                // =================================================

                if (
                    model
                ) {

                    // Intro animation

                    introProgress +=
                        (
                            1 -
                            introProgress
                        ) *
                        0.035;

                    // Mouse rotation

                    currentRotY +=
                        (
                            targetRotY -
                            currentRotY
                        ) *
                        0.045;

                    // =================================================
                    // FINAL POSITION
                    // =================================================

                    const finalX =
                        mobile
                            ? 0
                            : 1.9;

                    const finalY =
                        mobile
                            ? -2.15
                            : -1.38;

                    // =================================================
                    // INTRO Y
                    // =================================================

                    const introY =
                        THREE.MathUtils.lerp(

                            finalY +
                            (
                                mobile
                                    ? 0.22
                                    : 0.5
                            ),

                            finalY,

                            introProgress
                        );

                    // =================================================
                    // INTRO SCALE
                    // =================================================

                    const introScale =
                        THREE.MathUtils.lerp(

                            modelBaseScale *
                            0.42,

                            modelBaseScale,

                            introProgress
                        );

                    // =================================================
                    // SCROLL EFFECT
                    // =================================================

                    /*
                     * على الموبايل:
                     * نوقف تحريك المجسم بالـ Scroll
                     * حتى يبقى ثابتًا داخل الكاميرا.
                     */

                    const scrollInfluence =
                        mobile
                            ? 0
                            : Math.min(
                                scrollY /
                                1200,

                                1
                            );

                    // =================================================
                    // SCALE
                    // =================================================

                    model.scale.setScalar(
                        introScale
                    );

                    // =================================================
                    // POSITION X
                    // =================================================

                    model.position.x =
                        finalX +
                        mouseOffsetX *
                        (
                            mobile
                                ? 0
                                : 0.12
                        );

                    // =================================================
                    // POSITION Y
                    // =================================================

                    model.position.y =
                        introY +
                        (
                            prefersReducedMotion

                                ? 0

                                : Math.sin(
                                    t *
                                    0.9
                                ) *
                                (
                                    mobile
                                        ? 0.018
                                        : 0.04
                                )
                        );

                    // =================================================
                    // POSITION Z
                    // =================================================

                    model.position.z =
                        scrollInfluence *
                        0.35;

                    // =================================================
                    // ROTATION X
                    // =================================================

                    model.rotation.x =
                        -0.04 +

                        scrollInfluence *
                        0.08 +

                        mouseOffsetY *
                        0.05;

                    // =================================================
                    // ROTATION Y
                    // =================================================

                    model.rotation.y =
                        -0.45 +

                        currentRotY +

                        (
                            prefersReducedMotion

                                ? 0

                                : Math.sin(
                                    t *
                                    0.4
                                ) *
                                0.04
                        );
                }

                // =================================================
                // LIGHT ANIMATION
                // =================================================

                if (
                    !prefersReducedMotion
                ) {

                    heroLighting
                        .heaterLight
                        .intensity =

                        0.55 +

                        Math.sin(
                            t *
                            2.1
                        ) *
                        0.045;


                    heroLighting
                        .rimLight
                        .intensity =

                        3.2 +

                        Math.cos(
                            t *
                            0.85
                        ) *
                        0.12;


                    heroLighting
                        .ring
                        .material
                        .opacity =

                        0.22 +

                        Math.sin(
                            t *
                            1.25
                        ) *
                        0.035;
                }

                // =================================================
                // PARTICLES
                // =================================================

                if (
                    particles
                ) {

                    updateParticles(
                        particles
                    );
                }

                // =================================================
                // CAMERA X
                // =================================================

                camera.position.x =
                    (
                        mobile
                            ? 0
                            : 4.8
                    ) +

                    mouseOffsetX *
                    (
                        mobile
                            ? 0
                            : 0.08
                    );

                // =================================================
                // CAMERA Y
                // =================================================

                camera.position.y =
                    mobile

                        ? 0.15

                        : 0.9 -

                        Math.min(

                            scrollY *
                            0.00035,

                            0.28
                        );

                // =================================================
                // CAMERA LOOK AT
                // =================================================

                camera.lookAt(
                    mobile ? 0 : 1.55,
                    mobile ? -0.45 : 0.18,
                    0
                );
                // =================================================
                // RENDER
                // =================================================

                renderer.render(
                    scene,
                    camera
                );
            }
        );
    }

    // =====================================================
    // Spotlight settings
    // =====================================================

    const SPOTLIGHT_CONFIG = {
        editMode:
            false,

        storageKey:
            "iprobotx-spotlight-hotspots-v1",

        model: {
            desktopSize:
                2.9,

            tabletSize:
                2.55,

            mobileSize:
                2.1,

            position: {
                x:
                    0,

                y:
                    -0.08,

                z:
                    0
            },

            rotationY:
                -0.16,

            cameraDesktopZ:
                7.4,

            cameraTabletZ:
                7.9,

            cameraMobileZ:
                8.4,

            automaticMotion:
                true
        },

        hotspots: [
            {
                title:
                    "ŞASİ",

                anchor: [
                    0.17,
                    0.48,
                    0.92
                ],

                nodeOffset: [
                    0,
                    0
                ],

                labelOffset: [
                    -132,
                    -34
                ]
            },

            {
                title:
                    "ISITMA",

                anchor: [
                    0.50,
                    0.61,
                    0.95
                ],

                nodeOffset: [
                    0,
                    0
                ],

                labelOffset: [
                    46,
                    -38
                ]
            },

            {
                title:
                    "DÖNÜŞ",

                anchor: [
                    0.48,
                    0.18,
                    0.94
                ],

                nodeOffset: [
                    0,
                    0
                ],

                labelOffset: [
                    -126,
                    38
                ]
            },

            {
                title:
                    "KONTROL",

                anchor: [
                    0.82,
                    0.30,
                    0.94
                ],

                nodeOffset: [
                    0,
                    0
                ],

                labelOffset: [
                    46,
                    24
                ]
            },

            {
                title:
                    "MÜHENDİSLİK",

                anchor: [
                    0.48,
                    0.88,
                    0.84
                ],

                nodeOffset: [
                    0,
                    0
                ],

                labelOffset: [
                    46,
                    -32
                ]
            }
        ]
    };

    // =====================================================
    // Spotlight Scene
    // =====================================================

    function initSpotlightScene() {
        const canvas =
            document.getElementById(
                "spotlight-canvas"
            );

        const section =
            document.getElementById(
                "spotlight"
            );

        const visual =
            canvas?.closest(
                ".spotlight-visual"
            );

        const hotspotLayer =
            document.getElementById(
                "spotlightHotspots"
            );

        const hotspotSvg =
            document.getElementById(
                "spotlightHotspotSvg"
            );

        if (
            !canvas ||
            !section ||
            !visual ||
            !hotspotLayer ||
            !hotspotSvg
        ) {
            return;
        }

        if (
            !hasThree()
        ) {
            setStatus(
                "spotlight-model-status",
                "3D engine failed to load.",
                "error"
            );

            return;
        }

        const isMobile =
            () =>
                window.innerWidth <
                700;

        const isTablet =
            () =>
                window.innerWidth >=
                700 &&
                window.innerWidth <
                1180;

        // =====================================================
        // MODEL SIZE
        // =====================================================

        function getModelSize() {
            if (isMobile()) {
                return 2.65;
            }

            if (isTablet()) {
                return SPOTLIGHT_CONFIG
                    .model
                    .tabletSize;
            }

            return SPOTLIGHT_CONFIG
                .model
                .desktopSize;
        }

        // =====================================================
        // CAMERA Z
        // =====================================================

        function getCameraZ() {
            if (isMobile()) {
                return 7.8;
            }

            if (isTablet()) {
                return SPOTLIGHT_CONFIG
                    .model
                    .cameraTabletZ;
            }

            return SPOTLIGHT_CONFIG
                .model
                .cameraDesktopZ;
        }

        function getViewportSize() {
            return {
                width:
                    Math.max(
                        1,
                        visual.clientWidth
                    ),

                height:
                    Math.max(
                        420,
                        visual.clientHeight ||
                        640
                    )
            };
        }

        const initialSize =
            getViewportSize();

        // =====================================================
        // RENDERER
        // =====================================================

        const renderer =
            new THREE.WebGLRenderer({
                canvas,

                antialias:
                    !isMobile(),

                alpha:
                    true,

                powerPreference:
                    "high-performance"
            });

        renderer.setClearColor(
            0x000000,
            0
        );

        renderer.setSize(
            initialSize.width,
            initialSize.height,
            false
        );

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,

                isMobile()
                    ? 1.15
                    : 1.65
            )
        );

        configureRobotRenderer(
            renderer,
            isMobile()
        );

        renderer.toneMappingExposure =
            1.05;

        // =====================================================
        // SCENE
        // =====================================================

        const scene =
            new THREE.Scene();

        createRobotStudioEnvironment(
            renderer,
            scene
        );

        const spotlightLighting =
            createRobotStudioLighting(
                scene,

                {
                    mobile:
                        isMobile(),

                    floorY:
                        -1.53,

                    targetY:
                        0.05
                }
            );

        // =====================================================
        // CAMERA
        // =====================================================

        const camera =
            new THREE.PerspectiveCamera(
                isMobile()
                    ? 31
                    : 31,

                initialSize.width /
                initialSize.height,

                0.1,

                100
            );

        camera.position.set(
            0,

            isMobile()
                ? 0.05
                : 0.12,

            getCameraZ()
        );

        camera.lookAt(
            0,

            isMobile()
                ? 0.15
                : 0,

            0
        );

        // =====================================================
        // MODEL RIG
        // =====================================================

        const modelRig =
            new THREE.Group();

        scene.add(
            modelRig
        );

        const callouts =
            Array.from(
                section.querySelectorAll(
                    ".callout[data-callout]"
                )
            );

        const hotspotItems =
            [];

        const defaultHotspotSettings =
            JSON.parse(
                JSON.stringify(
                    SPOTLIGHT_CONFIG
                        .hotspots
                )
            );

        let model =
            null;

        let wireframeModel =
            null;

        let modelReady =
            false;

        let visualHovered =
            false;

        let pointerTarget =
            0;

        let pointerRotation =
            0;

        let activeHotspotIndex =
            0;

        let editMode =
            Boolean(
                SPOTLIGHT_CONFIG
                    .editMode
            );

        function clamp(
            value,
            minimum,
            maximum
        ) {
            return Math.max(
                minimum,

                Math.min(
                    maximum,
                    value
                )
            );
        }

        function applyEditMode() {
            visual.classList.toggle(
                "is-editing",
                editMode
            );

            visual.dataset.editMode =
                editMode
                    ? "true"
                    : "false";

            hotspotItems.forEach(
                (
                    item
                ) => {
                    if (
                        editMode
                    ) {
                        item.node.setAttribute(
                            "aria-grabbed",
                            "false"
                        );

                        item.label.setAttribute(
                            "aria-grabbed",
                            "false"
                        );
                    } else {
                        item.node.removeAttribute(
                            "aria-grabbed"
                        );

                        item.label.removeAttribute(
                            "aria-grabbed"
                        );
                    }
                }
            );
        }

        function loadSavedHotspotSettings() {
            try {
                const saved =
                    JSON.parse(
                        localStorage.getItem(
                            SPOTLIGHT_CONFIG
                                .storageKey
                        ) ||
                        "null"
                    );

                if (
                    !Array.isArray(
                        saved
                    )
                ) {
                    return;
                }

                saved.forEach(
                    (
                        savedItem,
                        index
                    ) => {
                        const target =
                            SPOTLIGHT_CONFIG
                                .hotspots[
                            index
                            ];

                        if (
                            !target ||
                            !savedItem
                        ) {
                            return;
                        }

                        if (
                            Array.isArray(
                                savedItem
                                    .nodeOffset
                            ) &&
                            savedItem
                                .nodeOffset
                                .length ===
                            2
                        ) {
                            target.nodeOffset =
                                savedItem
                                    .nodeOffset
                                    .map(
                                        Number
                                    );
                        }

                        if (
                            Array.isArray(
                                savedItem
                                    .labelOffset
                            ) &&
                            savedItem
                                .labelOffset
                                .length ===
                            2
                        ) {
                            target.labelOffset =
                                savedItem
                                    .labelOffset
                                    .map(
                                        Number
                                    );
                        }
                    }
                );
            } catch (
            error
            ) {
                console.warn(
                    "Could not load saved spotlight positions.",
                    error
                );
            }
        }

        function saveHotspotSettings() {
            try {
                const payload =
                    SPOTLIGHT_CONFIG
                        .hotspots
                        .map(
                            (
                                hotspot
                            ) => ({
                                title:
                                    hotspot.title,

                                nodeOffset: [
                                    ...hotspot.nodeOffset
                                ],

                                labelOffset: [
                                    ...hotspot.labelOffset
                                ]
                            })
                        );

                localStorage.setItem(
                    SPOTLIGHT_CONFIG
                        .storageKey,

                    JSON.stringify(
                        payload
                    )
                );
            } catch (
            error
            ) {
                console.warn(
                    "Could not save spotlight positions.",
                    error
                );
            }
        }

        function setActiveHotspot(
            index
        ) {
            activeHotspotIndex =
                index;

            hotspotItems.forEach(
                (
                    item,
                    itemIndex
                ) => {
                    const active =
                        itemIndex ===
                        index;

                    item.node
                        .classList
                        .toggle(
                            "is-active",
                            active
                        );

                    item.label
                        .classList
                        .toggle(
                            "is-active",
                            active
                        );

                    item.line
                        .classList
                        .toggle(
                            "is-active",
                            active
                        );
                }
            );

            callouts.forEach(
                (
                    callout,
                    calloutIndex
                ) => {
                    const active =
                        calloutIndex ===
                        index;

                    callout
                        .classList
                        .toggle(
                            "is-active",
                            active
                        );

                    callout.setAttribute(
                        "aria-current",

                        active
                            ? "true"
                            : "false"
                    );
                }
            );
        }

        function enableDragging(
            element,
            offsetArray,
            hotspotIndex,
            type
        ) {
            let dragging =
                false;

            let startMouseX =
                0;

            let startMouseY =
                0;

            let startOffsetX =
                0;

            let startOffsetY =
                0;

            element.addEventListener(
                "pointerdown",

                (
                    event
                ) => {
                    if (
                        !editMode
                    ) {
                        return;
                    }

                    dragging =
                        true;

                    startMouseX =
                        event.clientX;

                    startMouseY =
                        event.clientY;

                    startOffsetX =
                        offsetArray[0];

                    startOffsetY =
                        offsetArray[1];

                    element.classList.add(
                        "is-dragging"
                    );

                    element.setPointerCapture(
                        event.pointerId
                    );

                    event.preventDefault();

                    event.stopPropagation();
                }
            );

            element.addEventListener(
                "pointermove",

                (
                    event
                ) => {
                    if (
                        !dragging
                    ) {
                        return;
                    }

                    offsetArray[0] =
                        Math.round(
                            startOffsetX +
                            event.clientX -
                            startMouseX
                        );

                    offsetArray[1] =
                        Math.round(
                            startOffsetY +
                            event.clientY -
                            startMouseY
                        );

                    event.preventDefault();

                    event.stopPropagation();
                }
            );

            function finishDrag(
                event
            ) {
                if (
                    !dragging
                ) {
                    return;
                }

                dragging =
                    false;

                element.classList.remove(
                    "is-dragging"
                );

                if (
                    element.hasPointerCapture?.(
                        event.pointerId
                    )
                ) {
                    element.releasePointerCapture(
                        event.pointerId
                    );
                }

                saveHotspotSettings();

                console.log(
                    `${type} position updated and saved`,
                    hotspotIndex
                );
            }

            element.addEventListener(
                "pointerup",
                finishDrag
            );

            element.addEventListener(
                "pointercancel",
                finishDrag
            );
        }

        function createHotspotElements() {
            loadSavedHotspotSettings();

            SPOTLIGHT_CONFIG
                .hotspots
                .forEach(
                    (
                        hotspot,
                        index
                    ) => {
                        const line =
                            document.createElementNS(
                                "http://www.w3.org/2000/svg",
                                "line"
                            );

                        line.classList.add(
                            "hotspot-line"
                        );

                        line.style.opacity =
                            "0";

                        hotspotSvg.appendChild(
                            line
                        );

                        const node =
                            document.createElement(
                                "button"
                            );

                        node.type =
                            "button";

                        node.className =
                            "hotspot-node";

                        node.textContent =
                            String(
                                index +
                                1
                            ).padStart(
                                2,
                                "0"
                            );

                        node.setAttribute(
                            "aria-label",
                            hotspot.title
                        );

                        node.style.opacity =
                            "0";

                        node.style.visibility =
                            "hidden";

                        const label =
                            document.createElement(
                                "button"
                            );

                        label.type =
                            "button";

                        label.className =
                            "hotspot-label";

                        label.textContent =
                            hotspot.title;

                        label.style.opacity =
                            "0";

                        label.style.visibility =
                            "hidden";

                        hotspotLayer.append(
                            node,
                            label
                        );

                        const activate =
                            () => {
                                setActiveHotspot(
                                    index
                                );
                            };

                        node.addEventListener(
                            "mouseenter",
                            activate
                        );

                        node.addEventListener(
                            "focus",
                            activate
                        );

                        node.addEventListener(
                            "click",
                            activate
                        );

                        label.addEventListener(
                            "mouseenter",
                            activate
                        );

                        label.addEventListener(
                            "focus",
                            activate
                        );

                        label.addEventListener(
                            "click",
                            activate
                        );

                        enableDragging(
                            node,
                            hotspot.nodeOffset,
                            index,
                            "Node"
                        );

                        enableDragging(
                            label,
                            hotspot.labelOffset,
                            index,
                            "Label"
                        );

                        const callout =
                            callouts[
                            index
                            ];

                        if (
                            callout
                        ) {
                            callout.tabIndex =
                                0;

                            callout.addEventListener(
                                "mouseenter",
                                activate
                            );

                            callout.addEventListener(
                                "focus",
                                activate
                            );

                            callout.addEventListener(
                                "click",
                                activate
                            );
                        }

                        hotspotItems.push({
                            line,
                            node,
                            label,
                            anchor:
                                null,
                            hotspot
                        });
                    }
                );

            applyEditMode();
        }

        function createAnchorFromBounds(
            targetModel,
            bounds,
            normalizedPosition
        ) {
            const [
                normalizedX,
                normalizedY,
                normalizedZ
            ] =
                normalizedPosition;

            const worldPoint =
                new THREE.Vector3(
                    THREE.MathUtils.lerp(
                        bounds.min.x,
                        bounds.max.x,
                        normalizedX
                    ),

                    THREE.MathUtils.lerp(
                        bounds.min.y,
                        bounds.max.y,
                        normalizedY
                    ),

                    THREE.MathUtils.lerp(
                        bounds.min.z,
                        bounds.max.z,
                        normalizedZ
                    )
                );

            const localPoint =
                targetModel.worldToLocal(
                    worldPoint.clone()
                );

            const anchor =
                new THREE.Object3D();

            anchor.position.copy(
                localPoint
            );

            targetModel.add(
                anchor
            );

            return anchor;
        }

        function disposeWireframe(
            root
        ) {
            root.traverse(
                (
                    child
                ) => {
                    if (
                        !child.isMesh
                    ) {
                        return;
                    }

                    if (
                        Array.isArray(
                            child.material
                        )
                    ) {
                        child.material.forEach(
                            (
                                material
                            ) => {
                                material?.dispose?.();
                            }
                        );
                    } else {
                        child.material?.dispose?.();
                    }
                }
            );
        }

        // =====================================================
        // REBUILD MODEL
        // =====================================================

        function rebuildModelLayout() {
            if (
                !model
            ) {
                return;
            }

            modelRig.position.set(
                0,
                0,
                0
            );

            modelRig.rotation.set(
                0,
                0,
                0
            );

            modelRig.scale.set(
                1,
                1,
                1
            );

            model.scale.setScalar(
                1
            );

            model.position.set(
                0,
                0,
                0
            );

            model.rotation.set(
                0,
                0,
                0
            );

            // حجم مختلف للموبايل
            fitModelToView(
                model,
                getModelSize()
            );

            if (
                wireframeModel
            ) {
                modelRig.remove(
                    wireframeModel
                );

                disposeWireframe(
                    wireframeModel
                );

                wireframeModel =
                    null;
            }

            model.updateMatrixWorld(
                true
            );

            wireframeModel =
                model.clone(
                    true
                );

            wireframeModel.traverse(
                (
                    child
                ) => {
                    if (
                        !child.isMesh
                    ) {
                        return;
                    }

                    child.material =
                        new THREE.MeshBasicMaterial({
                            color:
                                CONFIG
                                    .colors
                                    .ember,

                            wireframe:
                                true,

                            transparent:
                                true,

                            opacity:
                                0.035,

                            depthWrite:
                                false
                        });
                }
            );

            wireframeModel.scale.multiplyScalar(
                1.004
            );

            modelRig.add(
                wireframeModel
            );

            hotspotItems.forEach(
                (
                    item
                ) => {
                    if (
                        item.anchor
                    ) {
                        item.anchor.removeFromParent();

                        item.anchor =
                            null;
                    }
                }
            );

            model.updateMatrixWorld(
                true
            );

            const bounds =
                new THREE.Box3()
                    .setFromObject(
                        model
                    );

            hotspotItems.forEach(
                (
                    item
                ) => {
                    item.anchor =
                        createAnchorFromBounds(
                            model,
                            bounds,
                            item.hotspot.anchor
                        );
                }
            );

            // =================================================
            // MODEL POSITION
            // =================================================

            modelRig.position.set(
                isMobile()
                    ? 0
                    : SPOTLIGHT_CONFIG
                        .model
                        .position
                        .x,

                isMobile()
                    ? -0.05
                    : SPOTLIGHT_CONFIG
                        .model
                        .position
                        .y,

                SPOTLIGHT_CONFIG
                    .model
                    .position
                    .z
            );

            modelRig.rotation.y =
                SPOTLIGHT_CONFIG
                    .model
                    .rotationY;

            modelRig.updateMatrixWorld(
                true
            );
        }

        function updateHotspots() {
            if (
                !modelReady ||
                !hotspotItems.length
            ) {
                return;
            }

            const width =
                visual.clientWidth;

            const height =
                visual.clientHeight;

            hotspotItems.forEach(
                (
                    item
                ) => {
                    if (
                        !item.anchor
                    ) {
                        return;
                    }

                    const projected =
                        new THREE.Vector3();

                    item.anchor.getWorldPosition(
                        projected
                    );

                    projected.project(
                        camera
                    );

                    const projectedX =
                        (
                            projected.x *
                            0.5 +
                            0.5
                        ) *
                        width;

                    const projectedY =
                        (
                            -projected.y *
                            0.5 +
                            0.5
                        ) *
                        height;

                    const nodeX =
                        clamp(
                            projectedX +
                            item
                                .hotspot
                                .nodeOffset[
                            0
                            ],

                            24,

                            width -
                            24
                        );

                    const nodeY =
                        clamp(
                            projectedY +
                            item
                                .hotspot
                                .nodeOffset[
                            1
                            ],

                            24,

                            height -
                            24
                        );

                    const labelX =
                        clamp(
                            nodeX +
                            item
                                .hotspot
                                .labelOffset[
                            0
                            ],

                            18,

                            width -
                            150
                        );

                    const labelY =
                        clamp(
                            nodeY +
                            item
                                .hotspot
                                .labelOffset[
                            1
                            ],

                            30,

                            height -
                            30
                        );

                    const visible =
                        projected.z >
                        -1 &&
                        projected.z <
                        1 &&
                        projectedX >
                        -80 &&
                        projectedX <
                        width +
                        80 &&
                        projectedY >
                        -80 &&
                        projectedY <
                        height +
                        80;

                    item.node.style.left =
                        `${nodeX}px`;

                    item.node.style.top =
                        `${nodeY}px`;

                    item.node.style.opacity =
                        visible
                            ? "1"
                            : "0";

                    item.node.style.visibility =
                        visible
                            ? "visible"
                            : "hidden";

                    item.label.style.left =
                        `${labelX}px`;

                    item.label.style.top =
                        `${labelY}px`;

                    item.label.style.opacity =
                        visible
                            ? "1"
                            : "0";

                    item.label.style.visibility =
                        visible
                            ? "visible"
                            : "hidden";

                    item.line.setAttribute(
                        "x1",
                        String(
                            nodeX
                        )
                    );

                    item.line.setAttribute(
                        "y1",
                        String(
                            nodeY
                        )
                    );

                    item.line.setAttribute(
                        "x2",
                        String(
                            labelX
                        )
                    );

                    item.line.setAttribute(
                        "y2",
                        String(
                            labelY
                        )
                    );

                    item.line.style.opacity =
                        visible
                            ? "1"
                            : "0";
                }
            );
        }

        // =====================================================
        // CREATE HOTSPOTS
        // =====================================================

        createHotspotElements();

        // =====================================================
        // LOAD MODEL
        // =====================================================

        loadRobotModel()
            .then(
                (
                    gltf
                ) => {
                    model =
                        cloneRobotScene(
                            gltf
                        );

                    modelRig.add(
                        model
                    );

                    applyPremiumMaterials(
                        model
                    );

                    rebuildModelLayout();

                    modelReady =
                        true;

                    setActiveHotspot(
                        0
                    );

                    setStatus(
                        "spotlight-model-status",
                        "",
                        "hidden"
                    );
                }
            )

            .catch(
                (
                    error
                ) => {
                    console.error(
                        "Failed loading spotlight robot model",
                        error
                    );

                    setStatus(
                        "spotlight-model-status",
                        "3D model could not be loaded.",
                        "error"
                    );
                }
            );

        // =====================================================
        // POINTER
        // =====================================================

        visual.addEventListener(
            "mouseenter",

            () => {
                visualHovered =
                    true;
            }
        );

        visual.addEventListener(
            "mouseleave",

            () => {
                visualHovered =
                    false;

                pointerTarget =
                    0;
            }
        );

        visual.addEventListener(
            "pointermove",

            (
                event
            ) => {
                if (
                    isMobile() ||
                    prefersReducedMotion ||
                    editMode
                ) {
                    return;
                }

                const rect =
                    visual
                        .getBoundingClientRect();

                const normalizedX =
                    (
                        event.clientX -
                        rect.left
                    ) /
                    rect.width -
                    0.5;

                pointerTarget =
                    normalizedX *
                    0.22;
            },

            {
                passive: true
            }
        );

        // =====================================================
        // RESIZE
        // =====================================================

        function updateSize() {
            const {
                width,
                height
            } =
                getViewportSize();

            renderer.setSize(
                width,
                height,
                false
            );

            renderer.setPixelRatio(
                Math.min(
                    window.devicePixelRatio || 1,

                    isMobile()
                        ? 1.15
                        : 1.65
                )
            );

            camera.aspect =
                width /
                height;

            camera.fov =
                isMobile()
                    ? 34
                    : 31;

            camera.position.z =
                getCameraZ();

            camera.position.y =
                isMobile()
                    ? 0.05
                    : 0.12;

            camera.updateProjectionMatrix();

            camera.lookAt(
                0,

                isMobile()
                    ? 0.15
                    : 0,

                0
            );

            if (
                modelReady
            ) {
                rebuildModelLayout();
            }
        }

        const resizeObserver =
            "ResizeObserver" in
                window

                ? new ResizeObserver(
                    updateSize
                )

                : null;

        resizeObserver?.observe(
            visual
        );

        window.addEventListener(
            "resize",
            updateSize,
            {
                passive: true
            }
        );

        // =====================================================
        // ANIMATION
        // =====================================================

        const clock =
            new THREE.Clock();

        setupVisibilityLoop(
            section,

            () => {
                const elapsedTime =
                    clock.getElapsedTime();

                if (
                    !editMode
                ) {
                    pointerRotation +=
                        (
                            pointerTarget -
                            pointerRotation
                        ) *
                        0.055;

                    const automaticRotation =
                        SPOTLIGHT_CONFIG
                            .model
                            .automaticMotion &&

                            !visualHovered &&

                            !prefersReducedMotion

                            ? Math.sin(
                                elapsedTime *
                                0.34
                            ) *
                            0.035

                            : 0;

                    modelRig.rotation.y =
                        SPOTLIGHT_CONFIG
                            .model
                            .rotationY +
                        pointerRotation +
                        automaticRotation;

                    modelRig.rotation.x =
                        prefersReducedMotion

                            ? 0

                            : Math.sin(
                                elapsedTime *
                                0.45
                            ) *
                            0.008;
                } else {
                    modelRig.rotation.x =
                        0;

                    modelRig.rotation.y =
                        SPOTLIGHT_CONFIG
                            .model
                            .rotationY;
                }

                if (
                    !prefersReducedMotion
                ) {
                    spotlightLighting
                        .heaterLight
                        .intensity =
                        0.52 +
                        Math.sin(
                            elapsedTime *
                            2
                        ) *
                        0.04;

                    spotlightLighting
                        .rimLight
                        .intensity =
                        3.15 +
                        Math.sin(
                            elapsedTime *
                            0.8
                        ) *
                        0.1;
                }

                updateHotspots();

                renderer.render(
                    scene,
                    camera
                );
            }
        );

        // =====================================================
        // PUBLIC API
        // =====================================================

        window.IPRobotXSpotlight =
        {
            getConfig() {
                return JSON.parse(
                    JSON.stringify(
                        SPOTLIGHT_CONFIG
                    )
                );
            },

            printConfig() {
                console.log(
                    JSON.stringify(
                        SPOTLIGHT_CONFIG
                            .hotspots,

                        null,

                        2
                    )
                );
            },

            setEditMode(
                value
            ) {
                editMode =
                    Boolean(
                        value
                    );

                applyEditMode();
            },

            setActive(
                index
            ) {
                const safeIndex =
                    clamp(
                        Number(
                            index
                        ) ||
                        0,

                        0,

                        hotspotItems.length -
                        1
                    );

                setActiveHotspot(
                    safeIndex
                );
            },

            getActive() {
                return activeHotspotIndex;
            },

            save() {
                saveHotspotSettings();

                this.printConfig();
            },

            resetPositions() {
                SPOTLIGHT_CONFIG
                    .hotspots
                    .forEach(
                        (
                            hotspot,
                            index
                        ) => {
                            hotspot.nodeOffset =
                                [
                                    ...defaultHotspotSettings[
                                        index
                                    ]
                                        .nodeOffset
                                ];

                            hotspot.labelOffset =
                                [
                                    ...defaultHotspotSettings[
                                        index
                                    ]
                                        .labelOffset
                                ];
                        }
                    );

                localStorage.removeItem(
                    SPOTLIGHT_CONFIG
                        .storageKey
                );
            }
        };
    }

    // =====================================================
    // Interactive triangular field
    // =====================================================

    function initSpecTriangleField() {
        const cards =
            Array.from(
                document.querySelectorAll(
                    ".spec-card"
                )
            );

        if (
            !cards.length
        ) {
            return;
        }

        const states =
            [];

        const TRIANGLE_CONFIG = {
            spacing:
                62,

            attractionRadius:
                175,

            attractionStrength:
                0.72,

            movementSpeed:
                0.14,

            normalLineWidth:
                0.65,

            activeLineWidth:
                1.65
        };

        function clamp(
            value,
            minimum,
            maximum
        ) {
            return Math.max(
                minimum,

                Math.min(
                    maximum,
                    value
                )
            );
        }

        function lerp(
            start,
            end,
            amount
        ) {
            return (
                start +
                (
                    end -
                    start
                ) *
                amount
            );
        }

        function createState(
            card
        ) {
            const canvas =
                document.createElement(
                    "canvas"
                );

            canvas.className =
                "spec-triangle-canvas";

            canvas.setAttribute(
                "aria-hidden",
                "true"
            );

            card.prepend(
                canvas
            );

            const context =
                canvas.getContext(
                    "2d"
                );

            if (
                !context
            ) {
                canvas.remove();

                return null;
            }

            const state = {
                card,
                canvas,
                context,

                width:
                    0,

                height:
                    0,

                pixelRatio:
                    1,

                nodes:
                    [],

                nodeMap:
                    new Map(),

                edges:
                    [],

                hovered:
                    false,

                visible:
                    true,

                pointer: {
                    x:
                        0,

                    y:
                        0,

                    targetX:
                        0,

                    targetY:
                        0
                }
            };

            function getNodeKey(
                row,
                column
            ) {
                return `${row}:${column}`;
            }

            function createTriangleGrid() {
                state.nodes =
                    [];

                state.edges =
                    [];

                state.nodeMap.clear();

                const spacing =
                    TRIANGLE_CONFIG
                        .spacing;

                const rowHeight =
                    spacing *
                    Math.sqrt(
                        3
                    ) /
                    2;

                const columnCount =
                    Math.ceil(
                        state.width /
                        spacing
                    ) +
                    5;

                const rowCount =
                    Math.ceil(
                        state.height /
                        rowHeight
                    ) +
                    5;

                for (
                    let row = -2;
                    row <=
                    rowCount;
                    row += 1
                ) {
                    const oddRow =
                        Boolean(
                            row &
                            1
                        );

                    for (
                        let column = -2;
                        column <=
                        columnCount;
                        column += 1
                    ) {
                        const baseX =
                            column *
                            spacing +

                            (
                                oddRow
                                    ? spacing /
                                    2
                                    : 0
                            );

                        const baseY =
                            row *
                            rowHeight;

                        const node = {
                            row,
                            column,
                            baseX,
                            baseY,
                            x:
                                baseX,
                            y:
                                baseY,
                            targetX:
                                baseX,
                            targetY:
                                baseY
                        };

                        state.nodes.push(
                            node
                        );

                        state.nodeMap.set(
                            getNodeKey(
                                row,
                                column
                            ),

                            node
                        );
                    }
                }

                function addEdge(
                    firstNode,
                    secondNode
                ) {
                    if (
                        !firstNode ||
                        !secondNode
                    ) {
                        return;
                    }

                    state.edges.push([
                        firstNode,
                        secondNode
                    ]);
                }

                state.nodes.forEach(
                    (
                        node
                    ) => {
                        const {
                            row,
                            column
                        } =
                            node;

                        addEdge(
                            node,

                            state
                                .nodeMap
                                .get(
                                    getNodeKey(
                                        row,
                                        column +
                                        1
                                    )
                                )
                        );

                        if (
                            row &
                            1
                        ) {
                            addEdge(
                                node,

                                state
                                    .nodeMap
                                    .get(
                                        getNodeKey(
                                            row +
                                            1,

                                            column
                                        )
                                    )
                            );

                            addEdge(
                                node,

                                state
                                    .nodeMap
                                    .get(
                                        getNodeKey(
                                            row +
                                            1,

                                            column +
                                            1
                                        )
                                    )
                            );
                        } else {
                            addEdge(
                                node,

                                state
                                    .nodeMap
                                    .get(
                                        getNodeKey(
                                            row +
                                            1,

                                            column
                                        )
                                    )
                            );

                            addEdge(
                                node,

                                state
                                    .nodeMap
                                    .get(
                                        getNodeKey(
                                            row +
                                            1,

                                            column -
                                            1
                                        )
                                    )
                            );
                        }
                    }
                );
            }

            function resizeCanvas() {
                const rectangle =
                    card.getBoundingClientRect();

                state.width =
                    Math.max(
                        1,

                        rectangle.width
                    );

                state.height =
                    Math.max(
                        1,

                        rectangle.height
                    );

                state.pixelRatio =
                    Math.min(
                        window.devicePixelRatio ||
                        1,

                        2
                    );

                canvas.width =
                    Math.round(
                        state.width *
                        state.pixelRatio
                    );

                canvas.height =
                    Math.round(
                        state.height *
                        state.pixelRatio
                    );

                canvas.style.width =
                    `${state.width}px`;

                canvas.style.height =
                    `${state.height}px`;

                context.setTransform(
                    state.pixelRatio,
                    0,
                    0,
                    state.pixelRatio,
                    0,
                    0
                );

                state.pointer.x =
                    state.width /
                    2;

                state.pointer.y =
                    state.height /
                    2;

                state.pointer.targetX =
                    state.width /
                    2;

                state.pointer.targetY =
                    state.height /
                    2;

                createTriangleGrid();
            }

            function updatePointer(
                event
            ) {
                const rectangle =
                    card.getBoundingClientRect();

                state.pointer.targetX =
                    event.clientX -
                    rectangle.left;

                state.pointer.targetY =
                    event.clientY -
                    rectangle.top;

                const percentageX =
                    (
                        state.pointer.targetX /
                        rectangle.width
                    ) *
                    100;

                const percentageY =
                    (
                        state.pointer.targetY /
                        rectangle.height
                    ) *
                    100;

                card.style.setProperty(
                    "--pointer-x",

                    `${percentageX}%`
                );

                card.style.setProperty(
                    "--pointer-y",

                    `${percentageY}%`
                );
            }

            card.addEventListener(
                "pointerenter",

                (
                    event
                ) => {
                    state.hovered =
                        true;

                    updatePointer(
                        event
                    );
                }
            );

            card.addEventListener(
                "pointermove",
                updatePointer,
                {
                    passive: true
                }
            );

            card.addEventListener(
                "pointerleave",

                () => {
                    state.hovered =
                        false;
                }
            );

            const resizeObserver =
                "ResizeObserver" in
                    window

                    ? new ResizeObserver(
                        resizeCanvas
                    )

                    : null;

            resizeObserver?.observe(
                card
            );

            if (
                "IntersectionObserver" in
                window
            ) {
                const visibilityObserver =
                    new IntersectionObserver(
                        (
                            [entry]
                        ) => {
                            state.visible =
                                entry.isIntersecting;
                        },

                        {
                            threshold:
                                0.01
                        }
                    );

                visibilityObserver.observe(
                    card
                );
            }

            resizeCanvas();

            return state;
        }

        function updateNodes(
            state
        ) {
            const radius =
                TRIANGLE_CONFIG
                    .attractionRadius;

            const strength =
                TRIANGLE_CONFIG
                    .attractionStrength;

            const movementSpeed =
                prefersReducedMotion

                    ? 1

                    : TRIANGLE_CONFIG
                        .movementSpeed;

            state.pointer.x +=
                (
                    state.pointer.targetX -
                    state.pointer.x
                ) *
                0.18;

            state.pointer.y +=
                (
                    state.pointer.targetY -
                    state.pointer.y
                ) *
                0.18;

            state.nodes.forEach(
                (
                    node
                ) => {
                    node.targetX =
                        node.baseX;

                    node.targetY =
                        node.baseY;

                    if (
                        state.hovered
                    ) {
                        const differenceX =
                            state.pointer.x -
                            node.baseX;

                        const differenceY =
                            state.pointer.y -
                            node.baseY;

                        const distance =
                            Math.sqrt(
                                differenceX *
                                differenceX +

                                differenceY *
                                differenceY
                            );

                        const normalizedDistance =
                            clamp(
                                1 -
                                distance /
                                radius,

                                0,

                                1
                            );

                        const influence =
                            normalizedDistance *
                            normalizedDistance;

                        const pull =
                            influence *
                            strength;

                        node.targetX =
                            lerp(
                                node.baseX,

                                state.pointer.x,

                                pull
                            );

                        node.targetY =
                            lerp(
                                node.baseY,

                                state.pointer.y,

                                pull
                            );
                    }

                    node.x +=
                        (
                            node.targetX -
                            node.x
                        ) *
                        movementSpeed;

                    node.y +=
                        (
                            node.targetY -
                            node.y
                        ) *
                        movementSpeed;
                }
            );
        }

        function drawGlow(
            state
        ) {
            if (
                !state.hovered
            ) {
                return;
            }

            const radius =
                TRIANGLE_CONFIG
                    .attractionRadius;

            const gradient =
                state.context
                    .createRadialGradient(
                        state.pointer.x,
                        state.pointer.y,
                        0,

                        state.pointer.x,
                        state.pointer.y,
                        radius
                    );

            gradient.addColorStop(
                0,
                "rgba(255, 74, 10, 0.09)"
            );

            gradient.addColorStop(
                0.35,
                "rgba(255, 74, 10, 0.035)"
            );

            gradient.addColorStop(
                1,
                "rgba(255, 74, 10, 0)"
            );

            state.context.fillStyle =
                gradient;

            state.context.fillRect(
                0,
                0,
                state.width,
                state.height
            );
        }

        function drawEdges(
            state
        ) {
            const radius =
                TRIANGLE_CONFIG
                    .attractionRadius;

            state.edges.forEach(
                (
                    [
                        firstNode,
                        secondNode
                    ]
                ) => {
                    const middleX =
                        (
                            firstNode.x +
                            secondNode.x
                        ) /
                        2;

                    const middleY =
                        (
                            firstNode.y +
                            secondNode.y
                        ) /
                        2;

                    const differenceX =
                        state.pointer.x -
                        middleX;

                    const differenceY =
                        state.pointer.y -
                        middleY;

                    const distance =
                        Math.sqrt(
                            differenceX *
                            differenceX +

                            differenceY *
                            differenceY
                        );

                    const activeInfluence =
                        state.hovered

                            ? clamp(
                                1 -
                                distance /
                                radius,

                                0,

                                1
                            )

                            : 0;

                    const red =
                        Math.round(
                            lerp(
                                105,
                                255,
                                activeInfluence
                            )
                        );

                    const green =
                        Math.round(
                            lerp(
                                112,
                                91,
                                activeInfluence
                            )
                        );

                    const blue =
                        Math.round(
                            lerp(
                                122,
                                30,
                                activeInfluence
                            )
                        );

                    const opacity =
                        0.085 +
                        activeInfluence *
                        0.52;

                    state.context.beginPath();

                    state.context.moveTo(
                        firstNode.x,
                        firstNode.y
                    );

                    state.context.lineTo(
                        secondNode.x,
                        secondNode.y
                    );

                    state.context.lineWidth =
                        lerp(
                            TRIANGLE_CONFIG
                                .normalLineWidth,

                            TRIANGLE_CONFIG
                                .activeLineWidth,

                            activeInfluence
                        );

                    state.context.strokeStyle =
                        `rgba(${red}, ${green}, ${blue}, ${opacity})`;

                    state.context.stroke();
                }
            );
        }

        function drawPoints(
            state
        ) {
            if (
                !state.hovered
            ) {
                return;
            }

            const radius =
                TRIANGLE_CONFIG
                    .attractionRadius;

            state.nodes.forEach(
                (
                    node
                ) => {
                    const differenceX =
                        state.pointer.x -
                        node.x;

                    const differenceY =
                        state.pointer.y -
                        node.y;

                    const distance =
                        Math.sqrt(
                            differenceX *
                            differenceX +

                            differenceY *
                            differenceY
                        );

                    const influence =
                        clamp(
                            1 -
                            distance /
                            radius,

                            0,

                            1
                        );

                    if (
                        influence <=
                        0.04
                    ) {
                        return;
                    }

                    state.context.beginPath();

                    state.context.arc(
                        node.x,
                        node.y,

                        0.8 +
                        influence *
                        1.15,

                        0,

                        Math.PI *
                        2
                    );

                    state.context.fillStyle =
                        `rgba(255, 122, 32, ${0.12 +
                        influence *
                        0.55
                        })`;

                    state.context.fill();
                }
            );
        }

        function drawState(
            state
        ) {
            if (
                !state.visible ||
                !state.width ||
                !state.height
            ) {
                return;
            }

            state.context.clearRect(
                0,
                0,
                state.width,
                state.height
            );

            updateNodes(
                state
            );

            drawGlow(
                state
            );

            drawEdges(
                state
            );

            drawPoints(
                state
            );
        }

        cards.forEach(
            (
                card
            ) => {
                const state =
                    createState(
                        card
                    );

                if (
                    state
                ) {
                    states.push(
                        state
                    );
                }
            }
        );

        function animate() {
            states.forEach(
                drawState
            );

            requestAnimationFrame(
                animate
            );
        }

        animate();
    }

    // =====================================================
    // Init
    // =====================================================

    function init() {
        initCursor();

        initReveal();

        initHeroScene();

        initSpotlightScene();

        initSpecTriangleField();
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );
    } else {
        init();
    }
})();