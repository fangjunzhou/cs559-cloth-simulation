import { releaseInit } from "white-dwarf/Core";
import { coreRenderContext } from "white-dwarf/Core/Context/RenderContext";
import { main } from ".";

window.onload = () => {
  // Setup main canvas.
  coreRenderContext.mainCanvas = document.getElementById(
    "mainCanvas"
  ) as HTMLCanvasElement;

  // Disable right click.
  coreRenderContext.mainCanvas.oncontextmenu = (e) => {
    e.preventDefault();
  };

  // Resize main canvas.
  coreRenderContext.mainCanvas.width = coreRenderContext.mainCanvas.clientWidth;
  coreRenderContext.mainCanvas.height =
    coreRenderContext.mainCanvas.clientHeight;

  // Development main.
  main();

  // White Dwarf Main
  releaseInit();
};

window.onresize = () => {
  // Resize main canvas.
  if (coreRenderContext.mainCanvas) {
    coreRenderContext.mainCanvas.width =
      coreRenderContext.mainCanvas.clientWidth;
    coreRenderContext.mainCanvas.height =
      coreRenderContext.mainCanvas.clientHeight;
  }
};
