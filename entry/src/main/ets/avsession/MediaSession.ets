import { avSession } from '@kit.AVSessionKit';
import { wantAgent, WantAgent, common } from '@kit.AbilityKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { bark } from '../../ts/patch';

export type PlayState = 'playing' | 'paused' | 'stopped';

export class MediaSession {
  private session?: avSession.AVSession;
  private context: common.UIAbilityContext;
  onStateChange?: (state: PlayState) => void;

  constructor(context: common.UIAbilityContext) {
    this.context = context;
  }

  async create(): Promise<void> {
    if (this.session) return;
    this.session = await avSession.createAVSession(this.context, 'distraction-sample', 'audio');
    bark(`avSession created, id=${this.session.sessionId}`);

    const agent: WantAgent = await wantAgent.getWantAgent({
      wants: [{
        bundleName: 'play.ground.distraction',
        abilityName: 'EntryAbility',
      }],
      operationType: wantAgent.OperationType.START_ABILITY,
      requestCode: 0,
      wantAgentFlags: [wantAgent.WantAgentFlags.UPDATE_PRESENT_FLAG],
    });
    await this.session.setLaunchAbility(agent);
    bark('setLaunchAbility done');

    await this.session.setAVMetadata({
      assetId: 'sample-001',
      title: 'Distraction Sample',
      artist: 'natsuki',
      album: 'AVSession Demo',
      duration: 210_000,
    });

    await this.session.setAVPlaybackState({
      state: avSession.PlaybackState.PLAYBACK_STATE_PAUSE,
      position: { elapsedTime: 0, updateTime: Date.now() },
      speed: 1.0,
    });

    this.session.on('play', () => this.handleControl('playing', 'play'));
    this.session.on('pause', () => this.handleControl('paused', 'pause'));
    this.session.on('stop', () => this.handleControl('stopped', 'stop'));
    this.session.on('playNext', () => bark('ctrl: playNext'));
    this.session.on('playPrevious', () => bark('ctrl: playPrevious'));

    await this.session.activate();
    bark('avSession activated');
  }

  private handleControl(next: PlayState, tag: string) {
    bark(`ctrl: ${tag}`);
    this.updateState(next).catch((e: BusinessError): void => bark(`updateState fail: ${e.code}`));
    this.onStateChange?.(next);
  }

  async updateState(state: PlayState): Promise<void> {
    if (!this.session) return;
    const map: Record<PlayState, number> = {
      'playing': avSession.PlaybackState.PLAYBACK_STATE_PLAY,
      'paused': avSession.PlaybackState.PLAYBACK_STATE_PAUSE,
      'stopped': avSession.PlaybackState.PLAYBACK_STATE_STOP,
    };
    await this.session.setAVPlaybackState({
      state: map[state],
      position: { elapsedTime: 0, updateTime: Date.now() },
      speed: 1.0,
    });
  }

  async destroy(): Promise<void> {
    if (!this.session) return;
    await this.session.destroy();
    this.session = undefined;
    bark('avSession destroyed');
  }
}
