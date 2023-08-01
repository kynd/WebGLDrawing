
import { ToolAutoControl } from "./ToolAutoControl"

export class BasicControl extends ToolAutoControl {

    constructor(context, view) {
        super(context, view);
        this.vertices = [];
    }

    update(data) {
        this.data = data;
        this.updateCommon();
        switch (this.state) {
            case ToolAutoControl.states.ACTIVE: 
            this.updateActive();
            break;
            default:
                return;
        }

        this.updatePreviewObj();
        this.view.vertices = this.vertices;
        this.view.update(this.data);
    }

    updateCommon() {
    }

    updateActive() {
    }
}
