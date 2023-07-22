import { StripControl } from './StripControl.js';

export class LoopControl extends StripControl {

    constructor(context, view) {
        super(context, view);
        this.isLoop = true;
    }
}
