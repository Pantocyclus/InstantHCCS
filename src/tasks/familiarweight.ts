import { CombatStrategy } from "grimoire-kolmafia";
import {
  buy,
  cliExecute,
  eat,
  familiarWeight,
  getFuel,
  haveEffect,
  itemAmount,
  myDaycount,
  myFamiliar,
  toInt,
  use,
  useSkill,
  visitUrl,
  weightAdjustment,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  CommunityService,
  ensureEffect,
  get,
  getKramcoWandererChance,
  have,
  set,
} from "libram";
import { fillTo } from "libram/dist/resources/2017/AsdonMartin";
import Macro from "../combat";
import { Quest } from "../engine/task";
import { burnLibram, logTestSetup } from "../lib";
import { meteorShowerTask } from "./common";
import { baseOutfit } from "../engine/outfit";

const famWtEffects = [
  $effect`Billiards Belligerence`,
  $effect`Blood Bond`,
  $effect`Do I Know You From Somewhere?`,
  $effect`Empathy`,
  $effect`Leash of Linguini`,
  $effect`Puzzle Champ`,
  $effect`Robot Friends`,
  $effect`Shortly Stacked`,
  $effect`You Can Really Taste the Dormouse`,
];

export const FamiliarWeightQuest: Quest = {
  name: "Familiar Weight",
  completed: () => CommunityService.FamiliarWeight.isDone(),
  tasks: [
    {
      name: "Anticheese",
      completed: () => get("lastAnticheeseDay") >= 1 || myDaycount() > 1,
      do: () => visitUrl("place.php?whichplace=desertbeach&action=db_nukehouse"),
      limit: { tries: 1 },
    },
    {
      name: "DRINK ME",
      completed: () => get("_lookingGlass"),
      do: () => visitUrl("clan_viplounge.php?action=lookingglass&whichfloor=2"),
      limit: { tries: 1 },
    },
    {
      name: "Underground Fireworks Shop",
      prepare: () => visitUrl("clan_viplounge.php?action=fwshop&whichfloor=2", false),
      completed: () => have($item`sombrero-mounted sparkler`),
      do: (): void => {
        if (!have($item`sombrero-mounted sparkler`)) buy(1, $item`sombrero-mounted sparkler`);
      },
      outfit: baseOutfit,
      limit: { tries: 1 },
    },
    {
      name: "Thoughtful Empathy",
      completed: () => have($effect`Thoughtful Empathy`),
      do: () => useSkill($skill`Empathy of the Newt`),
      outfit: { offhand: $item`April Shower Thoughts shield` },
      limit: { tries: 1 },
    },
    {
      name: "Sausage Goblin",
      completed: () =>
        get("_sausageFights") > 2 || (myDaycount() > 1 && getKramcoWandererChance() < 1.0),
      ready: () => getKramcoWandererChance() >= 1.0,
      do: $location`The Neverending Party`,
      choices: { 1322: 2 },
      combat: new CombatStrategy().macro(
        Macro.ifHolidayWanderer(Macro.skill($skill`Reflex Hammer`).abort())
          .if_($monster`sausage goblin`, Macro.default())
          .abort(),
      ),
      outfit: () => ({
        ...baseOutfit(),
        offhand: $item`Kramco Sausage-o-Matic™`,
        acc1: $item`Kremlin's Greatest Briefcase`,
        acc3: $item`Lil' Doctor™ bag`,
        familiar: $familiar`Galloping Grill`,
        famequip: $item`tiny stillsuit`,
      }),
      limit: { tries: 2 },
      post: (): void => {
        eat(
          itemAmount($item`magical sausage`) + itemAmount($item`magical sausage casing`),
          $item`magical sausage`,
        );
        burnLibram(300);
      },
    },
    {
      name: "Fill Asdon Before Tuning Moon",
      completed: () => getFuel() >= 37,
      do: (): void => {
        if (have($effect`Driving Stealthily`)) cliExecute("shrug driving stealthily");
        fillTo(187);
      },
    },
    {
      name: "Buffs",
      completed: () => famWtEffects.every((ef) => have(ef)),
      do: (): void => {
        if (have($item`green candy heart`)) ensureEffect($effect`Heart of Green`);
        if (have($item`love song of icy revenge`))
          use(
            Math.min(
              4 - Math.floor(haveEffect($effect`Cold Hearted`) / 5),
              itemAmount($item`love song of icy revenge`),
            ),
            $item`love song of icy revenge`,
          );
        if (have($item`resolution: be kinder`)) ensureEffect($effect`Kindly Resolve`);
      },
      effects: famWtEffects,
      limit: { tries: 1 },
    },
    {
      name: "Set Gingerbread Clock",
      completed: () => get("_gingerbreadCityTurns") > 0,
      do: $location`Gingerbread Civic Center`,
      outfit: () => ({
        ...baseOutfit(),
        offhand: $item`familiar scrapbook`,
        acc1: $item`Kremlin's Greatest Briefcase`,
        acc3: $item`Lil' Doctor™ bag`,
        familiar:
          itemAmount($item`sprinkles`) >= 50
            ? $familiar`Pair of Stomping Boots`
            : $familiar`Chocolate Lab`,
        famequip: $item`tiny stillsuit`,
      }),
      choices: { 1215: 1 },
      limit: { tries: 1 },
    },
    {
      name: "Gingerbread Earn Sprinkles",
      prepare: () => {
        if (getFuel() < 187 && !get("_missileLauncherUsed")) fillTo(187);
      },
      completed: () =>
        itemAmount($item`sprinkles`) >= 50 ||
        get("_gingerbreadCityTurns") >= 4 ||
        have($item`gingerbread spice latte`) ||
        have($effect`Whole Latte Love`) ||
        get("_missileLauncherUsed") ||
        get("_banderRunaways") >= (familiarWeight(myFamiliar()) + weightAdjustment()) / 5,
      do: $location`Gingerbread Upscale Retail District`,
      outfit: () => ({
        familiar: $familiar`Chocolate Lab`,
        modifier: "familiar weight",
      }),
      combat: new CombatStrategy().macro(
        Macro.externalIf(
          itemAmount($item`sprinkles`) < 50 && !get("_missileLauncherUsed"),
          Macro.trySkill($skill`Asdon Martin: Missile Launcher`).abort(),
        ).abort(),
      ),
      limit: { tries: 3 },
    },
    {
      name: "Gingerbread Get Latte",
      prepare: () => {
        if (getFuel() < 87 && !get("_missileLauncherUsed")) fillTo(87);
      },
      ready: () =>
        itemAmount($item`sprinkles`) >= 50 &&
        get("_banderRunaways") < (familiarWeight(myFamiliar()) + weightAdjustment()) / 5,
      completed: () =>
        get("_gingerbreadCityTurns") >= 5 ||
        have($item`gingerbread spice latte`) ||
        have($effect`Whole Latte Love`),
      do: $location`Gingerbread Upscale Retail District`,
      outfit: () => ({
        familiar: $familiar`Pair of Stomping Boots`,
        modifier: "familiar weight",
      }),
      combat: new CombatStrategy().macro(Macro.runaway()),
      choices: {
        1208: 3,
      },
      post: (): void => {
        if (have($item`gingerbread spice latte`)) {
          ensureEffect($effect`Whole Latte Love`);
          set("_gingerbreadCityNoonCompleted", true);
          cliExecute("spoon platypus");
        }
      },
      limit: { tries: 3 },
    },
    // {
    //   name: "Get Shaving Buff",
    //   completed: () => get("_chestXRayUsed") >= 3 || have($effect`Toiletbrush Moustache`),
    //   do: $location`The Dire Warren`,
    //   combat: new CombatStrategy().macro(Macro.trySkill($skill`Chest X-Ray`).abort()),
    //   outfit: () => ({
    //     ...baseOutfit(),
    //     offhand: $item`familiar scrapbook`,
    //     acc1: $item`Kremlin's Greatest Briefcase`,
    //     acc3: $item`Lil' Doctor™ bag`,
    //   }),
    //   limit: { tries: 1 },
    // },
    { ...meteorShowerTask },
    {
      name: "Feed Chameleon",
      completed: () => get("commaFamiliar") === $familiar`Homemade Robot`,
      do: (): void => {
        visitUrl(
          `inv_equip.php?which=2&action=equip&whichitem=${toInt($item`homemade robot gear`)}&pwd`,
        );
        visitUrl("charpane.php");
      },
      outfit: { familiar: $familiar`Comma Chameleon` },
    },
    {
      name: "Test",
      completed: () => CommunityService.FamiliarWeight.isDone(),
      do: () =>
        CommunityService.FamiliarWeight.run(() => logTestSetup(CommunityService.FamiliarWeight), 1),
      outfit: { modifier: "familiar weight", familiar: $familiar`Comma Chameleon` },
      limit: { tries: 1 },
    },
  ],
};
