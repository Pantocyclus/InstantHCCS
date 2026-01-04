import {
  effectModifier,
  elementalResistance,
  equip,
  equippedItem,
  myHp,
  myMaxhp,
  numericModifier,
  retrieveItem,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $effects,
  $element,
  $familiar,
  $item,
  $items,
  $skill,
  $slot,
  BloodCubicZirconia,
  CommunityService,
  ensureEffect,
  get,
  have,
  uneffect,
} from "libram";
import { Quest } from "../engine/task";
import { burnLibram, logTestSetup } from "../lib";
import { innerElfTask, meteorShowerTask, restoreMpTask } from "./common";
import { bloodSugarSauceMagic } from "./postcoil";

export const SpellDamageQuest: Quest = {
  name: "Spell Damage",
  completed: () => CommunityService.SpellDamage.isDone(),
  tasks: [
    { ...restoreMpTask },
    {
      name: "Obsidian Nutcracker",
      completed: () => have($item`Abracandalabra`) || have($item`obsidian nutcracker`),
      do: () => retrieveItem($item`obsidian nutcracker`),
      outfit: { pants: $item`designer sweatpants` },
      limit: { tries: 1 },
    },
    {
      name: "BCZ Dial it up to 11",
      completed: () =>
        have($effect`Up To 11`) || BloodCubicZirconia.timesCast($skill`BCZ: Dial it up to 11`) > 0,
      do: () => {
        useSkill($skill`BCZ: Dial it up to 11`);
      },
      outfit: {
        acc1: $item`blood cubic zirconia`,
      },
      limit: { tries: 1 },
    },
    {
      name: "Simmer",
      completed: () => have($effect`Simmering`),
      do: () => ensureEffect($effect`Simmering`),
      outfit: { famequip: $item`April Shower Thoughts shield` },
      limit: { tries: 1 },
    },
    { ...innerElfTask },
    { ...meteorShowerTask },
    {
      name: "Deep Dark",
      completed: () => have($effect`Visions of the Deep Dark Deeps`),
      prepare: (): void => {
        if (have(bloodSugarSauceMagic)) useSkill($skill`Blood Sugar Sauce Magic`);
      },
      do: (): void => {
        const resist = 1 - elementalResistance($element`spooky`) / 100;
        const neededHp = Math.max(500, myMaxhp() * 4 * resist);
        if (myMaxhp() < neededHp) throw `Not enough HP for Deep Dark Visions.`;
        while (myHp() < neededHp) useSkill($skill`Cannelloni Cocoon`);
        useSkill($skill`Deep Dark Visions`);
      },
      outfit: { modifier: "HP 500max, Spooky Resistance", familiar: $familiar`Exotic Parrot` },
      effects: $effects`Astral Shell, Elemental Saucesphere`,
      post: (): void => {
        if (!have($effect`[1458]Blood Sugar Sauce Magic`))
          useSkill($skill`Blood Sugar Sauce Magic`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Test",
      prepare: (): void => {
        for (const it of $items`confiscated cell phone, Bettie page, resolution: be luckier, resolution: be feistier, cordial of concentration`)
          if (have(it)) ensureEffect(effectModifier(it, "effect"));
        if (
          Math.floor(numericModifier(equippedItem($slot`Acc3`), "Spell Damage") / 50) +
            Math.floor(numericModifier(equippedItem($slot`Acc3`), "Spell Damage Percent") / 50) <
          1
        ) {
          // eslint-disable-next-line libram/verify-constants
          equip($slot`Acc3`, $item`The Eternity Codpiece`);
        }
        if (CommunityService.SpellDamage.actualCost() > 1) {
          if (!get("_cargoPocketEmptied")) {
            visitUrl("inventory.php?action=pocket");
            visitUrl("choice.php?whichchoice=1420&option=1&pocket=177");
          }
          if (!have($effect`Sigils of Yeg`) && have($item`Yeg's Motel hand soap`))
            use($item`Yeg's Motel hand soap`);
        }
      },
      completed: () => CommunityService.SpellDamage.isDone(),
      do: () =>
        CommunityService.SpellDamage.run(() => logTestSetup(CommunityService.SpellDamage), 5),
      outfit: {
        modifier: "spell dmg",
        familiar: have($item`Abracandalabra`)
          ? $familiar`Left-Hand Man`
          : $familiar`Disembodied Hand`,
      },
      effects: [
        $effect`Arched Eyebrow of the Archmage`,
        $effect`Carol of the Hells`,
        $effect`Cowrruption`,
        $effect`Imported Strength`,
        $effect`Jackasses' Symphony of Destruction`,
        $effect`Mental A-cue-ity`,
        $effect`Pisces in the Skyces`,
        $effect`Song of Sauce`,
        $effect`Spirit of Peppermint`,
        $effect`The Magic of LOV`,
        $effect`We're All Made of Starfish`,
      ],
      post: (): void => {
        burnLibram(300);
        useSkill($skill`Spirit of Nothing`);
        equip($familiar`Left-Hand Man`, $item.none);
        uneffect($effect`Jackasses' Symphony of Destruction`);
      },
      limit: { tries: 1 },
    },
  ],
};
