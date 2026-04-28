import { Want } from "@kit.AbilityKit"

export const Consts = {
  bundleName: "play.ground.distraction"
}

export const [
  DefaultWant,
  SecondaryWant,
  LastWant,
] = ["Default", "Secondary", "Last"].map(it => ({
  bundleName: Consts.bundleName,
  abilityName: `${it}Ability`
} as Want))
