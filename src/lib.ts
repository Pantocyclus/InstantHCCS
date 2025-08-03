import {
  cliExecute,
  Effect,
  equip,
  equippedItem,
  getCampground,
  haveEffect,
  haveEquipped,
  holiday,
  Item,
  itemAmount,
  mpCost,
  myBasestat,
  myBuffedstat,
  myMaxhp,
  myMaxmp,
  myMp,
  print,
  restoreMp,
  retrieveItem,
  retrievePrice,
  Skill,
  sweetSynthesis,
  toInt,
  toItem,
  toSkill,
  toStat,
  totalFreeRests,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $effects,
  $item,
  $items,
  $skill,
  $slot,
  $stat,
  CommunityService,
  get,
  have,
  set,
  unequip,
  Witchess,
} from "libram";
import { printModtrace } from "libram/dist/modifier";
import { mainStat } from "./combat";

export const testModifiers = new Map([
  [CommunityService.HP, ["Maximum HP", "Maximum HP Percent", "Muscle", "Muscle Percent"]],
  [CommunityService.Muscle, ["Muscle", "Muscle Percent"]],
  [CommunityService.Mysticality, ["Mysticality", "Mysticality Percent"]],
  [CommunityService.Moxie, ["Moxie", "Moxie Percent"]],
  [CommunityService.FamiliarWeight, ["Familiar Weight"]],
  [CommunityService.WeaponDamage, ["Weapon Damage", "Weapon Damage Percent"]],
  [CommunityService.SpellDamage, ["Spell Damage", "Spell Damage Percent"]],
  [CommunityService.Noncombat, ["Combat Rate"]],
  [CommunityService.BoozeDrop, ["Item Drop", "Booze Drop"]],
  [CommunityService.HotRes, ["Hot Resistance"]],
  [CommunityService.CoilWire, []],
]);

// From phccs
export function convertMilliseconds(milliseconds: number): string {
  const seconds = milliseconds / 1000;
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = Math.round((seconds - minutes * 60) * 1000) / 1000;
  const hours = Math.floor(minutes / 60);
  const minutesLeft = Math.round(minutes - hours * 60);
  return (
    (hours !== 0 ? `${hours} hours, ` : "") +
    (minutesLeft !== 0 ? `${minutesLeft} minutes, ` : "") +
    (secondsLeft !== 0 ? `${secondsLeft} seconds` : "")
  );
}

export const crimboCarols = $effects`Do You Crush What I Crush?, Holiday Yoked, Let It Snow/Boil/Stink/Frighten/Grease, All I Want For Crimbo Is Stuff, Crimbo Wrapping`;

function logRelevantStats(whichTest: CommunityService): void {
  if (
    [CommunityService.Muscle, CommunityService.Mysticality, CommunityService.Moxie].includes(
      whichTest,
    )
  ) {
    const testStat = toStat(whichTest.statName);
    const statString = testStat.toString().slice(0, 3);
    print(
      `Base ${statString}: ${myBasestat(testStat)}; Buffed ${statString}: ${myBuffedstat(testStat)}`,
    );
  } else if (whichTest === CommunityService.HP) {
    print(`Buffed Mus: ${myBuffedstat($stat`Muscle`)}; HP: ${myMaxhp()};`);
  }
}

export function logTestSetup(whichTest: CommunityService): void {
  const testTurns = whichTest.actualCost();
  printModtrace(testModifiers.get(whichTest) ?? []);
  logRelevantStats(whichTest);
  print(
    `${whichTest.statName} Test takes ${testTurns} adventure${
      testTurns === 1 ? "" : "s"
    } (predicted: ${whichTest.prediction}).`,
    "blue",
  );
  set(`_CSTest${whichTest.id}`, testTurns);
}

/*
function mystSynthAttainable(): boolean {
  if (
    (have($item`yellow candy heart`) && have($item`Crimbo peppermint bark`)) ||
    (have($item`orange candy heart`) &&
      (have($item`Crimbo candied pecan`) || have($item`peppermint sprout`))) ||
    (have($item`pink candy heart`) &&
      (have($item`peppermint sprout`) || have($item`peppermint twist`))) ||
    (have($item`lavender candy heart`) && have($item`Crimbo fudge`))
  )
    return true;
  return false;
}
*/

function chooseLibram(): Skill {
  const needLoveSong =
    itemAmount($item`love song of icy revenge`) +
      Math.floor(haveEffect($effect`Cold Hearted`) / 5) <
    4;

  if (needLoveSong) {
    return $skill`Summon Love Song`;
  } else if (!have($item`green candy heart`) && !have($effect`Heart of Green`)) {
    return $skill`Summon Candy Heart`;
  }

  return $skill`Summon Taffy`;
}

export function burnLibram(saveMp: number): void {
  while (myMp() >= mpCost(chooseLibram()) + saveMp) {
    useSkill(chooseLibram());
  }
}

export const complexCandies = $items``.filter((candy) => candy.candyType === "complex");
const peppermintCandiesCosts = new Map<Item, number>([
  [$item`peppermint sprout`, 1],
  [$item`peppermint twist`, 1],
  [$item`peppermint patty`, 2],
  [$item`peppermint crook`, 3],
  [$item`cane-mail pants`, 10],
  [$item`peppermint rhino baby`, 11],
  [$item`cane-mail shirt`, 15],
]);
const nonPeppermintCandies = complexCandies.filter(
  (candy) => !Array.from(peppermintCandiesCosts.keys()).includes(candy),
);

function haveCandies(a: Item, b: Item): boolean {
  const candiesRequired = new Map<Item, number>();
  [a, b].forEach((candy) => {
    const currentAmount = candiesRequired.get(candy) ?? 0;
    if (nonPeppermintCandies.includes(candy)) candiesRequired.set(candy, currentAmount + 1);
    else
      candiesRequired.set(
        $item`peppermint sprout`,
        currentAmount + (peppermintCandiesCosts.get(candy) ?? Infinity),
      );
  });

  candiesRequired.forEach((amount, candy) => {
    candiesRequired.set(candy, itemAmount(candy) >= amount ? 1 : 0);
  });

  return Array.from(candiesRequired.values()).every((val) => val === 1);
}

export function getSynthExpBuff(): void {
  const rem = mainStat === $stat`Muscle` ? 2 : mainStat === $stat`Mysticality` ? 3 : 4;
  const pairs = complexCandies
    .map((a) => complexCandies.map((b) => [a, b]))
    .reduce((acc, val) => acc.concat(val), []);
  const bestPair = pairs
    .filter(([a, b]) => (toInt(a) + toInt(b)) % 5 === rem && haveCandies(a, b))
    .reduce((left, right) =>
      left.map((it) => retrievePrice(it)).reduce((acc, val) => acc + val) <
      right.map((it) => retrievePrice(it)).reduce((acc, val) => acc + val)
        ? left
        : right,
    );
  if (bestPair[0] === bestPair[1]) retrieveItem(bestPair[0], 2);
  else bestPair.forEach((it) => retrieveItem(it));
  sweetSynthesis(bestPair[0], bestPair[1]);
}

export function sendAutumnaton(): void {
  cliExecute("autumnaton send The Sleazy Back Alley");
}

const improvedShowerSkills = new Map([
  [$effect`Slippery as a Seal`, $skill`Seal Clubbing Frenzy`],
  [$effect`Strength of the Tortoise`, $skill`Patience of the Tortoise`],
  [$effect`Thoughtful Empathy`, $skill`Empathy of the Newt`],
  [$effect`Tubes of Universal Meat`, $skill`Manicotti Meditation`],
  [$effect`Leash of Linguini`, $skill`Leash of Linguini`],
  [$effect`Lubricating Sauce`, $skill`Sauce Contemplation`],
  [$effect`Simmering`, $skill`Simmer`],
  [$effect`Disco over Matter`, $skill`Disco Aerobics`],
  [$effect`Mariachi Moisture`, $skill`Moxie of the Mariachi`],
]);

export function tryAcquiringEffect(ef: Effect, tryRegardless = false): void {
  // Try acquiring an effect
  if (have(ef)) return; // If we already have the effect, we're done

  if (ef === $effect`Sparkling Consciousness`) {
    // This has no ef.default for some reason
    if (holiday() === "Dependence Day" && !get("_fireworkUsed") && retrieveItem($item`sparkler`, 1))
      use($item`sparkler`, 1);
    return;
  } else if (ef === $effect`Empathy`) {
    if (!have($skill`Empathy of the Newt`)) return;
    const currentOffhandItem = equippedItem($slot`offhand`);
    if (currentOffhandItem === $item`April Shower Thoughts shield`) unequip($slot`offhand`);
    cliExecute("cast Empathy of the Newt");
    if (currentOffhandItem === $item`April Shower Thoughts shield`)
      equip($slot`offhand`, currentOffhandItem);
    return;
  }
  if (improvedShowerSkills.has(ef)) {
    const sk = improvedShowerSkills.get(ef) ?? $skill.none;
    if (!have($item`April Shower Thoughts shield`) || !have(sk)) return;
    const currentOffhandItem = equippedItem($slot`offhand`);
    if (currentOffhandItem !== $item`April Shower Thoughts shield`)
      equip($slot`offhand`, $item`April Shower Thoughts shield`);
    cliExecute(`cast ${sk}`);
    if (currentOffhandItem !== $item`April Shower Thoughts shield`)
      equip($slot`offhand`, currentOffhandItem);
    return;
  }
  if (!ef.default) return; // No way to acquire?

  if (ef === $effect`Ode to Booze`) restoreMp(60);
  if (tryRegardless || canAcquireEffect(ef)) {
    const efDefault = ef.default;
    if (efDefault.split(" ")[0] === "cargo") return; // Don't acquire effects with cargo (items are usually way more useful)

    const usePowerfulGlove =
      efDefault.includes("CHEAT CODE") &&
      have($item`Powerful Glove`) &&
      !haveEquipped($item`Powerful Glove`);
    const currentAcc = equippedItem($slot`acc3`);
    if (usePowerfulGlove) equip($slot`acc3`, $item`Powerful Glove`);
    cliExecute(efDefault.replace(/cast 1 /g, "cast "));
    if (usePowerfulGlove) equip($slot`acc3`, currentAcc);
  }
}

export function canAcquireEffect(ef: Effect): boolean {
  // This will not attempt to craft items to acquire the effect, which is the behaviour of ef.default
  // You will need to have the item beforehand for this to return true
  return ef.all
    .map((defaultAction) => {
      if (defaultAction.length === 0) return false; // This effect is not acquirable
      const splitString = defaultAction.split(" ");
      const action = splitString[0];
      const target = splitString.slice(2).join(" ");

      switch (action) {
        case "eat": // We have the food
        case "drink": // We have the booze
        case "chew": // We have the spleen item
        case "use": // We have the item
          if (ef === $effect`Sparkling Consciousness` && get("_fireworkUsed")) return false;
          return have(toItem(target));
        case "cast":
          return have(toSkill(target)) && myMp() >= mpCost(toSkill(target)); // We have the skill and can cast it
        case "cargo":
          return false; // Don't acquire effects with cargo (items are usually way more useful)
        case "synthesize":
          return false; // We currently don't support sweet synthesis
        case "barrelprayer":
          return get("barrelShrineUnlocked") && !get("_barrelPrayer");
        case "witchess":
          return Witchess.have() && get("puzzleChampBonus") >= 20 && !get("_witchessBuff");
        case "telescope":
          return get("telescopeUpgrades") > 0 && !get("telescopeLookedHigh");
        case "beach":
          return have($item`Beach Comb`); // need to check if specific beach head has been taken
        case "spacegate":
          return get("spacegateAlways") && !get("_spacegateVaccine");
        case "pillkeeper":
          return have($item`Eight Days a Week Pill Keeper`);
        case "pool":
          return get("_poolGames") < 3;
        case "swim":
          return !get("_olympicSwimmingPool");
        case "shower":
          return !get("_aprilShower");
        case "terminal":
          return (
            get("_sourceTerminalEnhanceUses") <
            1 +
              get("sourceTerminalChips")
                .split(",")
                .filter((s) => s.includes("CRAM")).length
          );
        case "daycare":
          return get("daycareOpen") && !get("_daycareSpa");
        default:
          return true; // Whatever edge cases we have not handled yet, just try to acquire it
      }
    })
    .some((b) => b);
}

const gardens = $items`packet of pumpkin seeds, Peppermint Pip Packet, packet of dragon's teeth, packet of beer seeds, packet of winter seeds, packet of thanksgarden seeds, packet of tall grass seeds, packet of mushroom spores, packet of rock seeds`;
export function getGarden(): Item {
  return gardens.find((it) => it.name in getCampground()) || $item.none;
}

export function attemptRestoringMpWithFreeRests(mpTarget: number): void {
  if (myMp() >= mpTarget || myMp() === myMaxmp()) return;
  if (myMaxmp() - myMp() >= 1000 && get("_batWingsRestUsed") < 11) {
    const currentBack = equippedItem($slot`back`);
    equip($slot`back`, $item`bat wings`);
    useSkill($skill`Rest upside down`);
    if (currentBack !== Item.none) equip($slot`back`, currentBack);
    else unequip($slot`back`);
    return attemptRestoringMpWithFreeRests(mpTarget);
  }
  if (get("timesRested") >= totalFreeRests()) {
    restoreMp(mpTarget);
    return;
  }
  visitUrl("place.php?whichplace=chateau&action=chateau_restbox");
  attemptRestoringMpWithFreeRests(mpTarget);
}
