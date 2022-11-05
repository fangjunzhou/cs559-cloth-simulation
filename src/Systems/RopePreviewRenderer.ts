import { SystemQueries } from "ecsy/System";
import { mat4, vec3 } from "gl-matrix";
import { TransformData3D } from "white-dwarf/Core/Locomotion/DataComponent/TransformData3D";
import { Canvas3DRenderer } from "white-dwarf/Core/Render/System/Canvas3DRenderer";
import { RopeInitData } from "../DataComponents/RopeInitData";

export class RopePreviewRenderer extends Canvas3DRenderer {
  static queries: SystemQueries = {
    ...this.queries,
    ropeEntities: {
      components: [TransformData3D, RopeInitData],
    },
  };

  execute(delta: number, time: number): void {
    try {
      super.execute(delta, time);
    } catch (error) {
      console.warn(error);
      return;
    }

    // Generate world to camera matrix.
    this.generateWorldToCameraMatrix();
    // Generate camera to screen matrix.
    this.generateCameraToScreenMatrix();

    // Generate world to screen matrix.
    const worldToScreen = mat4.multiply(
      mat4.create(),
      this.cameraToScreen,
      this.worldToCamera
    );

    this.queries.ropeEntities.results.forEach((ropeEntity) => {
      // Get transform.
      const transform = ropeEntity.getComponent(
        TransformData3D
      ) as TransformData3D;
      // Get rope init data.
      const ropeInitData = ropeEntity.getComponent(
        RopeInitData
      ) as RopeInitData;

      const startPos = vec3.transformMat4(
        vec3.create(),
        transform.position.value,
        worldToScreen
      );

      const endPos = vec3.transformMat4(
        vec3.create(),
        vec3.add(
          vec3.create(),
          transform.position.value,
          vec3.fromValues(0, -ropeInitData.length * ropeInitData.resolution, 0)
        ),
        worldToScreen
      );

      this.drawLine(startPos, endPos, "black", 1);
    });
  }
}
