import { Viewer, Math, TileMapServiceImageryProvider, Rectangle } from "cesium";

export function createViewer(): Viewer {
    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    const viewer = new Viewer('cesiumContainer', {
      imageryProvider: new TileMapServiceImageryProvider({
        url: 'Assets/Textures/NaturalEarthII',
        fileExtension: 'jpg',
        maximumLevel: 2,
        rectangle: new Rectangle(
          Math.toRadians(-180.0),
          Math.toRadians(-90.0),
          Math.toRadians(180.0),
          Math.toRadians(90.0))
      }),
      animation: false,
      timeline: false,
      geocoder: false,
      baseLayerPicker: false,
      homeButton: false,
      sceneModePicker: false,
      fullscreenButton: false,
      navigationHelpButton: false,
      // skyBox: false,
      selectionIndicator: false,
      infoBox: false,
      requestRenderMode: true,
    });
  
    // Disable fog.
    var scene = viewer.scene;
    scene.skyAtmosphere.show = false;
    scene.fog.enabled = false;
    scene.globe.showGroundAtmosphere = false;
  
    return viewer;
  }