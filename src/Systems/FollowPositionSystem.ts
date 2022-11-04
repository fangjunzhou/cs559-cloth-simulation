import { System, SystemQueries } from "ecsy/System";
import { vec3 } from "gl-matrix";
import { TransformData3D } from "white-dwarf/Core/Locomotion/DataComponent/TransformData3D";
import { FollowPositionData } from "../DataComponents/FollowPositionData";

export class FollowPositionSystem extends System {
  static queries: SystemQueries = {
    followEntity: {
      components: [TransformData3D, FollowPositionData],
    },
  };

  execute(delta: number, time: number): void {
    this.queries.followEntity.results.forEach((entity) => {
      // Get the follow data.
      const followData = entity.getComponent(
        FollowPositionData
      ) as FollowPositionData;

      // Get mutable transform.
      const transform = entity.getMutableComponent(
        TransformData3D
      ) as TransformData3D;

      // Get follow target.
      const followTarget = this.world.getEntityById(followData.entityId);
      // Get target transform.
      if (!followTarget || !followTarget.hasComponent(TransformData3D)) {
        return;
      }
      const targetTransform = followTarget.getComponent(
        TransformData3D
      ) as TransformData3D;

      // Update transform.
      vec3.add(
        transform.position.value,
        targetTransform.position.value,
        followData.offset.value
      );
    });
  }
}
