import { CombatStrategy } from "grimoire-kolmafia";
import {
  cliExecute,
  create,
  drink,
  eat,
  equip,
  familiarWeight,
  getFuel,
  getMonsters,
  inebrietyLimit,
  Item,
  itemAmount,
  itemDropsArray,
  Location,
  mallPrice,
  myFamiliar,
  myInebriety,
  myLevel,
  numericModifier,
  restoreMp,
  runChoice,
  setLocation,
  totalFreeRests,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
  weightAdjustment,
} from "kolmafia";
import {
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  $stat,
  clamp,
  ClosedCircuitPayphone,
  CombatLoversLocket,
  get,
  getKramcoWandererChance,
  have,
  set,
  sum,
  TunnelOfLove,
  uneffect,
  Witchess,
  withChoice,
} from "libram";
import { fillTo } from "libram/dist/resources/2017/AsdonMartin";
import Macro, { mainStat } from "../combat";
import { Quest } from "../engine/task";
import { burnLibram } from "../lib";
import { innerElfTask } from "./common";
import { mapMonster } from "libram/dist/resources/2020/Cartography";
import { baseOutfit } from "../engine/outfit";

function sendAutumnaton(): void {
  if (have($item`autumn-aton`)) cliExecute("autumnaton send Shadow Rift");
}

let _bestShadowRift: Location | null = null;
export function bestShadowRift(): Location {
  if (!_bestShadowRift) {
    _bestShadowRift = ClosedCircuitPayphone.chooseRift({
      canAdventure: true,
      sortBy: (l: Location) => {
        setLocation(l);
        // We probably aren't capping item drops with the penalty
        // so we don't really need to compute the actual outfit (or the dropModifier for that matter actually)
        const dropModifier = 1 + numericModifier("Item Drop") / 100;
        return sum(getMonsters(l), (m) => {
          return sum(
            itemDropsArray(m),
            ({ drop, rate }) => mallPrice(drop) * clamp((rate * dropModifier) / 100, 0, 1),
          );
        });
      },
    });
    if (!_bestShadowRift) {
      throw new Error("Failed to find a suitable Shadow Rift to adventure in");
    }
  }
  // Mafia bug disallows adv1($location`Shadow Rift (<exact location>)`, -1, "") when overdrunk
  return myInebriety() > inebrietyLimit() ? $location`Shadow Rift` : _bestShadowRift;
}

const lovEquipment: "LOV Eardigan" | "LOV Epaulettes" | "LOV Earring" =
  mainStat === $stat`Muscle`
    ? "LOV Eardigan"
    : mainStat === $stat`Mysticality`
      ? "LOV Epaulettes"
      : "LOV Earring";

export const LevelingQuest: Quest = {
  name: "Leveling",
  completed: () => get("csServicesPerformed").split(",").length > 1,
  tasks: [
    {
      name: "Free Rests (Restore Cinch)",
      ready: () => get("_cinchUsed") >= 30,
      completed: () => get("timesRested") >= totalFreeRests(),
      do: () => visitUrl("place.php?whichplace=chateau&action=chateau_restbox"),
      limit: { tries: 30 },
    },
    {
      name: "Pilsners",
      ready: () => myLevel() >= 11,
      prepare: (): void => {
        if (have($item`astral six-pack`)) use($item`astral six-pack`);
        uneffect($effect`Aloysius' Antiphon of Aptitude`);
      },
      completed: () => myInebriety() >= 4,
      do: () => drink(4 - myInebriety(), $item`astral pilsner`),
      effects: $effects`Ode to Booze`,
      post: () => uneffect($effect`Ode to Booze`),
      limit: { tries: 1 },
    },
    { ...innerElfTask },
    {
      name: "Get Rufus Quest",
      completed: () => get("_shadowAffinityToday") || !have($item`closed-circuit pay phone`),
      do: () => ClosedCircuitPayphone.chooseQuest(() => 2),
      limit: { tries: 1 },
    },
    {
      name: "Shadow Rift",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
        if (get("parkaMode") !== "spikolodon") cliExecute("parka spikolodon");
        restoreMp(50);
      },
      completed: () =>
        have($item`Rufus's shadow lodestone`) ||
        (!have($effect`Shadow Affinity`) && get("encountersUntilSRChoice") !== 0),
      do: bestShadowRift(),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Giant Growth`)
          .if_($item`blue rocket`, Macro.item($item`blue rocket`))
          .default(),
      ),
      outfit: () => ({
        ...baseOutfit(),
        familiar: $familiar`Shorter-Order Cook`,
        famequip: $item`tiny stillsuit`,
      }),
      post: (): void => {
        if (have(ClosedCircuitPayphone.rufusTarget() as Item)) {
          withChoice(1498, 1, () => use($item`closed-circuit pay phone`));
        }
        sendAutumnaton();
      },
      limit: { tries: 12 },
    },
    {
      name: "Snojo for Newspaper",
      prepare: (): void => {
        if (get("snojoSetting") === null) {
          visitUrl("place.php?whichplace=snojo&action=snojo_controller");
          runChoice(1);
        }
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
        if (get("parkaMode") !== "spikolodon") cliExecute("parka spikolodon");
      },
      completed: () =>
        have($item`burning newspaper`) ||
        have($item`burning paper crane`) ||
        get("_snojoFreeFights") >= 5,
      do: $location`The X-32-F Combat Training Snowman`,
      combat: new CombatStrategy().macro(Macro.default()),
      outfit: () => ({
        ...baseOutfit(),
        familiar: $familiar`Garbage Fire`,
        famequip: $item`tiny stillsuit`,
      }),
      post: (): void => {
        if (have($item`burning newspaper`)) cliExecute("create burning paper crane");
        sendAutumnaton();
      },
      limit: { tries: 5 },
    },
    {
      name: "Snojo for Spit Upon",
      prepare: (): void => {
        if (get("snojoSetting") === null) {
          visitUrl("place.php?whichplace=snojo&action=snojo_controller");
          runChoice(1);
        }
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
        if (get("parkaMode") !== "spikolodon") cliExecute("parka spikolodon");
      },
      completed: () => get("_snojoFreeFights") >= 9,
      do: $location`The X-32-F Combat Training Snowman`,
      post: (): void => {
        if (get("_snojoFreeFights") >= 9) cliExecute("hottub"); // Clean -stat effects
        sendAutumnaton();
      },
      combat: new CombatStrategy().macro(Macro.default()),
      outfit: baseOutfit,
      limit: { tries: 5 },
    },
    {
      name: "LOV Tunnel",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
      },
      completed: () => get("_loveTunnelUsed"),
      do: () =>
        TunnelOfLove.fightAll(lovEquipment, "Open Heart Surgery", "LOV Extraterrestrial Chocolate"),
      combat: new CombatStrategy().macro(
        Macro.if_($monster`LOV Enforcer`, Macro.attack().repeat())
          .if_($monster`LOV Engineer`, Macro.skill($skill`Toynado`).repeat())
          .if_($monster`LOV Equivocator`, Macro.default()),
      ),
      outfit: () => ({
        ...baseOutfit(),
        weapon: $item`June cleaver`,
        shirt: $item`makeshift garbage shirt`,
      }),
      acquire: [{ item: $item`makeshift garbage shirt` }],
      limit: { tries: 1 },
      post: (): void => {
        use(1, $item`LOV Elixir #3`);
        sendAutumnaton();
      },
    },
    {
      name: "Eldritch Tentacle",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
      },
      completed: () => get("_eldritchHorrorEvoked"),
      do: () => useSkill($skill`Evoke Eldritch Horror`),
      post: (): void => {
        if (have($effect`Beaten Up`)) cliExecute("hottub");
        sendAutumnaton();
      },
      combat: new CombatStrategy().macro(Macro.default()),
      outfit: () => ({
        ...baseOutfit(),
        shirt: $item`makeshift garbage shirt`,
      }),
      acquire: [{ item: $item`makeshift garbage shirt` }],
      limit: { tries: 1 },
    },
    {
      name: "Witchess Knight",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
      },
      completed: () => get("_witchessFights") >= 3,
      do: () => Witchess.fightPiece($monster`Witchess Knight`),
      combat: new CombatStrategy().macro(Macro.default()),
      outfit: () => ({
        ...baseOutfit(),
        shirt: $item`makeshift garbage shirt`,
      }),
      acquire: [{ item: $item`makeshift garbage shirt` }],
      post: () => sendAutumnaton(),
      limit: { tries: 3 },
    },
    {
      name: "Reminisce Knight",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
      },
      completed: () =>
        mainStat === $stat`Moxie` ||
        CombatLoversLocket.monstersReminisced().includes($monster`Witchess Knight`),
      do: () => CombatLoversLocket.reminisce($monster`Witchess Knight`),
      combat: new CombatStrategy().macro(Macro.default()),
      outfit: () => ({
        ...baseOutfit(),
        shirt: $item`makeshift garbage shirt`,
      }),
      acquire: [{ item: $item`makeshift garbage shirt` }],
      post: () => sendAutumnaton(),
      limit: { tries: 1 },
    },
    {
      name: "Witchess King",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
      },
      completed: () => have($item`dented scepter`),
      do: () => Witchess.fightPiece($monster`Witchess King`),
      combat: new CombatStrategy().macro(Macro.delevel().attack().repeat()),
      outfit: () => ({
        ...baseOutfit(),
        weapon: $item`Fourth of May Cosplay Saber`,
        shirt: $item`makeshift garbage shirt`,
      }),
      acquire: [{ item: $item`makeshift garbage shirt` }],
      post: () => sendAutumnaton(),
      limit: { tries: 1 },
    },
    {
      name: "Witchess Witch",
      completed: () => have($item`battle broom`),
      do: () => Witchess.fightPiece($monster`Witchess Witch`),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Curse of Weaksauce`)
          .attack()
          .repeat(),
      ),
      outfit: () => ({
        ...baseOutfit(),
        weapon: $item`Fourth of May Cosplay Saber`,
        offhand: $item`dented scepter`,
        shirt: $item`makeshift garbage shirt`,
        familiar: $familiar`Shorter-Order Cook`,
        famequip: $item`tiny stillsuit`,
      }),
      acquire: [{ item: $item`makeshift garbage shirt` }],
      post: () => sendAutumnaton(),
      limit: { tries: 1 },
    },
    {
      name: "God Lobster",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
      },
      completed: () => get("_godLobsterFights") >= 3,
      do: () => visitUrl("main.php?fightgodlobster=1"),
      combat: new CombatStrategy().macro(Macro.default()),
      choices: { 1310: have($item`God Lobster's Ring`) ? 2 : 3 }, // Get -combat on last fight
      outfit: () => ({
        ...baseOutfit(),
        shirt: $item`makeshift garbage shirt`,
        famequip: $items`God Lobster's Ring, God Lobster's Scepter, none`,
        familiar: $familiar`God Lobster`,
      }),
      acquire: [{ item: $item`makeshift garbage shirt` }],
      post: () => sendAutumnaton(),
      limit: { tries: 3 },
    },
    {
      name: "Neverending Party",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
      },
      completed: () => get("_neverendingPartyFreeTurns") >= 10,
      do: $location`The Neverending Party`,
      choices: {
        1322: 2,
        1324: 5,
      },
      combat: new CombatStrategy().macro(Macro.trySkill($skill`Bowl Sideways`).default()),
      outfit: () => ({
        ...baseOutfit(),
        shirt: $item`makeshift garbage shirt`,
      }),
      acquire: [{ item: $item`makeshift garbage shirt` }],
      post: () => sendAutumnaton(),
      limit: { tries: 11 },
    },

    {
      name: "Retrieve Bowling Ball",
      completed: () =>
        (have($item`cosmic bowling ball`) && get("latteUnlocks").includes("carrot")) ||
        get("_banderRunaways") >= 10 ||
        get("_banderRunaways") >= (familiarWeight(myFamiliar()) + weightAdjustment()) / 5 ||
        get("_feelPrideUsed") > 0,
      do: $location`The Dire Warren`,
      combat: new CombatStrategy().macro(Macro.runaway()),
      outfit: () => ({
        ...baseOutfit(),
        offhand: $item`latte lovers member's mug`,
        familiar: $familiar`Pair of Stomping Boots`,
        famequip: $item`tiny stillsuit`,
        modifier: "familiar weight",
      }),
      post: () => sendAutumnaton(),
      limit: { tries: 10 },
    },
    {
      name: "Free Kills",
      completed: () => get("_shatteringPunchUsed") >= 3 && get("_missileLauncherUsed"),
      prepare: (): void => {
        if (have($effect`Spit Upon`)) {
          useFamiliar($familiar`Galloping Grill`);
          equip($item`tiny stillsuit`);
        }
        if (getFuel() < 100 && !get("_missileLauncherUsed")) fillTo(100);
      },
      do: $location`Uncle Gator's Country Fun-Time Liquid Waste Sluice`,
      outfit: () => ({
        ...baseOutfit(),
        shirt: $item`makeshift garbage shirt`,
      }),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Feel Pride`)
          .trySkill($skill`Cincho: Confetti Extravaganza`)
          .trySkill($skill`Bowl Sideways`)
          .trySkill($skill`%fn, spit on me!`)
          .trySkill($skill`Shattering Punch`)
          .trySkill($skill`Asdon Martin: Missile Launcher`)
          .abort(),
      ),
      acquire: [{ item: $item`makeshift garbage shirt` }],
      post: () => sendAutumnaton(),
      limit: { tries: 6 },
    },
    {
      name: "Sausage Goblin",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
        cliExecute("terminal educate portscan");
        if (have($effect`Spit Upon`)) {
          useFamiliar($familiar`Galloping Grill`);
          equip($item`tiny stillsuit`);
        }
      },
      completed: () => get("_sausageFights") > 1,
      ready: () => getKramcoWandererChance() >= 1.0,
      do: $location`The Neverending Party`,
      choices: { 1322: 2 },
      combat: new CombatStrategy().macro(
        Macro.if_(
          $monster`sausage goblin`,
          Macro.trySkill($skill`Portscan`)
            .trySkill($skill`%fn, spit on me!`)
            .default(),
        ).abort(),
      ),
      outfit: () => ({
        ...baseOutfit(),
        offhand: $item`Kramco Sausage-o-Matic™`,
        shirt: $item`makeshift garbage shirt`,
      }),
      acquire: [{ item: $item`makeshift garbage shirt` }],
      limit: { tries: 1 },
      post: (): void => {
        eat(
          itemAmount($item`magical sausage`) + itemAmount($item`magical sausage casing`),
          $item`magical sausage`,
        );
        sendAutumnaton();
      },
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
        Macro.trySkill($skill`Gulp Latte`)
          .if_($monster`Government agent`, Macro.trySkill($skill`Feel Envy`))
          .trySkill($skill`Portscan`)
          .default(),
      ),
      outfit: baseOutfit,
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
      combat: new CombatStrategy().macro(Macro.trySkill($skill`Portscan`).default()),
      outfit: baseOutfit,
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
      post: () => sendAutumnaton(),
      combat: new CombatStrategy().macro(Macro.default()),
      outfit: baseOutfit,
      limit: { tries: 1 },
    },
    {
      name: "Oliver's Place Map",
      ready: () => get("_monstersMapped") < 3,
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
        if (get("parkaMode") !== "dilophosaur") cliExecute("parka dilophosaur");
        if (have($effect`Spit Upon`)) equip($item`tiny stillsuit`);
      },
      completed: () => have($effect`Everything Looks Yellow`),
      post: (): void => {
        set("_CSParkaYRUsed", true);
        sendAutumnaton();
      },
      // eslint-disable-next-line libram/verify-constants
      do: () => mapMonster($location`An Unusually Quiet Barroom Brawl`, $monster`goblin flapper`),
      combat: new CombatStrategy().macro(Macro.skill($skill`Spit jurassic acid`).abort()),
      outfit: () => ({
        ...baseOutfit(),
        offhand: $item`latte lovers member's mug`,
      }),
    },
    {
      name: "DMT",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
        burnLibram(300, true);
      },
      completed: () => get("_machineTunnelsAdv") >= 5,
      do: $location`The Deep Machine Tunnels`,
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Gulp Latte`)
          .if_($monster`Government agent`, Macro.trySkill($skill`Feel Envy`).default())
          .default(),
      ),
      outfit: () => ({
        ...baseOutfit(),
        shirt: $item`makeshift garbage shirt`,
        offhand: $item`latte lovers member's mug`,
        familiar: $familiar`Machine Elf`,
        famequip: $item`tiny stillsuit`,
      }),
      acquire: [{ item: $item`makeshift garbage shirt` }],
      limit: { tries: 5 },
      post: (): void => {
        const lastIngredient = get("latteUnlocks").includes("carrot") ? "carrot" : "pumpkin";
        if (get("_latteRefillsUsed") < 3)
          cliExecute(`latte refill cinnamon vanilla ${lastIngredient}`);
        while (itemAmount($item`BRICKO brick`) >= 8 && have($item`BRICKO eye brick`))
          create($item`BRICKO oyster`);
        sendAutumnaton();
      },
    },
    {
      name: "Bricko Oyster",
      completed: () =>
        have($effect`Spit Upon`) || get("camelSpit") >= 100 || !have($item`BRICKO oyster`),
      do: () => $item`BRICKO oyster`,
      combat: new CombatStrategy().macro(Macro.default()),
      post: () => sendAutumnaton(),
      limit: { tries: 2 },
      outfit: baseOutfit,
    },
    {
      name: "Open wardrobe-o-matic", // Assume we won't be leveling any more, even in aftercore, for the rest of the day
      completed: () =>
        !have($item`wardrobe-o-matic`) ||
        $items`futuristic shirt, futuristic hat, futuristic collar`.some((it) => have(it)),
      do: () => use($item`wardrobe-o-matic`),
      limit: { tries: 1 },
    },
  ],
};
