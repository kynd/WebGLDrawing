import "destyle.css";
import "./scss/style.scss";
import $ from "jquery";
import { DrawingTool } from "./js/scenarios/DrawingTool";
import { AutoDraw } from "./js/scenarios/autoDraw/AutoDraw";
import { WonderScenario } from "./js/scenarios/autoDraw/WonderScenario";
import { ActorsScenario } from "./js/scenarios/autoDraw/ActorsScenario";
import { CompositionScenario } from "./js/scenarios/autoDraw/CompositionScenario";

$(()=>{
    new DrawingTool();
    //new CompositionScenario();
});
