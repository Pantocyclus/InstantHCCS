import { CombatStrategy } from "grimoire-kolmafia";
import {
  cliExecute,
  equip,
  myHp,
  myMaxhp,
  myMaxmp,
  myMp,
  totalTurnsPlayed,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  $slot,
  CommunityService,
  CrimboShrub,
  get,
  getKramcoWandererChance,
  have,
  PeridotOfPeril,
  set,
} from "libram";
import Macro, { mainStat } from "../combat";
import { Quest } from "../engine/task";
import { logTestSetup, sendAutumnaton } from "../lib";
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
        cliExecute("terminal educate portscan");
      },
      completed: () => get("_sausageFights") > 0 || have($effect`Everything Looks Red`),
      do: $location`Noob Cave`,
      combat: new CombatStrategy().macro(
        Macro.skill($skill`Open a Big Red Present`)
          .skill($skill`Micrometeorite`)
          .attack()
          .repeat(),
      ),
      outfit: () => ({
        ...baseOutfit(),
        back: $item`protonic accelerator pack`,
        offhand: $item`Kramco Sausage-o-Matic™`,
        acc3: $item`Möbius ring`,
        familiar: $familiar`Crimbo Shrub`,
        famequip: $item`tiny stillsuit`,
      }),
      post: () => {
        set("_lastMobiusStripTurn", Math.max(get("_lastMobiusStripTurn", 0), totalTurnsPlayed()));
        // useSkill(Math.floor(mySoulsauce() / 5), $skill`Soul Food`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Eldritch Tentacle",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
      },
      completed: () => get("_eldritchHorrorEvoked"),
      do: (): void => {
        if (myMp() < 66 && myMaxmp() >= 66)
          visitUrl("place.php?whichplace=chateau&action=chateau_restbox");
        useSkill($skill`Evoke Eldritch Horror`);
        visitUrl("main.php");
      },
      post: (): void => {
        visitUrl("main.php");
        if (have($effect`Beaten Up`)) cliExecute("hottub");
        sendAutumnaton();
      },
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Blow the Purple Candle!`)
          .externalIf(get("eldritchTentaclesFought") >= 1, Macro.trySkill($skill`Portscan`))
          .default(),
      ),
      outfit: () => ({
        ...baseOutfit(),
        shirt: $item`makeshift garbage shirt`,
        offhand: $item`Roman Candelabra`,
        familiar: $familiar`Shorter-Order Cook`,
        famequip: $item`toy Cupid bow`,
      }),
      acquire: [{ item: $item`makeshift garbage shirt` }],
      limit: { tries: 1 },
    },
    {
      name: "Oliver's Place Agent with Portscan and Envy",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
        cliExecute("terminal educate portscan");
      },
      completed: () => get("_speakeasyFreeFights", 0) >= 1,
      do: $location`An Unusually Quiet Barroom Brawl`,
      combat: new CombatStrategy().macro(
        Macro.if_($monster`Government agent`, Macro.trySkill($skill`Feel Envy`))
          .trySkill($skill`Portscan`)
          .default(),
      ),
      outfit: () => ({
        ...baseOutfit(),
        familiar: $familiar`Shorter-Order Cook`,
        famequip: $item`toy Cupid bow`,
      }),
      post: () => sendAutumnaton(),
      limit: { tries: 1 },
    },
    {
      name: "Oliver's Place Agent with Portscan",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
        cliExecute("terminal educate portscan");
      },
      completed: () => get("_speakeasyFreeFights", 0) >= 2,
      do: $location`An Unusually Quiet Barroom Brawl`,
      combat: new CombatStrategy().macro(
        Macro.if_(
          $monster`Government agent`,
          Macro.externalIf(!have($item`government cheese`), Macro.trySkill($skill`Feel Envy`)),
        )
          .trySkill($skill`Portscan`)
          .default(),
      ),
      outfit: () => ({
        ...baseOutfit(),
        familiar: $familiar`Shorter-Order Cook`,
        famequip: $item`toy Cupid bow`,
      }),
      post: () => sendAutumnaton(),
      limit: { tries: 1 },
    },
    {
      name: "Oliver's Place Agent",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
        cliExecute("terminal educate portscan");
      },
      completed: () => get("_speakeasyFreeFights", 0) >= 3,
      do: $location`An Unusually Quiet Barroom Brawl`,
      post: () => {
        sendAutumnaton();
      },
      combat: new CombatStrategy().macro(
        Macro.if_(
          $monster`Government agent`,
          Macro.externalIf(!have($item`government cheese`), Macro.trySkill($skill`Feel Envy`)),
        ).default(),
      ),
      outfit: () => ({
        ...baseOutfit(),
        familiar: $familiar`Shorter-Order Cook`,
        famequip: $item`toy Cupid bow`,
      }),
      limit: { tries: 1 },
    },
    {
      name: "Oliver's Place Peridot",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
        if (get("parkaMode") !== "dilophosaur") cliExecute("parka dilophosaur");
        PeridotOfPeril.setChoice($monster`goblin flapper`);
      },
      completed: () => have($effect`Everything Looks Yellow`),
      post: (): void => {
        set("_CSParkaYRUsed", true);
        sendAutumnaton();
        equip($slot`familiar`, $item`blue plate`);
      },
      do: $location`An Unusually Quiet Barroom Brawl`,
      combat: new CombatStrategy().macro(Macro.skill($skill`Spit jurassic acid`).abort()),
      outfit: () => ({
        ...baseOutfit(),
        shirt: $item`Jurassic Parka`,
        offhand: $item`latte lovers member's mug`,
        acc3: $item`Peridot of Peril`,
        familiar: $familiar`Shorter-Order Cook`,
        famequip: $item`toy Cupid bow`,
      }),
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
