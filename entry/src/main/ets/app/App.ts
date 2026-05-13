import AbilityStage from '@ohos.app.ability.AbilityStage';
import fs from '@ohos.file.fs';
import crab from 'libcrab.so';
import { bark } from '../patch';

const mode = fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE | fs.OpenMode.TRUNC;

export default class App extends AbilityStage {
  onCreate(): void {
    const state = crab.status();
    bark(`App:status=${JSON.stringify(state)}`);
    if (state.loaded) return;

    const home = `${this.context.filesDir}/frida`;
    const path = `${home}/agent.js`;
    const body = this.context.resourceManager.getRawFileContentSync('frida/agent.js');
    if (!fs.accessSync(home)) fs.mkdirSync(home);
    const file = fs.openSync(path, mode);
    fs.writeSync(file.fd, body.buffer, { offset: body.byteOffset, length: body.byteLength });
    fs.closeSync(file);

    const config = JSON.stringify({ interaction: { type: 'script', path } });
    bark(`App:bootstrap=${JSON.stringify(crab.bootstrap('libgadget.so', config))}`);
  }
}
