import { Entity } from "ecsy/Entity";
import { Attributes, System, SystemQueries } from "ecsy/System";
import { vec3 } from "gl-matrix";
import { TransformData3D } from "white-dwarf/Core/Locomotion/DataComponent/TransformData3D";
import {
  Constraint,
  ConstraintData,
} from "white-dwarf/Core/Physics/DataComponents/ConstraintData";
import { MassData } from "white-dwarf/Core/Physics/DataComponents/MassData";
import { VerletVelocityData3D } from "white-dwarf/Core/Physics/DataComponents/VerletVelocityData3D";
import { ClothInitData } from "../DataComponents/ClothInitData";

export class ClothInitSystem extends System {
  static queries: SystemQueries = {
    clothInitEntities: {
      components: [TransformData3D, ClothInitData],
    },
  };

  init(attributes?: Attributes | undefined): void {
    this.queries.clothInitEntities.results.forEach((clothInitEntity) => {
      // Get transform.
      const transform = clothInitEntity.getComponent(
        TransformData3D
      ) as TransformData3D;
      // Get rope init data.
      const initData = clothInitEntity.getComponent(
        ClothInitData
      ) as ClothInitData;

      // Add two roots.
      const position1 = transform.position.clone();
      vec3.add(
        position1.value,
        position1.value,
        vec3.fromValues((initData.width * initData.resolution) / 2, 0, 0)
      );
      const root1 = this.world
        .createEntity("Cloth Root 1")
        .addComponent(TransformData3D, {
          position: position1,
        });
      const position2 = transform.position.clone();
      vec3.add(
        position2.value,
        position2.value,
        vec3.fromValues(-(initData.width * initData.resolution) / 2, 0, 0)
      );
      const root2 = this.world
        .createEntity("Cloth Root 2")
        .addComponent(TransformData3D, {
          position: position2,
        });

      // Cloth 2D array of size width * height.
      const cloth: (Entity | null)[][] = [];
      for (let i = 0; i < initData.height; i++) {
        cloth.push([]);
        for (let j = 0; j < initData.width; j++) {
          cloth[i].push(null);
        }
      }

      // Init roots.
      cloth[0][0] = root1;
      cloth[0][initData.width - 1] = root2;

      // Add cloth.
      for (let i = 0; i < initData.height; i++) {
        for (let j = 0; j < initData.width; j++) {
          if (cloth[i][j] === null) {
            // Add cloth.
            const position = transform.position.clone();
            vec3.add(
              position.value,
              position.value,
              vec3.fromValues(
                -(initData.width * initData.resolution) / 2 +
                  j * initData.resolution,
                -i * initData.resolution,
                0
              )
            );
            cloth[i][j] = this.world
              .createEntity("Cloth Node")
              .addComponent(TransformData3D, {
                position: position,
              })
              .addComponent(VerletVelocityData3D)
              .addComponent(MassData, {
                mass: 0.1,
              });
          }
        }
      }

      // Add constraints.
      for (let i = 0; i < initData.height; i++) {
        for (let j = 0; j < initData.width; j++) {
          // Skip root.
          if (i === 0 && (j === 0 || j === initData.width - 1)) {
            continue;
          }
          cloth[i][j]?.addComponent(ConstraintData, {
            constraints: [],
          });

          if (i > 0) {
            // Add constraint with upper node.
            const upperNode = cloth[i - 1][j] as Entity;
            if (upperNode !== null) {
              const constraint = new Constraint(upperNode, initData.resolution);
              cloth[i][j]
                ?.getMutableComponent(ConstraintData)
                ?.constraints.push(constraint);
            }
          }
          if (i < initData.height - 1) {
            // Add constraint with lower node.
            const lowerNode = cloth[i + 1][j] as Entity;
            if (lowerNode !== null) {
              const constraint = new Constraint(lowerNode, initData.resolution);
              cloth[i][j]
                ?.getMutableComponent(ConstraintData)
                ?.constraints.push(constraint);
            }
          }
          if (j > 0) {
            // Add constraint with left node.
            const leftNode = cloth[i][j - 1];
            if (leftNode !== null) {
              const constraint = new Constraint(leftNode, initData.resolution);
              cloth[i][j]
                ?.getMutableComponent(ConstraintData)
                ?.constraints.push(constraint);
            }
          }
          if (j < initData.width - 1) {
            // Add constraint with right node.
            const rightNode = cloth[i][j + 1];
            if (rightNode !== null) {
              const constraint = new Constraint(rightNode, initData.resolution);
              cloth[i][j]
                ?.getMutableComponent(ConstraintData)
                ?.constraints.push(constraint);
            }
          }
        }
      }
    });
  }

  execute(delta: number, time: number): void {
    // Do nothing.
  }
}
