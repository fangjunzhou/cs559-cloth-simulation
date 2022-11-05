import { Entity } from "ecsy/Entity";
import { Attributes, System, SystemQueries } from "ecsy/System";
import { World } from "ecsy/World";
import { vec3 } from "gl-matrix";
import { TransformData3D } from "white-dwarf/Core/Locomotion/DataComponent/TransformData3D";
import {
  Constraint,
  ConstraintData,
} from "white-dwarf/Core/Physics/DataComponents/ConstraintData";
import { MassData } from "white-dwarf/Core/Physics/DataComponents/MassData";
import { SyncTransform3DData } from "white-dwarf/Core/Physics/DataComponents/SyncTransform3DData";
import { VerletVelocityData3D } from "white-dwarf/Core/Physics/DataComponents/VerletVelocityData3D";
import { SelectableObject } from "white-dwarf/Utils/TagComponents/SelectableObject";
import { ClothInitData } from "../DataComponents/ClothInitData";

export class ClothInitSystem extends System {
  static queries: SystemQueries = {
    clothInitEntities: {
      components: [TransformData3D, ClothInitData],
    },
  };

  init(attributes?: Attributes | undefined): void {
    const mainWorld: World = attributes?.mainWorld as World;
    const physicsWorld: World = attributes?.physicsWorld as World;

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
        vec3.fromValues(-(initData.width * initData.resolution) / 2, 0, 0)
      );
      const root1 = mainWorld
        .createEntity("Cloth Root 1")
        .addComponent(SelectableObject)
        .addComponent(TransformData3D, {
          position: position1,
        });
      const physicsRoot1 = physicsWorld
        .createEntity("Cloth Root 1")
        .addComponent(TransformData3D, {
          position: position1,
        });

      root1.addComponent(SyncTransform3DData, {
        targetTransform: physicsRoot1.getMutableComponent(
          TransformData3D
        ) as TransformData3D,
      });

      const position2 = transform.position.clone();
      vec3.add(
        position2.value,
        position2.value,
        vec3.fromValues((initData.width * initData.resolution) / 2, 0, 0)
      );
      const root2 = mainWorld
        .createEntity("Cloth Root 2")
        .addComponent(SelectableObject)
        .addComponent(TransformData3D, {
          position: position2,
        });
      const physicsRoot2 = physicsWorld
        .createEntity("Cloth Root 2")
        .addComponent(TransformData3D, {
          position: position2,
        });

      root2.addComponent(SyncTransform3DData, {
        targetTransform: physicsRoot2.getMutableComponent(
          TransformData3D
        ) as TransformData3D,
      });

      // Cloth 2D array of size width * height.
      const cloth: ([Entity, Entity] | null)[][] = [];
      for (let i = 0; i < initData.height; i++) {
        cloth.push([]);
        for (let j = 0; j < initData.width; j++) {
          cloth[i].push(null);
        }
      }

      // Init roots.
      cloth[0][0] = [root1, physicsRoot1];
      cloth[0][initData.width - 1] = [root2, physicsRoot2];

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
            cloth[i][j] = [
              mainWorld
                .createEntity("Cloth Node")
                .addComponent(TransformData3D, {
                  position: position,
                }),
              physicsWorld
                .createEntity("Cloth Node")
                .addComponent(TransformData3D, {
                  position: position,
                })
                .addComponent(VerletVelocityData3D)
                .addComponent(MassData, {
                  mass: 0.1,
                }),
            ];

            // Sync transform.
            const [mainEntity, physicsEntity] = cloth[i][j] as [Entity, Entity];
            physicsEntity.addComponent(SyncTransform3DData, {
              targetTransform: mainEntity.getMutableComponent(
                TransformData3D
              ) as TransformData3D,
            });
            mainEntity.addComponent(SyncTransform3DData, {
              targetTransform: physicsEntity.getMutableComponent(
                TransformData3D
              ) as TransformData3D,
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
          const [mainEntity, physicsEntity] = cloth[i][j] as [Entity, Entity];
          mainEntity.addComponent(ConstraintData, {
            constraints: [],
          });
          physicsEntity.addComponent(ConstraintData, {
            constraints: [],
          });

          if (i > 0) {
            // Add constraint with upper node.
            const upperNode = cloth[i - 1][j] as [Entity, Entity];
            if (upperNode !== null) {
              this.addConstraint(upperNode[0], initData, mainEntity);
              this.addConstraint(upperNode[1], initData, physicsEntity);
            }
          }
          if (i < initData.height - 1) {
            // Add constraint with lower node.
            const lowerNode = cloth[i + 1][j] as [Entity, Entity];
            if (lowerNode !== null) {
              this.addConstraint(lowerNode[0], initData, mainEntity);
              this.addConstraint(lowerNode[1], initData, physicsEntity);
            }
          }
          if (j > 0) {
            // Add constraint with left node.
            const leftNode = cloth[i][j - 1] as [Entity, Entity];
            if (leftNode !== null) {
              this.addConstraint(leftNode[0], initData, mainEntity);
              this.addConstraint(leftNode[1], initData, physicsEntity);
            }
          }
          if (j < initData.width - 1) {
            // Add constraint with right node.
            const rightNode = cloth[i][j + 1] as [Entity, Entity];
            if (rightNode !== null) {
              this.addConstraint(rightNode[0], initData, mainEntity);
              this.addConstraint(rightNode[1], initData, physicsEntity);
            }
          }
        }
      }
    });
  }

  private addConstraint(
    target: Entity,
    initData: ClothInitData,
    entity: Entity
  ) {
    const constraint = new Constraint(target, initData.resolution);
    entity?.getMutableComponent(ConstraintData)?.constraints.push(constraint);
  }

  execute(delta: number, time: number): void {
    // Do nothing.
  }
}
