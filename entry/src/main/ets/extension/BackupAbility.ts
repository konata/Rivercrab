import { BackupExtensionAbility, BundleVersion } from '@kit.CoreFileKit'
import { bark } from '../patch'


export default class BackupAbility extends BackupExtensionAbility {
  override onBackup(): void {
    bark("onBackup")
  }

  override onRestore(bundleVersion: BundleVersion): void {
    bark(`onRestore: ${bundleVersion}`)
  }
}





