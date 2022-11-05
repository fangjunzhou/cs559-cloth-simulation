import { Component, ComponentSchema } from "ecsy/Component";
import { Types } from "ecsy/Types";
import { IComponent } from "white-dwarf/Core/ComponentRegistry";

@IComponent.register
export class RopeInitData extends Component<RopeInitData> {
  static schema: ComponentSchema = {
    length: {
      type: Types.Number,
      default: 0,
    },
    resolution: {
      type: Types.Number,
      default: 0,
    },
  };

  length!: number;
  resolution!: number;
}
