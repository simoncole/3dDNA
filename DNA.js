
const init  = () => {
    const sequence = `GTGGGCAAGGTTCCCAGGCGTTCTATACCTCCCAGCCCTCTTTCCAGGATCTTGTAGGCTGTATCTAGGG`
    const keys = {
        j: false,
        k: false,
        left: false,
        right: false,
        up: false,
        down: false,
        w: false,
        a: false,
        s: false,
        d: false
    };

    const nucleotideColors = {
        T: 'rgb(177, 37, 190)',
        A: 'rgb(255, 174, 66)',
        G: 'rgb(48, 213, 200)',
        C: 'rgb(100, 32, 29)'
    }

    const speed = 0.1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = -10;
    camera.position.y = 10;
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const nucleusTexture = textureLoader.load('/threejs/assets/textures/cell-nucleus-illustration.png', () => {
        
    }, undefined, (error) => {
        console.error(error);
    });
    const makePlane = () => {
        const PlaneGeometry = new THREE.PlaneGeometry(100, 100, 100);
        const PlaneMaterial = new THREE.MeshPhongMaterial({ 
            color: 'rgb(255, 255, 255)', 
            side: THREE.DoubleSide,
            map: nucleusTexture
        });
        const Plane = new THREE.Mesh(PlaneGeometry, PlaneMaterial);
        Plane.position.x = 0;
        Plane.position.y = 0;
        Plane.position.z = 0;
        Plane.rotation.x = Math.PI / 2;
        Plane.receiveShadow = true;
        scene.add(Plane);
    }
    makePlane(nucleusTexture);
    const makePointLight = (position) => {
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(position.x, position.y, position.z);
        const sphere = new THREE.SphereGeometry(0.1, 16, 8);
        const mesh = new THREE.Mesh(sphere, new THREE.MeshPhongMaterial({ color: 0xffffff }));
        mesh.position.set(position.x, position.y, position.z);
        scene.add(mesh);
        pointLight.visible = false;
        return pointLight;
    }
    const pointLight1 = makePointLight({x: 5, y: 5, z: 5});
    const pointLight2 = makePointLight({x: -5, y: 5, z: 5});
    const pointLight3 = makePointLight({x: 5, y: 5, z: -5});
    const pointLight4 = makePointLight({x: -5, y: 5, z: -5});
    scene.add(pointLight1, pointLight2, pointLight3, pointLight4);

    const makeSpotLight = (position) => {
        const spotLight = new THREE.SpotLight(0xffffff, 0.5);
        spotLight.position.set(position.x, position.y, position.z);
        spotLight.target.position.set(0, 5, 0);
        spotLight.angle = Math.PI / 6;
        spotLight.intensity = 1;
        spotLight.penumbra = 0.5;
        spotLight.decay = 2;
        spotLight.castShadow = true;
        const cylinder = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 32);
        cylinder.rotateZ(Math.PI / 2);
        cylinder.rotateX(Math.PI / 2);
        const mesh = new THREE.Mesh(cylinder, new THREE.MeshPhongMaterial({ color: 0xffffff }));
        mesh.position.set(position.x, position.y, position.z);
        scene.add(mesh);
        return spotLight;
    }
    const spotLight = makeSpotLight({x: 8, y: 8, z: 8});
    scene.add(spotLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(5, 5, 10);
    scene.add(directionalLight);

    const points1 = [];
    const points2 = [];
    const radius = 1;
    const height = 20;
    const rotations = sequence.length / 10;

    let parentDNA = new THREE.Object3D();
   
    const addHelixPoints = (points1, points2, sequence) => {
        for(let i = 0; i < 200; i++){
            let t = i /200;
            let x = radius * Math.cos(2 * Math.PI * rotations * t);
            let y = height * t - height / 2;
            let z = radius * Math.sin(2 * Math.PI * rotations * t);
            points1.push(new THREE.Vector3(x, y, z));
        }
        for(let i = 0; i < 200; i++){
            let t = i /200;
            let x = -(radius * Math.cos(2 * Math.PI * rotations * t));
            let y = -(height * t - height / 2);
            let z = radius * Math.sin(2 * Math.PI * rotations * t);
            points2.push(new THREE.Vector3(x, y, z));
        }
    }
    addHelixPoints(points1, points2, sequence);

    const addNucleotides = (points1, points2) => {
        for(let i = 0; i < 200; i+=10){
            let point1 = points1[i];
            let point2 = points2[points2.length - (i+1)];
            let midpoint = new THREE.Vector3().lerpVectors(point1, point2, 0.5);
            makeNucleotide(point1, midpoint, 'rgb(0, 0, 255)');
            makeNucleotide(point2, midpoint, 'rgb(0, 255, 255)');
        }
    }
    const makeNucleotide = (point1, point2, color) => {
        const path = new THREE.LineCurve3(point1, point2);
        const geometry = new THREE.TubeGeometry(path, 64, 0.1, 16, false);
        const material = new THREE.MeshPhongMaterial({ color: color});
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.castShadow = true;
        parentDNA.add(cylinder);
    }
    addNucleotides(points1, points2);

    const createTube = (points) => {
        const curve = new THREE.CatmullRomCurve3(points);
        const curveGeometry = new THREE.TubeGeometry(curve, 64, 0.1, 16, false);
        const material = new THREE.MeshPhongMaterial({ color:  'rgb(115, 147, 179)'});
        const tube = new THREE.Mesh(curveGeometry, material);
        tube.castShadow = true;
        return tube;
    }
    const tube1 = createTube(points1);
    const tube2 = createTube(points2);
    parentDNA.add(tube1, tube2);
    scene.add(parentDNA);
    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
   

    lookAtPos = new THREE.Vector3(0, 0, 0);
    camera.lookAt(lookAtPos);

    document.addEventListener('keydown', (event) => {
        console.log(event.code);
        switch (event.code) {
            case 'KeyJ': //j
                keys.j = true;
                break;
            case 'KeyK': //k
                keys.k = true;
                break;
            case 'ArrowLeft': //left
                keys.left = true;
                break;
            case 'ArrowUp': //up
                keys.up = true;
                break;
            case 'ArrowRight': //right
                keys.right = true;
                break;
            case 'ArrowDown': //down
                keys.down = true;
                break;
            case 'Digit1':
                pointLight1.visible = !pointLight1.visible;
                break;
            case 'Digit2':
                pointLight2.visible = !pointLight2.visible;
                break;
            case 'Digit3':
                pointLight3.visible = !pointLight3.visible;
                break;
            case 'Digit4':
                pointLight4.visible = !pointLight4.visible;
                break;
            case 'Digit5':
                directionalLight.visible = !directionalLight.visible;
                break;
            case 'Digit6':
                spotLight.visible = !spotLight.visible;
                break;
            case 'Digit7':
                ambientLight.visible = !ambientLight.visible;
                break;
            case 'KeyW':
                keys.w = true;
                break;
            case 'KeyA':
                keys.a = true;
                break;
            case 'KeyS':
                keys.s = true;
                break;
            case 'KeyD':
                keys.d = true;
                break;
        }
    });

    document.addEventListener('keyup', (event) => {
        switch (event.code) {
            case 'KeyJ': //j
                keys.j = false;
                break;
            case 'KeyK': //k
                keys.k = false;
                break;
            case 'ArrowLeft': //left
                keys.left = false;
                break;
            case 'ArrowUp': //up
                keys.up = false;
                break;
            case 'ArrowRight': //right
                keys.right = false;
                break;
            case 'ArrowDown': //down
                keys.down = false;
                break;
            case 'KeyW':
                keys.w = false;
                break;
            case 'KeyA':
                keys.a = false;
                break;
            case 'KeyS':
                keys.s = false;
                break;
            case 'KeyD':
                keys.d = false;
                break;
        }
    });

    const animate = () => {
        requestAnimationFrame(animate);

        if(keys.j) {
            camera.position.z -= speed;
        }
        if(keys.k) {
            camera.position.z += speed;
        }
        if(keys.left) {
            camera.position.x -= speed;
        }
        if(keys.right) {
            camera.position.x += speed;
        }
        if(keys.up) {
            camera.position.y += speed;
        }
        if(keys.down) {
            camera.position.y -= speed;
        }
        if(keys.w) {
            lookAtPos.y += speed;
        }
        if(keys.a) {
            lookAtPos.x -= speed;
        }
        if(keys.s) {
            lookAtPos.y -= speed;
        }
        if(keys.d) {
            lookAtPos.x += speed;
        }
        parentDNA.rotateY(0.01);
        camera.lookAt(lookAtPos);
        renderer.render(scene, camera)/10;

    }
    renderer.shadowMap.enabled = true;
    animate();
}
init()