import "destyle.css";
import "./scss/style.scss";
import $ from "jquery";
import { TestScenario } from "./js/scenarios/_archive/TestScenario.js";
import { DataTextureTest } from "./js/scenarios/_archive/DataTextureTest.js";
import { PingPongTest } from "./js/scenarios/_archive/PingPongTest.js";
import { PointerTest } from "./js/scenarios/_archive/PointerTest.js";
import { PointersOnShader } from "./js/scenarios/_archive/PointersOnShader.js";
import { PointersOnShader02 } from "./js/scenarios/_archive/PointersOnShader02.js";
import { SaveTest } from "./js/scenarios/_archive/SaveTest.js";
import { CircleSketch } from "./js/scenarios/_archive/CircleSketch";
import { DraggableDrawingTool } from "./js/scenarios/DraggableDrawingTool";
import { DrawingTool } from "./js/scenarios/DrawingTool";

$(()=>{
    new DrawingTool();
});
