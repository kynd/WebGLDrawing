import "destyle.css";
import "./scss/style.scss";
import $ from "jquery";
import { DrawingTool } from "./js/scenarios/DrawingTool";

$(()=>{
    new DrawingTool();
});
