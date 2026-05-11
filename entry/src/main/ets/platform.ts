import { Want } from '@kit.AbilityKit'

export const Consts = { bundleName: "rivercr.a.b" }

export const [DefaultWant, SecondaryWant, LastWant] =
  ["Default", "Secondary", "Last"].map(it => ({ bundleName: Consts.bundleName, abilityName: `${it}Ability` } as Want))

export const wantFor = (shorty: string) => ({ pkgName: Consts.bundleName, abilityName: `${shorty}Ability` })