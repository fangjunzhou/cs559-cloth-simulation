import { mainWorld } from "white-dwarf/Core";
import { coreRenderContext } from "white-dwarf/Core/Context/RenderContext";
import { CoreStartProps } from "white-dwarf/Core/Context/SystemContext";
import { systemContext } from "white-dwarf/Core/CoreSetup";
import { TransformData2D } from "white-dwarf/Core/Locomotion/DataComponent/TransformData2D";
import { TransformData3D } from "white-dwarf/Core/Locomotion/DataComponent/TransformData3D";
import { EulerVelocityGravitySystem } from "white-dwarf/Core/Physics/Systems/EulerVelocity3DGravitySystem";
import { EulerVelocity3DMoveSystem } from "white-dwarf/Core/Physics/Systems/EulerVelocity3DMoveSystem";
import { CameraData2D } from "white-dwarf/Core/Render/DataComponent/CameraData2D";
import { LineFrameRenderData3D } from "white-dwarf/Core/Render/DataComponent/LineFrameRenderData3D";
import { PerspectiveCameraData3D } from "white-dwarf/Core/Render/DataComponent/PerspectiveCameraData3D";
import { RenderSystem3DRegister } from "white-dwarf/Core/Render/RenderSystem3DRegister";
import { MainCameraInitSystem } from "white-dwarf/Core/Render/System/MainCameraInitSystem";
import { MainCameraTag } from "white-dwarf/Core/Render/TagComponent/MainCameraTag";
import {
  WorldSerializer,
  IWorldObject,
} from "white-dwarf/Core/Serialization/WorldSerializer";
import { EditorSystem2DRegister } from "white-dwarf/Editor/EditorSystem2DRegister";
import { EditorSystem3DRegister } from "white-dwarf/Editor/EditorSystem3DRegister";
import { EditorCamTagAppendSystem } from "white-dwarf/Editor/System/EditorCamTagAppendSystem";
import { LineFrame3DSegment } from "white-dwarf/Mathematics/LineFrame3DSegment";
import { Vector3 } from "white-dwarf/Mathematics/Vector3";
import { Cam3DDragSystem } from "white-dwarf/Utils/System/Cam3DDragSystem";

export const main = () => {
  systemContext.coreSetup = () => {
    if (coreRenderContext.mainCanvas) {
      new RenderSystem3DRegister(coreRenderContext.mainCanvas).register(
        mainWorld
      );
    }
  };

  systemContext.coreStart = async (props: CoreStartProps) => {
    // If in editor mode, deserialize the world.
    if (props.worldObject) {
      WorldSerializer.deserializeWorld(mainWorld, props.worldObject);
    } else {
      // Read world.json.
      const worldObject = (await fetch("assets/world.json").then((response) =>
        response.json()
      )) as IWorldObject;
      // Deserialize the world.
      WorldSerializer.deserializeWorld(mainWorld, worldObject);
    }

    // Register main camera init system.
    mainWorld.registerSystem(MainCameraInitSystem);

    // Register Euler move and gravity system.
    mainWorld
      .registerSystem(EulerVelocity3DMoveSystem)
      .registerSystem(EulerVelocityGravitySystem);

    // Register camera drag system.
    mainWorld.registerSystem(Cam3DDragSystem, {
      mainCanvas: coreRenderContext.mainCanvas,
    });
  };

  systemContext.editorStart = () => {
    // Add a editor cam.
    mainWorld
      .createEntity("Editor Main Camera")
      .addComponent(TransformData3D, {
        position: new Vector3(0, 0, -10),
      })
      .addComponent(PerspectiveCameraData3D, {
        fov: Math.PI / 2,
      })
      .addComponent(MainCameraTag);

    // Register Editor System.
    if (coreRenderContext.mainCanvas) {
      new EditorSystem3DRegister(coreRenderContext.mainCanvas).register(
        mainWorld
      );
    }

    // Setup editor scene camera.
    try {
      mainWorld.registerSystem(EditorCamTagAppendSystem);
    } catch (error) {
      console.error(error);
    }
  };
};
