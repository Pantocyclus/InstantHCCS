import { CombatStrategy } from "grimoire-kolmafia";
import { cliExecute, effectModifier, myClass } from "kolmafia";
import {
  $class,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $skill,
  CommunityService,
  ensureEffect,
  get,
  have,
  uneffect,
} from "libram";
import Macro from "../combat";
import { baseOutfit } from "../engine/outfit";
import { Quest } from "../engine/task";
import { logTestSetup } from "../lib";
import { restoreMpTask } from "./common";

export const BoozeDropQuest: Quest = {
  name: "Booze Drop",
  completed: () => CommunityService.BoozeDrop.isDone(),
  tasks: [
    { ...restoreMpTask },
    {
      name: "Set Apriling Band Helmet (Booze)",
      completed: () => get("nextAprilBandTurn") > 0,
      do: () => cliExecute("aprilband effect drop"),
      limit: { tries: 1 },
    },
    // {
    //   name: "Underground Fireworks Shop",
    //   prepare: () => visitUrl("clan_viplounge.php?action=fwshop&whichfloor=2", false),
    //   completed: () => have($item`oversized sparkler`),
    //   do: (): void => {
    //     if (!have($item`oversized sparkler`)) buy(1, $item`oversized sparkler`);
    //   },
    //   outfit: baseOutfit,
    //   limit: { tries: 1 },
    // },
    {
      name: "Mini-Accordion Thief Buff",
      ready: () => have($familiar`Mini-Adventurer`) && myClass() === $class`Accordion Thief`,
      completed: () => have($effect`Bailando, Fernando`) || myClass() !== $class`Accordion Thief`,
      do: $location`The Dire Warren`,
      outfit: () => ({
        ...baseOutfit(),
        back: $item`vampyric cloake`,
        acc3: $item`Lil' Doctor™ bag`,
        familiar: $familiar`Mini-Adventurer`,
        famequip: $item`tiny stillsuit`,
      }),
      combat: new CombatStrategy().macro(() =>
        Macro.skill($skill`Become a Bat`)
          .skill($skill`Bowl Straight Up`)
          .trySkill($skill`Asdon Martin: Spring-Loaded Front Bumper`)
          .trySkill($skill`Reflex Hammer`)
          .trySkill($skill`Feel Hatred`)
          .trySkill($skill`Snokebomb`)
          .abort(),
      ),
      choices: { [768]: 6 },
      limit: { tries: 2 },
    },
    {
      name: "Vampyric Cape + Bowling Ball",
      completed: () => have($effect`Bat-Adjacent Form`),
      do: $location`The Dire Warren`,
      combat: new CombatStrategy().macro(() =>
        Macro.skill($skill`Become a Bat`)
          .skill($skill`Bowl Straight Up`)
          .trySkill($skill`Asdon Martin: Spring-Loaded Front Bumper`)
          .trySkill($skill`Reflex Hammer`)
          .trySkill($skill`Feel Hatred`)
          .trySkill($skill`Snokebomb`)
          .abort(),
      ),
      outfit: () => ({
        ...baseOutfit(),
        back: $item`vampyric cloake`,
        acc3: $item`Lil' Doctor™ bag`,
      }),
      limit: { tries: 1 },
    },
    {
      name: "Test",
      prepare: (): void => {
        for (const it of $items`lavender candy heart, resolution: be happier, pulled yellow taffy, resolution: be luckier, autumn leaf`)
          if (have(it)) ensureEffect(effectModifier(it, "effect"));
        if (myClass() !== $class`Pastamancer`) {
          // ensureEffect($effect`Spice Haze`);
          if (myClass() === $class`Accordion Thief`) ensureEffect($effect`Beer Barrel Polka`);
        } else {
          // if (myThrall() !== $thrall`Spice Ghost`) useSkill($skill`Bind Spice Ghost`);
          ensureEffect($effect`Pork Barrel`);
        }
      },
      completed: () => CommunityService.BoozeDrop.isDone(),
      do: () => CommunityService.BoozeDrop.run(() => logTestSetup(CommunityService.BoozeDrop), 1),
      outfit: {
        modifier: "1 Item Drop, 2 Booze Drop, -equip broken champagne bottle",
        familiar: $familiar`Trick-or-Treating Tot`,
      },
      effects: [
        $effect`Blessing of the Bird`,
        $effect`Driving Observantly`,
        $effect`Fat Leon's Phat Loot Lyric`,
        $effect`Feeling Lost`,
        // $effect`items.enh`,
        // $effect`I See Everything Thrice!`,
        $effect`Nearly All-Natural`,
        $effect`The Spirit of Taking`,
        $effect`Singer's Faithful Ocelot`,
        $effect`Steely-Eyed Squint`,
        $effect`Uncucumbered`,
        // eslint-disable-next-line libram/verify-constants
        $effect`Who's Going to Pay This Drunken Sailor?`,
      ],
      acquire: [{ item: $item`wad of used tape` }],
      limit: { tries: 1 },
      post: () => uneffect($effect`Fat Leon's Phat Loot Lyric`),
    },
  ],
};
