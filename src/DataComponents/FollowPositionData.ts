import { Component, ComponentSchema } from "ecsy/Component";
import { Types } from "ecsy/Types";
import { IComponent } from "white-dwarf/Core/ComponentRegistry";
import { TransformData3D } from "white-dwarf/Core/Locomotion/DataComponent/TransformData3D";
import { Vector3, Vector3Type } from "white-dwarf/Mathematics/Vector3";

@IComponent.register
export class FollowPositionData extends Component<FollowPositionData> {
  static schema: ComponentSchema = {
    entityId: {
      type: Types.Number,
      default: 0,
    },
    targetTransform: {
      type: Types.Ref,
      default: null,
    },
    offset: {
      type: Vector3Type,
      default: new Vector3(0, 0, 0),
    },
  };

  entityId!: number;
  targetTransform!: TransformData3D;
  offset!: Vector3;
}
