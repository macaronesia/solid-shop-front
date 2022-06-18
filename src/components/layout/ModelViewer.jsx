import {
  BrightnessHigh as BrightnessHighIcon,
  DisplaySettings as DisplaySettingsIcon,
  WbIncandescent as WbIncandescentIcon
} from '@mui/icons-material';
import {
  Box,
  Checkbox,
  Drawer,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  DirectionalLightHelper,
  EquirectangularReflectionMapping,
  Group,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Sphere,
  SpotLight,
  SpotLightHelper,
  Vector3,
  WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

import footPrintCourtHDR from '@/assets/textures/footprint-court.hdr';
import pisaPXHDR from '@/assets/textures/pisa-px.hdr';
import pisaNXHDR from '@/assets/textures/pisa-nx.hdr';
import pisaPYHDR from '@/assets/textures/pisa-py.hdr';
import pisaNYHDR from '@/assets/textures/pisa-ny.hdr';
import pisaPZHDR from '@/assets/textures/pisa-pz.hdr';
import pisaNZHDR from '@/assets/textures/pisa-nz.hdr';

function IBLPanel({
  open,
  container,
  environmentName,
  changeEnvironmentName,
  renderer,
  scene
}) {
  useEffect(() => {
    let ignore = false;

    (async () => {
      let pmremGenerator;
      let loader;
      let texture;
      switch (environmentName) {
        case 'room':
          pmremGenerator = new PMREMGenerator(renderer);
          texture = pmremGenerator.fromScene(new RoomEnvironment()).texture;
          break;
        case 'court':
          loader = new RGBELoader();
          texture = await loader.loadAsync(footPrintCourtHDR);
          texture.mapping = EquirectangularReflectionMapping;
          break;
        case 'pisa':
          loader = new HDRCubeTextureLoader();
          texture = await loader.loadAsync([
            pisaPXHDR, pisaNXHDR,
            pisaPYHDR, pisaNYHDR,
            pisaPZHDR, pisaNZHDR
          ]);
          break;
        default:
      }
      if (!ignore) {
        scene.environment = texture;
      }
    })();

    return () => {
      ignore = true;
      scene.environment = null;
    };
  }, [environmentName, renderer, scene]);

  return (
    <Drawer
      anchor="left"
      open={open}
      hideBackdrop
      ModalProps={{
        container,
        style: { position: 'absolute', width: 0 }
      }}
      PaperProps={{
        style: { position: 'absolute' }
      }}
      SlideProps={{
        container,
        style: { position: 'absolute' }
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 3,
          bgcolor: 'white',
          flexGrow: 1
        }}
      >
        <Typography>Image-Based Light</Typography>
        <RadioGroup
          sx={{
            mt: 3,
            whiteSpace: 'nowrap'
          }}
          value={environmentName}
          onChange={(event, newValue) => {
            changeEnvironmentName(newValue);
          }}
        >
          <FormControlLabel value="room" control={<Radio />} label="Room" />
          <FormControlLabel value="court" control={<Radio />} label="Footprint Court" />
          <FormControlLabel value="pisa" control={<Radio />} label="Pisa" />
        </RadioGroup>
      </Box>
    </Drawer>
  );
}

function BasicLightPanel({
  open,
  container,
  lightType,
  changeLightType,
  scene,
  lightGroup
}) {
  const [lightHelperShown, setLightHelperShown] = useState(false);
  const [intensity, setIntensity] = useState(null);
  const [angle, setAngle] = useState(null);
  const [penumbra, setPenumbra] = useState(null);
  const [positionX, setPositionX] = useState(null);
  const [positionY, setPositionY] = useState(null);
  const [positionZ, setPositionZ] = useState(null);

  const lightRef = useRef(null);
  const lightHelperRef = useRef(null);

  useEffect(() => {
    let light;
    switch (lightType) {
      case 'AmbientLight':
        light = new AmbientLight(0xffffff);
        break;
      case 'DirectionalLight':
        light = new DirectionalLight(0xffffff);
        light.position.y = 1;
        break;
      case 'SpotLight':
        light = new SpotLight(0xffffff);
        light.position.y = 1;
        break;
      default:
    }
    lightGroup.add(light);

    setIntensity(light.intensity);
    setAngle(light.angle);
    setPenumbra(light.penumbra);
    setPositionX(light.position.x);
    setPositionY(light.position.y);
    setPositionZ(light.position.z);

    lightRef.current = light;

    return () => {
      lightGroup.remove(lightRef.current);
      if (lightHelperRef.current) {
        scene.remove(lightHelperRef.current);
      }
    };
  }, [lightType, scene, lightGroup]);

  const addLightHelper = () => {
    switch (lightType) {
      case 'DirectionalLight':
        lightHelperRef.current = new DirectionalLightHelper(lightRef.current);
        break;
      case 'SpotLight':
        lightHelperRef.current = new SpotLightHelper(lightRef.current);
        break;
      default:
    }
    scene.add(lightHelperRef.current);
  };

  const removeLightHelper = () => {
    scene.remove(lightHelperRef.current);
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      hideBackdrop
      ModalProps={{
        container,
        style: { position: 'absolute', width: 0 }
      }}
      PaperProps={{
        style: { position: 'absolute' }
      }}
      SlideProps={{
        container,
        style: { position: 'absolute' }
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 3,
          bgcolor: 'white',
          flexGrow: 1
        }}
      >
        <Typography>Light</Typography>
        <ToggleButtonGroup
          color="primary"
          size="small"
          exclusive
          sx={{
            mt: 2
          }}
          value={lightType}
          onChange={(event, newValue) => {
            changeLightType(newValue);
          }}
        >
          <ToggleButton value="AmbientLight">Ambient</ToggleButton>
          <ToggleButton value="DirectionalLight">Directional</ToggleButton>
          <ToggleButton value="SpotLight">Spot</ToggleButton>
        </ToggleButtonGroup>
        {['DirectionalLight', 'SpotLight'].includes(lightType) && (
          <FormControlLabel
            label="Helper"
            sx={{
              mt: 2
            }}
            control={(
              <Checkbox
                checked={lightHelperShown}
                onChange={(event) => {
                  if (event.target.checked) {
                    addLightHelper();
                  } else {
                    removeLightHelper();
                  }
                  setLightHelperShown(event.target.checked);
                }}
              />
            )}
          />
        )}
        <Box
          sx={{
            mt: 2
          }}
        >
          <Typography>Intensity</Typography>
          <Slider
            min={0}
            max={2}
            step={0.01}
            value={intensity}
            onChange={(event, newValue) => {
              lightRef.current.intensity = newValue;
              setIntensity(newValue);
            }}
          />
        </Box>
        {lightType === 'SpotLight' && (
          <>
            <Box
              sx={{
                mt: 2
              }}
            >
              <Typography>Angle</Typography>
              <Slider
                min={0}
                max={Math.PI / 2}
                step={0.01}
                value={angle}
                onChange={(event, newValue) => {
                  lightRef.current.angle = newValue;
                  if (lightHelperShown) {
                    lightHelperRef.current.update();
                  }
                  setAngle(newValue);
                }}
              />
            </Box>
            <Box
              sx={{
                mt: 2
              }}
            >
              <Typography>Penumbra</Typography>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={penumbra}
                onChange={(event, newValue) => {
                  lightRef.current.penumbra = newValue;
                  setPenumbra(newValue);
                }}
              />
            </Box>
          </>
        )}
        {['DirectionalLight', 'SpotLight'].includes(lightType) && (
          <>
            <Box
              sx={{
                mt: 2
              }}
            >
              <Typography>X</Typography>
              <Slider
                min={-1}
                max={1}
                step={0.01}
                value={positionX}
                onChange={(event, newValue) => {
                  lightRef.current.position.x = newValue;
                  if (lightHelperShown) {
                    lightHelperRef.current.update();
                  }
                  setPositionX(newValue);
                }}
              />
            </Box>
            <Box
              sx={{
                mt: 2
              }}
            >
              <Typography>Y</Typography>
              <Slider
                min={-1}
                max={1}
                step={0.01}
                value={positionY}
                onChange={(event, newValue) => {
                  lightRef.current.position.y = newValue;
                  if (lightHelperShown) {
                    lightHelperRef.current.update();
                  }
                  setPositionY(newValue);
                }}
              />
            </Box>
            <Box
              sx={{
                mt: 2
              }}
            >
              <Typography>Z</Typography>
              <Slider
                min={-1}
                max={1}
                step={0.01}
                value={positionZ}
                onChange={(event, newValue) => {
                  lightRef.current.position.z = newValue;
                  if (lightHelperShown) {
                    lightHelperRef.current.update();
                  }
                  setPositionZ(newValue);
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}

function ModelViewer({ modelUrl }) {
  const canvasRef = useRef(null);
  const [container, setContainer] = useState(null);
  const containerRef = useCallback((el) => {
    if (el !== null) {
      setContainer(el);
    }
  }, []);

  const [lightMode, setLightMode] = useState(null);
  const [environmentName, setEnvironmentName] = useState(null);
  const [basicLightType, setBasicLightType] = useState(null);
  const [lightPanelOpen, setLightPanelOpen] = useState(false);
  const [viewerRenderer, setViewerRenderer] = useState(null);
  const [viewerScene, setViewerScene] = useState(null);
  const [viewerLightGroup, setViewerLightGroup] = useState(null);

  const changeLightMode = (newLightMode) => {
    switch (newLightMode) {
      case 'ibl':
        setLightMode('ibl');
        setEnvironmentName('room');
        break;
      case 'basic':
        setLightMode('basic');
        setBasicLightType('AmbientLight');
        break;
      default:
    }
    setLightMode(newLightMode);
  };

  const toggleLightMode = () => {
    changeLightMode(lightMode === 'ibl' ? 'basic' : 'ibl');
  };

  const toggleLightPanelOpen = () => {
    setLightPanelOpen(!lightPanelOpen);
  };

  useEffect(() => {
    let requestId;

    const canvas = canvasRef.current;
    const renderer = new WebGLRenderer({
      canvas,
      antialias: true
    });
    setViewerRenderer(renderer);
    const pixelRatio = window.devicePixelRatio;
    renderer.setSize(canvas.clientWidth * pixelRatio, canvas.clientHeight * pixelRatio, false);

    const scene = new Scene();
    setViewerScene(scene);
    scene.background = new Color(0x485366);

    (async () => {
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(modelUrl);

      const modelScene = gltf.scene;
      scene.add(modelScene);
      const bbox = new Box3().setFromObject(modelScene);
      const boundingSphere = bbox.getBoundingSphere(new Sphere());

      const lightGroup = new Group();
      setViewerLightGroup(lightGroup);
      lightGroup.position.copy(boundingSphere.center);
      lightGroup.scale.set(
        boundingSphere.radius * 2,
        boundingSphere.radius * 2,
        boundingSphere.radius * 2
      );
      scene.add(lightGroup);

      const camera = new PerspectiveCamera(
        75,
        canvas.width / canvas.height,
        boundingSphere.radius * 0.1,
        boundingSphere.radius * 100
      );
      camera.position.copy(
        boundingSphere.center
          .clone()
          .addScaledVector(new Vector3(1, 1, 1).normalize(), boundingSphere.radius * 2)
      );

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.copy(boundingSphere.center);

      const render = () => {
        requestId = requestAnimationFrame(render);
        controls.update();
        renderer.render(scene, camera);
      };
      requestId = requestAnimationFrame(render);

      changeLightMode('ibl');
    })();

    return () => {
      if (requestId) {
        cancelAnimationFrame(requestId);
      }
    };
  }, [modelUrl]);

  return (
    <div style={{ width: '100%' }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '56%',
          overflow: 'hidden'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0
          }}
        />
        <Box
          sx={{
            display: 'flex',
            position: 'absolute',
            width: '9rem',
            height: '4rem',
            bottom: 0,
            right: 0,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Tooltip title="IBL / Basic">
            <IconButton
              size="large"
              sx={{
                color: 'white'
              }}
              onClick={toggleLightMode}
            >
              {lightMode === 'ibl' ? (
                <BrightnessHighIcon />
              ) : (
                <WbIncandescentIcon />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton
              size="large"
              sx={{
                color: 'white'
              }}
              onClick={toggleLightPanelOpen}
            >
              <DisplaySettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
        {lightMode === 'ibl' && container && (
          <IBLPanel
            open={lightPanelOpen}
            container={container}
            environmentName={environmentName}
            changeEnvironmentName={setEnvironmentName}
            renderer={viewerRenderer}
            scene={viewerScene}
          />
        )}
        {lightMode === 'basic' && container && (
          <BasicLightPanel
            key={basicLightType}
            open={lightPanelOpen}
            container={container}
            lightType={basicLightType}
            changeLightType={setBasicLightType}
            scene={viewerScene}
            lightGroup={viewerLightGroup}
          />
        )}
      </div>
    </div>
  );
}

export default ModelViewer;
