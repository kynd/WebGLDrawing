export class SceneBase {
    constructor(context) {
        this.context = context;
    }

    async setup() {
        await this.setupMain();
        this.ready = true;
    }

    async setupMain() {}
}
