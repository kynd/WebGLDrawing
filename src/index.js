import "destyle.css";
import "./scss/style.scss";
import $ from "jquery";
import { DrawingTool } from "./js/scenarios/DrawingTool";
import { AutoDraw } from "./js/scenarios/autoDraw/AutoDraw";
import { WonderScenario } from "./js/scenarios/autoDraw/WonderScenario";
import { ActorsScenario } from "./js/scenarios/autoDraw/ActorsScenario";
import { SamplerScenario } from "./js/scenarios/autoDraw/SamplerScenario";
import { Actors3DScenario } from "./js/scenarios/autoDraw/Actors3DScenario";

$(()=>{
    //new DrawingTool();
    new CompositionScenario();
    //new Actors3DScenario();
});
