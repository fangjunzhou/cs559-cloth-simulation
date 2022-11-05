import { Component, ComponentSchema } from "ecsy/Component";
import { Types } from "ecsy/Types";
import { IComponent } from "white-dwarf/Core/ComponentRegistry";

@IComponent.register
export class ClothInitData extends Component<ClothInitData> {
  static schema: ComponentSchema = {
    width: {
      type: Types.Number,
      default: 0,
    },
    height: {
      type: Types.Number,
      default: 0,
    },
    resolution: {
      type: Types.Number,
      default: 0,
    },
  };

  width!: number;
  height!: number;
  resolution!: number;
}
