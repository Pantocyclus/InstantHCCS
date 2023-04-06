import {
  haveEffect,
  Item,
  itemAmount,
  mpCost,
  myBasestat,
  myBuffedstat,
  myMaxhp,
  myMp,
  print,
  retrieveItem,
  retrievePrice,
  Skill,
  sweetSynthesis,
  toInt,
  toStat,
  useSkill,
} from "kolmafia";
import {
  $effect,
  $effects,
  $item,
  $items,
  $skill,
  $stat,
  CommunityService,
  have,
  set,
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
      whichTest
    )
  ) {
    const testStat = toStat(whichTest.statName);
    const statString = testStat.toString().slice(0, 3);
    print(
      `Base ${statString}: ${myBasestat(testStat)}; Buffed ${statString}: ${myBuffedstat(testStat)}`
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
    "blue"
  );
  set(`_CSTest${whichTest.id}`, testTurns + (have($effect`Simmering`) ? 1 : 0));
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

function needBrickos(): boolean {
  const oysters = itemAmount($item`BRICKO oyster`);
  const brickContributions = Math.floor(itemAmount($item`BRICKO brick`) / 8);
  const eyeContributions = itemAmount($item`BRICKO eye brick`);
  const materials = brickContributions < eyeContributions ? brickContributions : eyeContributions;
  return have($skill`Summon BRICKOs`) && oysters + materials < 1;
}

function chooseLibram(useBrickos: boolean): Skill {
  const needLoveSong =
    itemAmount($item`love song of icy revenge`) +
      Math.floor(haveEffect($effect`Cold Hearted`) / 5) <
    4;
  if (useBrickos && needBrickos()) {
    return $skill`Summon BRICKOs`;
    /*
  } else if (!have($effect`Synthesis: Smart`) && !mystSynthAttainable()) {
    return $skill`Summon Candy Heart`;
    */
  } else if (
    (!have($item`resolution: be happier`) && !have($effect`Joyful Resolve`)) ||
    (!have($item`resolution: be feistier`) && !have($effect`Destructive Resolve`))
  ) {
    return $skill`Summon Resolutions`;
  } else if (
    (!have($item`green candy heart`) && !have($effect`Heart of Green`)) ||
    (!have($item`lavender candy heart`) && !have($effect`Heart of Lavender`))
  ) {
    return $skill`Summon Candy Heart`;
  } else if (needLoveSong) {
    return $skill`Summon Love Song`;
  } else if (!have($item`resolution: be kinder`) && !have($effect`Kindly Resolve`)) {
    return $skill`Summon Resolutions`;
  }

  return $skill`Summon Taffy`;
}

export function burnLibram(saveMp: number, useBrickos?: boolean): void {
  while (myMp() >= mpCost(chooseLibram(useBrickos ?? false)) + saveMp) {
    useSkill(chooseLibram(useBrickos ?? false));
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
  (candy) => !Array.from(peppermintCandiesCosts.keys()).includes(candy)
);

function haveCandies(a: Item, b: Item): boolean {
  const candiesRequired = new Map<Item, number>();
  [a, b].forEach((candy) => {
    const currentAmount = candiesRequired.get(candy) ?? 0;
    if (nonPeppermintCandies.includes(candy)) candiesRequired.set(candy, currentAmount + 1);
    else
      candiesRequired.set(
        $item`peppermint sprout`,
        currentAmount + (peppermintCandiesCosts.get(candy) ?? Infinity)
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
        : right
    );
  if (bestPair[0] === bestPair[1]) retrieveItem(bestPair[0], 2);
  else bestPair.forEach((it) => retrieveItem(it));
  sweetSynthesis(bestPair[0], bestPair[1]);
}
