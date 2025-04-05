import { CombatStrategy } from "grimoire-kolmafia";
import {
  adv1,
  autosell,
  buy,
  changeMcd,
  cliExecute,
  create,
  eat,
  Effect,
  getWorkshed,
  myClass,
  myLevel,
  myMaxmp,
  myMeat,
  myMp,
  mySoulsauce,
  restoreMp,
  retrieveItem,
  toInt,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
  wait,
} from "kolmafia";
import {
  $class,
  $coinmaster,
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  $skills,
  $stat,
  CombatLoversLocket,
  ensureEffect,
  get,
  have,
  set,
} from "libram";
import { fillTo } from "libram/dist/resources/2017/AsdonMartin";
import Macro, { mainStat } from "../combat";
import { Quest } from "../engine/task";
import { complexCandies, tryAcquiringEffect } from "../lib";
import { holidayRunawayTask } from "./common";
import { mapMonster } from "libram/dist/resources/2020/Cartography";
import { baseOutfit } from "../engine/outfit";

const statGainBuffs =
  mainStat === $stat`Muscle`
    ? [$effect`Muscle Unbound`]
    : mainStat === $stat`Mysticality`
      ? [$effect`Inscrutable Gaze`, $effect`Thaumodynamic`]
      : [$effect`So Fresh and So Clean`];

export const bloodSugarSauceMagic = $effect`[${
  myClass() === $class`Sauceror` ? "1458" : "1457"
}]Blood Sugar Sauce Magic`;
const combStatBuff =
  mainStat === $stat`Muscle`
    ? $effect`Lack of Body-Building`
    : mainStat === $stat`Mysticality`
      ? $effect`We're All Made of Starfish`
      : $effect`Pomp & Circumsands`;
const generalStorePotion =
  mainStat === $stat`Muscle`
    ? $effect`Go Get 'Em, Tiger!`
    : mainStat === $stat`Mysticality`
      ? $effect`Glittering Eyelashes`
      : $effect`Butt-Rock Hair`;
const barrelBuff =
  myClass() === $class`Seal Clubber`
    ? $effect`Barrel Chested`
    : myClass() === $class`Sauceror`
      ? $effect`Warlock, Warstock, and Warbarrel`
      : $effect.none;
const synthExpBuff =
  mainStat === $stat`Muscle`
    ? $effect`Synthesis: Movement`
    : mainStat === $stat`Mysticality`
      ? $effect`Synthesis: Learning`
      : $effect`Synthesis: Style`;
const juiceBarBuffs =
  myClass() === $class`Seal Clubber`
    ? [] //$effects`Over the Ocean`
    : myClass() === $class`Turtle Tamer`
      ? $effects`Newt Gets In Your Eyes, Baconstoned`
      : myClass() === $class`Pastamancer`
        ? $effects`Baconstoned, Ham-Fisted`
        : myClass() === $class`Sauceror`
          ? $effects`Comic Violence`
          : myClass() === $class`Disco Bandit`
            ? $effects`Gr8ness, Perspicacious Pressure, Crusty Head`
            : $effects`Proficient Pressure, Eau D'enmity`;
const showerGlobItem =
  mainStat === $stat`Muscle`
    ? $item`wet paper weights`
    : mainStat === $stat`Mysticality`
      ? $item`wet paperback`
      : $item`wet paper cup`;
const showerGlobBuff =
  mainStat === $stat`Muscle`
    ? $effect`Lifting Wets`
    : mainStat === $stat`Mysticality`
      ? $effect`Moisticality`
      : $effect`[2994]In Your Cups`;

const levelingBuffs = [
  // Skill
  $effect`A Few Extra Pounds`,
  $effect`Big`,
  $effect`Blessing of the Bird`,
  $effect`Blood Bond`,
  $effect`Blood Bubble`,
  $effect`Carol of the Bulls`,
  $effect`Carol of the Hells`,
  $effect`Carol of the Thrills`,
  $effect`Feeling Excited`,
  $effect`Feeling Peaceful`,
  $effect`Frenzied, Bloody`,
  $effect`Ruthlessly Efficient`,
  $effect`Song of Bravado`,
  // $effect`Triple-Sized`,
  // Class Skill
  $effect`Astral Shell`,
  $effect`Aloysius' Antiphon of Aptitude`,
  $effect`Elemental Saucesphere`,
  $effect`Empathy`,
  $effect`Ghostly Shell`,
  $effect`Inscrutable Gaze`,
  $effect`Leash of Linguini`,
  $effect`Patience of the Tortoise`,
  $effect`Rage of the Reindeer`,
  $effect`Reptilian Fortitude`,
  $effect`Saucemastery`,
  $effect`Stevedave's Shanty of Superiority`,
  bloodSugarSauceMagic,
  // ML
  $effect`Drescher's Annoying Noise`,
  $effect`Driving Recklessly`,
  $effect`Ur-Kel's Aria of Annoyance`,
  $effect`Pride of the Puffin`,
  // Beach Comb
  $effect`Do I Know You From Somewhere?`,
  $effect`Lack of Body-Building`,
  $effect`Resting Beach Face`,
  combStatBuff,
  $effect`You Learned Something Maybe!`,
  // Items
  generalStorePotion,
  barrelBuff,
  // Other
  $effect`Billiards Belligerence`,
  $effect`Broad-Spectrum Vaccine`,
  $effect`Favored by Lyle`,
  $effect`Grumpy and Ornery`,
  $effect`Starry-Eyed`,
  $effect`Total Protonic Reversal`,
  $effect`Uncucumbered`,
  // Prismatic Damage
  $effect`Frostbeard`,
  $effect`Intimidating Mien`,
  $effect`Pyromania`,
  $effect`Rotten Memories`,
  $effect`Takin' It Greasy`,
  $effect`Your Fifteen Minutes`,
  $effect`Bendin' Hell`,
  // Potions
  ...juiceBarBuffs,
].filter((e) => e);

export const PostCoilQuest: Quest = {
  name: "PostCoil",
  completed: () => get("csServicesPerformed").split(",").length > 1,
  tasks: [
    {
      name: "Mayday",
      completed: () => !have($item`MayDay™ supply package`),
      do: (): void => {
        use($item`MayDay™ supply package`);
        if (have($item`space blanket`)) autosell(1, $item`space blanket`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Install Workshed",
      completed: () => getWorkshed() === $item`Asdon Martin keyfob (on ring)`,
      do: (): void => {
        use($item`Asdon Martin keyfob (on ring)`);
        fillTo(37);
      },
      limit: { tries: 1 },
    },
    {
      name: "Chewing Gum",
      completed: () =>
        myMeat() < 1000 ||
        (have($item`turtle totem`) && have($item`saucepan`) && have($item`mariachi hat`)),
      do: (): void => {
        buy(1, $item`chewing gum on a string`);
        use(1, $item`chewing gum on a string`);
      },
      outfit: { pants: $item`designer sweatpants` },
      acquire: [{ item: $item`toy accordion` }],
      limit: { tries: 50 },
    },
    {
      name: "Meatcar",
      completed: () => have($item`bitchin' meatcar`),
      do: () => create(1, $item`bitchin' meatcar`),
      outfit: { pants: $item`designer sweatpants` },
      limit: { tries: 1 },
    },
    {
      name: "Range",
      completed: () => get("hasRange"),
      do: () => use($item`Dramatic™ range`),
      acquire: [{ item: $item`Dramatic™ range` }],
      outfit: { pants: $item`designer sweatpants` },
      limit: { tries: 1 },
    },
    {
      name: "Underground Fireworks Shop",
      prepare: () => visitUrl("clan_viplounge.php?action=fwshop&whichfloor=2", false),
      completed: () => have($item`blue rocket`) || have($effect`Everything Looks Blue`),
      do: (): void => {
        if (!have($item`blue rocket`)) buy(1, $item`blue rocket`);
      },
      outfit: { pants: $item`designer sweatpants` },
      limit: { tries: 1 },
    },
    {
      name: "Fortune Teller Consult",
      completed: () =>
        get("_clanFortuneConsultUses", 0) >= 3 || get("_InstantHCCSClanFortuneAttempts", 0) >= 3,
      do: (): void => {
        switch (get("_clanFortuneConsultsUses", 0)) {
          case 0:
            cliExecute("fortune cheesefax bad bad bad");
            break;
          case 1:
            cliExecute("fortune cheesefax bad bad bad");
            break;
          case 2:
            cliExecute("fortune cheesefax pizza batman thick");
            break;
          default:
            break;
        }
        wait(5);
        set("_InstantHCCSClanFortuneAttempts", 1 + get("_InstantHCCSClanFortuneAttempts", 0));
      },
      limit: { tries: 3 },
    },
    {
      name: "Detuned Radio",
      completed: () => have($item`detuned radio`),
      do: (): void => {
        buy(1, $item`detuned radio`);
        changeMcd(10);
      },
      outfit: baseOutfit,
      limit: { tries: 1 },
    },
    {
      name: "Cloud-Talk",
      completed: () => get("_campAwaySmileBuffs") >= 2,
      do: () => visitUrl("place.php?whichplace=campaway&action=campaway_sky"),
      limit: { tries: 3 },
    },
    {
      name: "Crimbo Candy",
      completed: () => get("_candySummons", 0) > 0,
      do: () => useSkill($skill`Summon Crimbo Candy`),
    },
    {
      name: "Get Moxie Complex Candies",
      completed: () =>
        mainStat !== $stat`Moxie` ||
        have(synthExpBuff) ||
        complexCandies.some((candy) => have(candy) && toInt(candy) % 5 === 4),
      do: (): void => {
        if (have($familiar`Stocking Mimic`)) {
          useFamiliar($familiar`Stocking Mimic`);
          adv1($location`The Dire Warren`, -1);
        } else {
          CombatLoversLocket.reminisce($monster`Hobelf`);
        }
      },
      combat: new CombatStrategy().macro(
        Macro.if_($monster`Hobelf`, Macro.skill($skill`Use the Force`))
          .trySkill($skill`Reflex Hammer`)
          .trySkill($skill`Feel Hatred`)
          .trySkill($skill`Snokebomb`)
          .abort(),
      ),
      choices: { 1387: 3 },
      outfit: () => ({
        ...baseOutfit(),
        weapon: $item`Fourth of May Cosplay Saber`,
        acc3: $item`Lil' Doctor™ bag`,
      }),
      limit: { tries: 1 },
    },
    // {
    //   name: "Synth Exp Buff",
    //   completed: () => have(synthExpBuff),
    //   do: (): void => getSynthExpBuff(),
    //   limit: { tries: 1 },
    // },
    {
      name: "Shower Glob Stat Gain Buff",
      completed: () => have(showerGlobBuff),
      do: () => {
        buy($coinmaster`Using your Shower Thoughts`, 1, showerGlobItem);
        use(showerGlobItem, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Remaining Stat Gain Multipliers",
      completed: () => statGainBuffs.every((ef) => have(ef)),
      do: () => statGainBuffs.forEach((ef) => ensureEffect(ef)),
      outfit: () => ({
        pants: $item`designer sweatpants`,
        acc1: $item`Powerful Glove`,
        famequip: $item`April Shower Thoughts shield`,
        modifier: "mp",
      }),
      limit: { tries: 1 },
    },
    {
      name: "Bastille",
      completed: () => get("_bastilleGames") > 0,
      do: () => cliExecute("bastille.ash mainstat brutalist"),
      outfit: { offhand: $item`familiar scrapbook` },
      limit: { tries: 1 },
    },
    {
      name: "Ten-Percent Bonus",
      completed: () => !have($item`a ten-percent bonus`),
      do: () => use($item`a ten-percent bonus`),
      outfit: { offhand: $item`familiar scrapbook` },
      limit: { tries: 1 },
    },
    {
      name: "Sept-ember Mouthwash",
      completed: () => get("availableSeptEmbers") === 0,
      prepare: (): void => {
        const usefulEffects: Effect[] = [
          $effect`Cold as Nice`, // +3 cold res from Beach Comb
          $effect`Scarysauce`, // +2 cold res
          $effect`Elemental Saucesphere`, // +2 cold res
          $effect`Feeling Peaceful`, // +2 cold res from Emotion Chip
          $effect`Astral Shell`, // +1 cold res
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));
      },
      do: (): void => {
        // Grab bembershoot
        visitUrl(`shop.php?whichshop=september&action=buyitem&quantity=1&whichrow=1516&pwd`);
        // Grab Mouthwashes
        visitUrl("shop.php?whichshop=september&action=buyitem&quantity=3&whichrow=1512&pwd");

        cliExecute("maximize cold res");
        use($item`Mmm-brr! brand mouthwash`, 3);
      },
      limit: { tries: 1 },
      outfit: {
        modifier: "cold res",
        familiar: $familiar`Exotic Parrot`,
      },
      post: (): void => {
        if (have($effect`Scarysauce`)) cliExecute("shrug scarysauce");
      },
    },
    {
      name: "Soul Food",
      ready: () => mySoulsauce() >= 5,
      completed: () => mySoulsauce() < 5 || myMp() > myMaxmp() - 15,
      do: (): void => {
        while (mySoulsauce() >= 5 && myMp() <= myMaxmp() - 15) useSkill($skill`Soul Food`);
      },
    },
    {
      name: "Buffs",
      prepare: () => fillTo(37),
      completed: () =>
        myMeat() <= 1000 || levelingBuffs.every((ef) => have(ef)) || get("_feelPrideUsed") > 0,
      do: () =>
        levelingBuffs.forEach((ef) => {
          if (myMeat() >= 1000) ensureEffect(ef);
          if (
            myMp() <= 100 &&
            (have($item`magical sausage`) || have($item`magical sausage casing`))
          )
            eat(1, $item`magical sausage`);
        }),
      outfit: {
        pants: $item`designer sweatpants`,
        acc1: $item`Powerful Glove`,
        famequip: $item`April Shower Thoughts shield`,
        modifier: "mp",
      },
    },
    {
      name: "Alice Army",
      completed: () => get("grimoire3Summons") > 0,
      do: () => useSkill($skill`Summon Alice's Army Cards`),
    },
    {
      name: "Confiscator's Grimoire",
      completed: () => get("_grimoireConfiscatorSummons") > 0,
      do: () => useSkill($skill`Summon Confiscated Things`),
    },
    {
      name: "Detective School",
      completed: () => get("_detectiveCasesCompleted", 0) >= 3,
      do: () => cliExecute("Detective Solver"),
    },
    {
      name: "Breakfast",
      completed: () => get("lastAnticheeseDay") > 0,
      do: (): void => {
        cliExecute("breakfast");
        cliExecute("refresh all");
      },
    },
    { ...holidayRunawayTask },
    {
      name: "Ninja Costume",
      ready: () => get("_monstersMapped") < 3 && get("_chestXRayUsed") < 3,
      completed: () => have($item`li'l ninja costume`),
      do: () => mapMonster($location`The Haiku Dungeon`, $monster`amateur ninja`),
      post: () => visitUrl("questlog.php?which=1"), // Check quest log for protonic ghost location
      combat: new CombatStrategy().macro(
        Macro.ifHolidayWanderer(Macro.skill($skill`Feel Hatred`).abort())
          .if_($monster`amateur ninja`, Macro.skill($skill`Chest X-Ray`))
          .abort(),
      ),
      outfit: () => ({
        ...baseOutfit(),
        back: $item`protonic accelerator pack`,
        acc1: $item`Lil' Doctor™ bag`,
      }),
      limit: { tries: 2 },
    },
    {
      name: "Nanobrainy",
      ready: () => get("ghostLocation") !== $location`none` && get("_nanorhinoCharge") >= 100,
      completed: () => have($effect`Nanobrainy`),
      do: () => adv1(get("ghostLocation", $location`none`), 0, ""),
      prepare: (): void => {
        if (get("parkaMode") !== "spikolodon") cliExecute("parka spikolodon");
      },
      combat: new CombatStrategy().macro(
        Macro.skill($skill`Entangling Noodles`) // Myst skill to trigger nanorhino buff
          .trySkill($skill`Giant Growth`)
          .if_($item`blue rocket`, Macro.item($item`blue rocket`))
          .skill($skill`Shoot Ghost`)
          .skill($skill`Shoot Ghost`)
          .skill($skill`Shoot Ghost`)
          .skill($skill`Trap Ghost`),
      ),
      outfit: () => ({
        ...baseOutfit(),
        back: $item`protonic accelerator pack`,
        familiar: $familiar`Nanorhino`,
        famequip: $item`tiny stillsuit`,
      }),
      limit: { tries: 2 },
    },
    {
      name: "Get Lime",
      completed: () => get("_preventScurvy"),
      prepare: () => restoreMp(50),
      do: () => useSkill($skill`Prevent Scurvy and Sobriety`),
    },
    {
      name: "Skeleton Fruits",
      ready: () => get("_monstersMapped") < 3 && get("_chestXRayUsed") < 3,
      prepare: (): void => {
        if (get("parkaMode") !== "spikolodon") cliExecute("parka spikolodon");
      },
      completed: () =>
        mainStat === $stat`Moxie` ||
        have($item`cherry`) ||
        have($item`oil of expertise`) ||
        have($effect`Expert Oiliness`),
      do: () => mapMonster($location`The Skeleton Store`, $monster`novelty tropical skeleton`),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Spit jurassic acid`)
          .skill($skill`Feel Envy`)
          .skill($skill`Chest X-Ray`),
      ),
      outfit: () => ({
        ...baseOutfit(),
        acc3: $item`Lil' Doctor™ bag`,
      }),
      limit: { tries: 1 },
    },
    {
      name: "Reminisce Evil Olive",
      prepare: (): void => {
        if (get("umbrellaState") !== "broken") cliExecute("umbrella ml");
      },
      completed: () =>
        mainStat !== $stat`Moxie` ||
        CombatLoversLocket.monstersReminisced().includes($monster`Evil Olive`),
      do: () => CombatLoversLocket.reminisce($monster`Evil Olive`),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Spit jurassic acid`)
          .skill($skill`Feel Envy`)
          .skill($skill`Chest X-Ray`),
      ),
      outfit: () => ({
        ...baseOutfit(),
        acc3: $item`Lil' Doctor™ bag`,
      }),
      limit: { tries: 1 },
    },
    {
      name: "Saucecraft",
      prepare: () => $skills`Advanced Saucecrafting`.forEach((s) => useSkill(s)),
      completed: () =>
        $effects`Stabilizing Oiliness, Expert Oiliness, Slippery Oiliness`.some((e) => have(e)),
      do: (): void => {
        if (mainStat === $stat`Muscle`) {
          $items`oil of stability, philter of phorce, cordial of concentration`.forEach((item) =>
            retrieveItem(item),
          );
          use(1, $item`oil of stability`);
          use(1, $item`philter of phorce`);
        } else if (mainStat === $stat`Mysticality`) {
          $items`oil of expertise, ointment of the occult, cordial of concentration`.forEach(
            (item) => retrieveItem(item),
          );
          use(1, $item`oil of expertise`);
          use(1, $item`ointment of the occult`);
        } else {
          $items`oil of slipperiness, serum of sarcasm`.forEach((item) => retrieveItem(item));
          use(1, $item`oil of slipperiness`);
          use(1, $item`serum of sarcasm`);
        }
      },
      limit: { tries: 1 },
    },
    /*
    {
      name: "Chateau",
      completed: () => get("timesRested") >= totalFreeRests(),
      do: (): void => {
        visitUrl("place.php?whichplace=chateau&action=chateau_restbox");
        burnLibram(100);
      },
      outfit: { offhand: $item`familiar scrapbook` },
      limit: { tries: 40 },
    },
    */
    {
      name: "Thoughtful Empathy",
      completed: () => have($effect`Thoughtful Empathy`),
      do: () => useSkill($skill`Empathy of the Newt`),
      outfit: { famequip: $item`April Shower Thoughts shield` },
      limit: { tries: 1 },
    },
    {
      name: "Mini-Sauceror Buff",
      ready: () =>
        myLevel() >= 15 &&
        have($familiar`Mini-Adventurer`) &&
        (myClass() === $class`Seal Clubber` || myClass() === $class`Pastamancer`),
      completed: () =>
        $effects`Elbow Sauce, Saucefingers`.some((e) => have(e)) ||
        !(myClass() === $class`Seal Clubber` || myClass() === $class`Pastamancer`),
      do: $location`The Dire Warren`,
      outfit: () => ({
        ...baseOutfit(),
        acc3: $item`Lil' Doctor™ bag`,
        familiar: $familiar`Mini-Adventurer`,
        famequip: $item`tiny stillsuit`,
      }),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Reflex Hammer`)
          .trySkill($skill`Feel Hatred`)
          .trySkill($skill`Snokebomb`)
          .abort(),
      ),
      choices: { [768]: 4 },
      limit: { tries: 2 },
    },
  ],
};
