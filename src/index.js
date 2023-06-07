import "destyle.css";
import "./scss/style.scss";
import $ from "jquery";
import { TestScenario } from "./js/scenarios/archive/TestScenario.js";
import { DataTextureTest } from "./js/scenarios/archive/DataTextureTest.js";
import { PingPongTest } from "./js/scenarios/archive/PingPongTest.js";
import { PointerTest } from "./js/scenarios/archive/PointerTest.js";
import { PointersOnShader } from "./js/scenarios/archive/PointersOnShader.js";
import { PointersOnShader02 } from "./js/scenarios/archive/PointersOnShader02.js";
import { SaveTest } from "./js/scenarios/archive/SaveTest.js";
import { CircleSketch } from "./js/scenarios/archive/CircleSketch";
import { ToolPrototype } from "./js/scenarios/ToolPrototype";
import { DraggableToolPrototype } from "./js/scenarios/DraggableToolPrototype";
import { DraggableDrawingTool } from "./js/scenarios/DraggableDrawingTool";

$(()=>{
    new DraggableDrawingTool();
});
