import { Attributes, System, SystemQueries } from "ecsy/System";
import { World } from "ecsy/World";
import { mainWorld } from "white-dwarf/Core";
import { TransformData3D } from "white-dwarf/Core/Locomotion/DataComponent/TransformData3D";
import {
  ConstraintData,
  Constraint,
} from "white-dwarf/Core/Physics/DataComponents/ConstraintData";
import { MassData } from "white-dwarf/Core/Physics/DataComponents/MassData";
import { SyncTransform3DData } from "white-dwarf/Core/Physics/DataComponents/SyncTransform3DData";
import { VerletVelocityData3D } from "white-dwarf/Core/Physics/DataComponents/VerletVelocityData3D";
import { Vector3 } from "white-dwarf/Mathematics/Vector3";
import { SelectableObject } from "white-dwarf/Utils/TagComponents/SelectableObject";
import { RopeInitData } from "../DataComponents/RopeInitData";

export class RopeInitSystem extends System {
  static queries: SystemQueries = {
    ropeInitEntities: {
      components: [TransformData3D, RopeInitData],
    },
  };

  init(attributes?: Attributes | undefined): void {
    const mainWorld: World = attributes?.mainWorld as World;
    const physicsWorld: World = attributes?.physicsWorld as World;

    this.queries.ropeInitEntities.results.forEach((ropeInitEntity) => {
      // Get transform.
      const transform = ropeInitEntity.getComponent(
        TransformData3D
      ) as TransformData3D;
      // Get rope init data.
      const initData = ropeInitEntity.getComponent(
        RopeInitData
      ) as RopeInitData;

      // Add a rope.
      let curr = mainWorld
        .createEntity("Rope Root")
        .addComponent(SelectableObject)
        .addComponent(TransformData3D, {
          position: transform.position.clone(),
        });

      let physicsCurr = physicsWorld
        .createEntity("Rope Root")
        .addComponent(TransformData3D, {
          position: transform.position.clone(),
        });

      curr.addComponent(SyncTransform3DData, {
        targetTransform: physicsCurr.getMutableComponent(
          TransformData3D
        ) as TransformData3D,
      });

      const ropeResolution = initData.resolution;
      for (let i = 0; i < initData.length; i++) {
        let next = mainWorld
          .createEntity("Rope Node")
          .addComponent(TransformData3D, {
            position: new Vector3(
              transform.position.value[0],
              transform.position.value[1] - i * ropeResolution,
              transform.position.value[2]
            ),
          })
          .addComponent(ConstraintData, {
            constraints: [new Constraint(curr, ropeResolution)],
          });

        curr
          .getComponent(ConstraintData)
          ?.constraints.push(new Constraint(next, ropeResolution));

        curr = next;

        let physicsNext = physicsWorld
          .createEntity("Rope Node")
          .addComponent(TransformData3D, {
            position: new Vector3(
              transform.position.value[0],
              transform.position.value[1] - i * ropeResolution,
              transform.position.value[2]
            ),
          })
          .addComponent(VerletVelocityData3D)
          .addComponent(MassData, {
            mass: 0.1,
          })
          .addComponent(ConstraintData, {
            constraints: [new Constraint(physicsCurr, ropeResolution)],
          });

        physicsCurr
          .getComponent(ConstraintData)
          ?.constraints.push(new Constraint(physicsNext, ropeResolution));

        physicsCurr = physicsNext;

        physicsCurr.addComponent(SyncTransform3DData, {
          targetTransform: curr.getMutableComponent(
            TransformData3D
          ) as TransformData3D,
        });

        curr.addComponent(SyncTransform3DData, {
          targetTransform: physicsCurr.getMutableComponent(
            TransformData3D
          ) as TransformData3D,
        });
      }
    });
  }

  execute(delta: number, time: number): void {
    // Do nothing.
  }
}
