import { CombatStrategy } from "grimoire-kolmafia";
import { cliExecute, myHp, myMaxhp, mySoulsauce, useSkill } from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $skill,
  CommunityService,
  CrimboShrub,
  get,
  getKramcoWandererChance,
  have,
} from "libram";
import Macro, { mainStat } from "../combat";
import { Quest } from "../engine/task";
import { logTestSetup } from "../lib";
import { holidayRunawayTask } from "./common";
import { baseOutfit } from "../engine/outfit";

export const CoilWireQuest: Quest = {
  name: "Coil Wire",
  completed: () => CommunityService.CoilWire.isDone(),
  tasks: [
    { ...holidayRunawayTask },
    {
      name: "Kramco with Shrub",
      ready: () => getKramcoWandererChance() >= 1.0,
      prepare: (): void => {
        CrimboShrub.decorate(`${mainStat.toString()}`, "Spooky Damage", "Blocking", "Red Ray");
        if (myHp() < myMaxhp()) cliExecute("hottub");
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
      },
      completed: () => get("_sausageFights") > 0 || have($effect`Everything Looks Red`),
      do: $location`Noob Cave`,
      combat: new CombatStrategy().macro(
        Macro.skill($skill`Open a Big Red Present`)
          .skill($skill`Micrometeorite`)
          .attack()
          .repeat()
      ),
      outfit: () => ({
        ...baseOutfit(),
        back: $item`protonic accelerator pack`,
        offhand: $item`Kramco Sausage-o-Matic™`,
        familiar: $familiar`Crimbo Shrub`,
        famequip: $item`tiny stillsuit`,
      }),
      post: () => useSkill(Math.floor(mySoulsauce() / 5), $skill`Soul Food`),
      limit: { tries: 1 },
    },
    {
      name: "Test",
      completed: () => CommunityService.CoilWire.isDone(),
      do: () => CommunityService.CoilWire.run(() => logTestSetup(CommunityService.CoilWire)),
      outfit: {
        familiar: $familiar`Left-Hand Man`,
        modifier: "mp, mp regen, switch disembodied hand",
      },
    },
  ],
};
