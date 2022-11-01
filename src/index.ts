import { mainWorld } from "white-dwarf/Core";
import { coreRenderContext } from "white-dwarf/Core/Context/RenderContext";
import { systemContext } from "white-dwarf/Core/CoreSetup";
import { TransformData2D } from "white-dwarf/Core/Locomotion/DataComponent/TransformData2D";
import { TransformData3D } from "white-dwarf/Core/Locomotion/DataComponent/TransformData3D";
import { CameraData2D } from "white-dwarf/Core/Render/DataComponent/CameraData2D";
import { LineFrameRenderData3D } from "white-dwarf/Core/Render/DataComponent/LineFrameRenderData3D";
import { PerspectiveCameraData3D } from "white-dwarf/Core/Render/DataComponent/PerspectiveCameraData3D";
import { RenderSystem3DRegister } from "white-dwarf/Core/Render/RenderSystem3DRegister";
import { MainCameraTag } from "white-dwarf/Core/Render/TagComponent/MainCameraTag";
import { EditorSystem2DRegister } from "white-dwarf/Editor/EditorSystem2DRegister";
import { EditorSystem3DRegister } from "white-dwarf/Editor/EditorSystem3DRegister";
import { EditorCamTagAppendSystem } from "white-dwarf/Editor/System/EditorCamTagAppendSystem";
import { LineFrame3DSegment } from "white-dwarf/Mathematics/LineFrame3DSegment";
import { Vector3 } from "white-dwarf/Mathematics/Vector3";

export const main = () => {
  systemContext.coreSetup = () => {
    if (coreRenderContext.mainCanvas) {
      new RenderSystem3DRegister(coreRenderContext.mainCanvas).register(
        mainWorld
      );
    }
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

    // Add a line segment render entity.
    mainWorld
      .createEntity("Line Segment Render")
      .addComponent(TransformData3D)
      .addComponent(LineFrameRenderData3D, {
        segments: [
          new LineFrame3DSegment(
            new Vector3(-1, -1, -1),
            new Vector3(1, -1, -1)
          ),
          new LineFrame3DSegment(
            new Vector3(-1, -1, -1),
            new Vector3(-1, 1, -1)
          ),
          new LineFrame3DSegment(new Vector3(1, 1, -1), new Vector3(1, -1, -1)),
          new LineFrame3DSegment(new Vector3(1, 1, -1), new Vector3(-1, 1, -1)),
          new LineFrame3DSegment(new Vector3(-1, -1, 1), new Vector3(1, -1, 1)),
          new LineFrame3DSegment(new Vector3(-1, -1, 1), new Vector3(-1, 1, 1)),
          new LineFrame3DSegment(new Vector3(1, 1, 1), new Vector3(1, -1, 1)),
          new LineFrame3DSegment(new Vector3(1, 1, 1), new Vector3(-1, 1, 1)),
          new LineFrame3DSegment(
            new Vector3(-1, -1, -1),
            new Vector3(-1, -1, 1)
          ),
          new LineFrame3DSegment(new Vector3(1, -1, -1), new Vector3(1, -1, 1)),
          new LineFrame3DSegment(new Vector3(-1, 1, -1), new Vector3(-1, 1, 1)),
          new LineFrame3DSegment(new Vector3(1, 1, -1), new Vector3(1, 1, 1)),
        ],
      });

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
