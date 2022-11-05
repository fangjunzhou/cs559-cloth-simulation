import { mainWorld, physicsWorld } from "white-dwarf/Core";
import { coreRenderContext } from "white-dwarf/Core/Context/RenderContext";
import { CoreStartProps } from "white-dwarf/Core/Context/SystemContext";
import { systemContext } from "white-dwarf/Core/CoreSetup";
import { TransformData3D } from "white-dwarf/Core/Locomotion/DataComponent/TransformData3D";
import { EulerVelocityGravitySystem } from "white-dwarf/Core/Physics/Systems/EulerVelocity3DGravitySystem";
import { EulerVelocity3DMoveSystem } from "white-dwarf/Core/Physics/Systems/EulerVelocity3DMoveSystem";
import { JakobsenConstraintSystem } from "white-dwarf/Core/Physics/Systems/JakobsenConstraintSystem";
import { Transform3DSyncSystem } from "white-dwarf/Core/Physics/Systems/Transform3DSyncSystem";
import { VerletVelocity3DGravitySystem } from "white-dwarf/Core/Physics/Systems/VerletVelocity3DGravitySystem";
import { VerletVelocity3DMoveSystem } from "white-dwarf/Core/Physics/Systems/VerletVelocity3DMoveSystem";
import { PerspectiveCameraData3D } from "white-dwarf/Core/Render/DataComponent/PerspectiveCameraData3D";
import { RenderSystem3DRegister } from "white-dwarf/Core/Render/RenderSystem3DRegister";
import { MainCameraInitSystem } from "white-dwarf/Core/Render/System/MainCameraInitSystem";
import { MainCameraTag } from "white-dwarf/Core/Render/TagComponent/MainCameraTag";
import {
  WorldSerializer,
  IWorldObject,
} from "white-dwarf/Core/Serialization/WorldSerializer";
import { EditorSystem3DRegister } from "white-dwarf/Editor/EditorSystem3DRegister";
import { EditorCamTagAppendSystem } from "white-dwarf/Editor/System/EditorCamTagAppendSystem";
import { EditorViewPort3DSystem } from "white-dwarf/Editor/System/EditorViewPort3DSystem";
import { Vector3 } from "white-dwarf/Mathematics/Vector3";
import { Cam3DDragSystem } from "white-dwarf/Utils/System/Cam3DDragSystem";
import { Object3DSelectSystem } from "white-dwarf/Utils/System/Object3DSelectSystem";
import { ClothInitSystem } from "./Systems/ClothInitSystem";
import { ClothPreviewRenderer } from "./Systems/ClothPreviewRenderer";
import { RopeInitSystem } from "./Systems/RopeInitSystem";
import { RopePreviewRenderer } from "./Systems/RopePreviewRenderer";

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
      const worldObject = (await fetch("assets/rope_world.json").then(
        (response) => response.json()
      )) as IWorldObject;
      // Deserialize the world.
      WorldSerializer.deserializeWorld(mainWorld, worldObject);
    }

    // Register main camera init system.
    mainWorld.registerSystem(MainCameraInitSystem);

    // // Register follow system.
    // mainWorld.registerSystem(FollowPositionSystem);

    // Register Euler move and gravity system.
    physicsWorld
      .registerSystem(EulerVelocity3DMoveSystem)
      .registerSystem(EulerVelocityGravitySystem);
    // Register Verlet move and gravity system.
    physicsWorld
      .registerSystem(VerletVelocity3DMoveSystem, {
        priority: 100,
      })
      .registerSystem(VerletVelocity3DGravitySystem);
    // Register constraint system.
    physicsWorld.registerSystem(JakobsenConstraintSystem, {
      jakobsenIterations: 5,
    });

    // Register physics sync system.
    mainWorld.registerSystem(Transform3DSyncSystem, {
      priority: -1000,
    });
    physicsWorld.registerSystem(Transform3DSyncSystem, {
      priority: 1000,
    });

    // Register rope and cloth init system.
    mainWorld
      .registerSystem(RopeInitSystem, {
        mainWorld: mainWorld,
        physicsWorld: physicsWorld,
      })
      .registerSystem(ClothInitSystem, {
        mainWorld: mainWorld,
        physicsWorld: physicsWorld,
      });

    // Register camera drag system and view port system.
    mainWorld
      .registerSystem(Cam3DDragSystem, {
        mainCanvas: coreRenderContext.mainCanvas,
      })
      .registerSystem(EditorViewPort3DSystem, {
        mainCanvas: coreRenderContext.mainCanvas,
      })
      .registerSystem(Object3DSelectSystem, {
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

    // Register preview systems.
    mainWorld
      .registerSystem(RopePreviewRenderer, {
        mainCanvas: coreRenderContext.mainCanvas,
      })
      .registerSystem(ClothPreviewRenderer, {
        mainCanvas: coreRenderContext.mainCanvas,
      });

    // Setup editor scene camera.
    try {
      mainWorld.registerSystem(EditorCamTagAppendSystem);
    } catch (error) {
      console.error(error);
    }
  };
};
