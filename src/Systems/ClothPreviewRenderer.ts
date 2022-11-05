import { SystemQueries } from "ecsy/System";
import { mat4, vec3 } from "gl-matrix";
import { TransformData3D } from "white-dwarf/Core/Locomotion/DataComponent/TransformData3D";
import { Canvas3DRenderer } from "white-dwarf/Core/Render/System/Canvas3DRenderer";
import { ClothInitData } from "../DataComponents/ClothInitData";

export class ClothPreviewRenderer extends Canvas3DRenderer {
  static queries: SystemQueries = {
    ...this.queries,
    ropeEntities: {
      components: [TransformData3D, ClothInitData],
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
        ClothInitData
      ) as ClothInitData;

      const topCorner = vec3.add(
        vec3.create(),
        transform.position.value,
        vec3.fromValues(
          (-ropeInitData.width * ropeInitData.resolution) / 2,
          0,
          0
        )
      );
      for (let i = 0; i <= ropeInitData.height; i++) {
        for (let j = 0; j <= ropeInitData.width; j++) {
          const currPos = vec3.transformMat4(
            vec3.create(),
            vec3.add(
              vec3.create(),
              topCorner,
              vec3.fromValues(
                j * ropeInitData.resolution,
                -i * ropeInitData.resolution,
                0
              )
            ),
            worldToScreen
          );

          if (i > 0) {
            const prevPos = vec3.transformMat4(
              vec3.create(),
              vec3.add(
                vec3.create(),
                topCorner,
                vec3.fromValues(
                  j * ropeInitData.resolution,
                  -(i - 1) * ropeInitData.resolution,
                  0
                )
              ),
              worldToScreen
            );
            this.drawLine(prevPos, currPos, "black", 1);
          }
          if (i < ropeInitData.height - 1) {
            const nextPos = vec3.transformMat4(
              vec3.create(),
              vec3.add(
                vec3.create(),
                topCorner,
                vec3.fromValues(
                  j * ropeInitData.resolution,
                  -(i + 1) * ropeInitData.resolution,
                  0
                )
              ),
              worldToScreen
            );
            this.drawLine(nextPos, currPos, "black", 1);
          }
          if (j > 0) {
            const prevPos = vec3.transformMat4(
              vec3.create(),
              vec3.add(
                vec3.create(),
                topCorner,
                vec3.fromValues(
                  (j - 1) * ropeInitData.resolution,
                  -i * ropeInitData.resolution,
                  0
                )
              ),
              worldToScreen
            );
            this.drawLine(prevPos, currPos, "black", 1);
          }
          if (j < ropeInitData.width - 1) {
            const nextPos = vec3.transformMat4(
              vec3.create(),
              vec3.add(
                vec3.create(),
                topCorner,
                vec3.fromValues(
                  (j + 1) * ropeInitData.resolution,
                  -i * ropeInitData.resolution,
                  0
                )
              ),
              worldToScreen
            );
            this.drawLine(nextPos, currPos, "black", 1);
          }
        }
      }
    });
  }
}
