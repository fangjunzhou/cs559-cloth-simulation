import { mainWorld } from "../white-dwarf/src/Core";
import { coreRenderContext } from "../white-dwarf/src/Core/Context/RenderContext";
import { systemContext } from "../white-dwarf/src/Core/CoreSetup";
import { RenderSystem2DRegister } from "../white-dwarf/src/Core/Render/RenderSystemRegister";

export const main = () => {
  systemContext.coreSetup = () => {
    if (coreRenderContext.mainCanvas) {
      new RenderSystem2DRegister(coreRenderContext.mainCanvas).register(
        mainWorld
      );
    }
  };
};
