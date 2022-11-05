import { mainWorld, physicsWorld } from "white-dwarf/Core";
import { coreRenderContext } from "white-dwarf/Core/Context/RenderContext";
import { CoreStartProps } from "white-dwarf/Core/Context/SystemContext";
import { systemContext } from "white-dwarf/Core/CoreSetup";
import { TransformData2D } from "white-dwarf/Core/Locomotion/DataComponent/TransformData2D";
import { TransformData3D } from "white-dwarf/Core/Locomotion/DataComponent/TransformData3D";
import {
  Constraint,
  ConstraintData,
} from "white-dwarf/Core/Physics/DataComponents/ConstraintData";
import { MassData } from "white-dwarf/Core/Physics/DataComponents/MassData";
import { VerletVelocityData3D } from "white-dwarf/Core/Physics/DataComponents/VerletVelocityData3D";
import { EulerVelocityGravitySystem } from "white-dwarf/Core/Physics/Systems/EulerVelocity3DGravitySystem";
import { EulerVelocity3DMoveSystem } from "white-dwarf/Core/Physics/Systems/EulerVelocity3DMoveSystem";
import { JakobsenConstraintSystem } from "white-dwarf/Core/Physics/Systems/JakobsenConstraintSystem";
import { MainWorldTransformSyncSystem } from "white-dwarf/Core/Physics/Systems/MainWorldTransformSyncSystem";
import { PhysicsWorldTransformSyncSystem } from "white-dwarf/Core/Physics/Systems/PhysicsWorldTransformSyncSystem";
import { VerletVelocity3DGravitySystem } from "white-dwarf/Core/Physics/Systems/VerletVelocity3DGravitySystem";
import { VerletVelocity3DMoveSystem } from "white-dwarf/Core/Physics/Systems/VerletVelocity3DMoveSystem";
import { CameraData2D } from "white-dwarf/Core/Render/DataComponent/CameraData2D";
import { LineFrameRenderData3D } from "white-dwarf/Core/Render/DataComponent/LineFrameRenderData3D";
import { PerspectiveCameraData3D } from "white-dwarf/Core/Render/DataComponent/PerspectiveCameraData3D";
import { RenderSystem3DRegister } from "white-dwarf/Core/Render/RenderSystem3DRegister";
import { MainCameraInitSystem } from "white-dwarf/Core/Render/System/MainCameraInitSystem";
import { MainCameraInitTag } from "white-dwarf/Core/Render/TagComponent/MainCameraInitTag";
import { MainCameraTag } from "white-dwarf/Core/Render/TagComponent/MainCameraTag";
import {
  WorldSerializer,
  IWorldObject,
} from "white-dwarf/Core/Serialization/WorldSerializer";
import { EditorSystem2DRegister } from "white-dwarf/Editor/EditorSystem2DRegister";
import { EditorSystem3DRegister } from "white-dwarf/Editor/EditorSystem3DRegister";
import { EditorCamTagAppendSystem } from "white-dwarf/Editor/System/EditorCamTagAppendSystem";
import { EditorViewPort3DSystem } from "white-dwarf/Editor/System/EditorViewPort3DSystem";
import { LineFrame3DSegment } from "white-dwarf/Mathematics/LineFrame3DSegment";
import { Vector3 } from "white-dwarf/Mathematics/Vector3";
import { Cam3DDragSystem } from "white-dwarf/Utils/System/Cam3DDragSystem";
import { ClothInitSystem } from "./Systems/ClothInitSystem";
import { FollowPositionSystem } from "./Systems/FollowPositionSystem";
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
      const worldObject = (await fetch("assets/world.json").then((response) =>
        response.json()
      )) as IWorldObject;
      // Deserialize the world.
      WorldSerializer.deserializeWorld(mainWorld, worldObject);
    }

    // Register main camera init system.
    mainWorld.registerSystem(MainCameraInitSystem);

    // // Register follow system.
    // mainWorld.registerSystem(FollowPositionSystem);

    // Register Euler move and gravity system.
    mainWorld
      .registerSystem(EulerVelocity3DMoveSystem)
      .registerSystem(EulerVelocityGravitySystem);
    // Register Verlet move and gravity system.
    mainWorld
      .registerSystem(VerletVelocity3DMoveSystem, {
        priority: 100,
      })
      .registerSystem(VerletVelocity3DGravitySystem);
    // Register constraint system.
    mainWorld.registerSystem(JakobsenConstraintSystem);

    // // Register physics sync system.
    // mainWorld.registerSystem(MainWorldTransformSyncSystem, {
    //   physicsWorld: physicsWorld,
    // });
    // physicsWorld.registerSystem(PhysicsWorldTransformSyncSystem, {
    //   priority: 1000,
    // });

    // Register rope and cloth init system.
    mainWorld.registerSystem(RopeInitSystem).registerSystem(ClothInitSystem);

    // Register camera drag system and view port system.
    mainWorld
      .registerSystem(Cam3DDragSystem, {
        mainCanvas: coreRenderContext.mainCanvas,
      })
      .registerSystem(EditorViewPort3DSystem, {
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
    mainWorld.registerSystem(RopePreviewRenderer, {
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
