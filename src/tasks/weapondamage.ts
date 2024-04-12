import { CombatStrategy } from "grimoire-kolmafia";
import { cliExecute, effectModifier, useFamiliar } from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  CombatLoversLocket,
  CommunityService,
  ensureEffect,
  get,
  have,
  SongBoom,
} from "libram";
import { Quest } from "../engine/task";
import { burnLibram, crimboCarols, logTestSetup } from "../lib";
import { innerElfTask } from "./common";
import Macro from "../combat";
import { baseOutfit } from "../engine/outfit";

export const WeaponDamageQuest: Quest = {
  name: "Weapon Damage",
  completed: () => CommunityService.WeaponDamage.isDone(),
  tasks: [
    {
      name: "Carol Ghost Buff",
      ready: () => crimboCarols.every((ef) => !have(ef)) && get("_reflexHammerUsed") < 3,
      completed: () => have($effect`Do You Crush What I Crush?`),
      do: $location`The Dire Warren`,
      combat: new CombatStrategy().macro(Macro.skill($skill`Reflex Hammer`)),
      outfit: () => ({
        ...baseOutfit(),
        acc1: $item`Lil' Doctor™ bag`,
        familiar: $familiar`Ghost of Crimbo Carols`,
        famequip: $item`none`,
      }),
      limit: { tries: 1 },
    },
    { ...innerElfTask },
    {
      name: "Ungulith",
      ready: () => get("_meteorShowerUses") < 5 && get("_saberForceUses") < 5,
      prepare: () => useFamiliar($familiar`Disembodied Hand`),
      completed: () =>
        have($effect`Meteor Showered`) &&
        (have($item`corrupted marrow`) || have($effect`Cowrruption`)),
      do: () => CombatLoversLocket.reminisce($monster`ungulith`),
      combat: new CombatStrategy().macro(
        Macro.skill($skill`Meteor Shower`).skill($skill`Use the Force`),
      ),
      choices: { 1387: 3 },
      outfit: () => ({
        ...baseOutfit(),
        weapon: $item`none`,
        offhand: $item`none`,
        familiar: $familiar`Disembodied Hand`,
        famequip: $item`Fourth of May Cosplay Saber`,
      }),
      limit: { tries: 1 },
    },
    {
      name: "Test",
      prepare: (): void => {
        SongBoom.setSong("These Fists Were Made for Punchin'");
        // eslint-disable-next-line libram/verify-constants
        for (const it of $items`Fabiotion, resolution: be feistier, imported taffy`)
          if (have(it)) ensureEffect(effectModifier(it, "effect"));
        if (!have($effect`Spit Upon`)) cliExecute("genie effect outer wolf");
      },
      completed: () => CommunityService.WeaponDamage.isDone(),
      do: () =>
        CommunityService.WeaponDamage.run(() => logTestSetup(CommunityService.WeaponDamage), 2),
      outfit: { modifier: "weapon dmg", familiar: $familiar`Disembodied Hand` },
      effects: [
        $effect`Billiards Belligerence`,
        $effect`Bow-Legged Swagger`,
        $effect`Carol of the Bulls`,
        $effect`Cowrruption`,
        $effect`Disdain of the War Snapper`,
        $effect`Frenzied, Bloody`,
        $effect`Jackasses' Symphony of Destruction`,
        $effect`Lack of Body-Building`,
        $effect`Rage of the Reindeer`,
        $effect`Scowl of the Auk`,
        $effect`Song of the North`,
        $effect`Tenacity of the Snapper`,
        $effect`The Power of LOV`,
      ],
      acquire: [{ item: $item`broken champagne bottle` }],
      post: (): void => {
        SongBoom.setSong("Total Eclipse of Your Meat");
        burnLibram(300);
      },
      limit: { tries: 1 },
    },
  ],
};
