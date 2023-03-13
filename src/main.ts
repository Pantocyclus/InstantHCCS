import {
  gametimeToInt,
  myAdventures,
  myAscensions,
  print,
  setAutoAttack,
  turnsPlayed,
  userConfirm,
} from "kolmafia";
import { convertMilliseconds } from "./lib";
import { $effect, get, have, set } from "libram";
import { Engine } from "./engine/engine";
import { Args, getTasks } from "grimoire-kolmafia";
import { BoozeDropQuest } from "./tasks/boozedrop";
import { CoilWireQuest } from "./tasks/coilwire";
import { DonateQuest } from "./tasks/donate";
import { FamiliarWeightQuest } from "./tasks/familiarweight";
import { HotResQuest } from "./tasks/hotres";
import { LevelingQuest } from "./tasks/leveling";
import { NoncombatQuest } from "./tasks/noncombat";
import { PostCoilQuest } from "./tasks/postcoil";
import { RunStartQuest } from "./tasks/runstart";
import { SpellDamageQuest } from "./tasks/spelldamage";
import { HPQuest, MoxieQuest, MuscleQuest, MysticalityQuest } from "./tasks/stat";
import { WeaponDamageQuest } from "./tasks/weapondamage";

const timeProperty = "fullday_elapsedTime";

export const args = Args.create("InstantHCCS", "A full-day wrapper script.", {
  confirm: Args.boolean({
    help: "If the user must confirm execution of each task.",
    default: false,
  }),
});

export function main(command?: string): void {
  Args.fill(args, command);
  if (args.help) {
    Args.showHelp(args);
    return;
  }

  if (runComplete()) {
    print("Community Service complete!", "purple");
    return;
  }

  const setTimeNow = get(timeProperty, -1) === -1;
  if (setTimeNow) set(timeProperty, gametimeToInt());

  const tasks = getTasks([
    RunStartQuest,
    CoilWireQuest,
    PostCoilQuest,
    LevelingQuest,
    HotResQuest,
    HPQuest,
    MuscleQuest,
    MysticalityQuest,
    MoxieQuest,
    NoncombatQuest,
    WeaponDamageQuest,
    SpellDamageQuest,
    FamiliarWeightQuest,
    BoozeDropQuest,
    DonateQuest,
  ]);
  const engine = new Engine(tasks);
  setAutoAttack(0);

  while (!runComplete()) {
    const task = engine.getNextTask();
    if (task === undefined) throw "Unable to find available task, but the run is not complete";
    if (args.confirm && !userConfirm(`Executing task ${task.name}, should we continue?`)) {
      throw `User rejected execution of task ${task.name}`;
    }
    if (task.ready !== undefined && !task.ready()) throw `Task ${task.name} is not ready`;
    engine.execute(task);
  }

  print("Community Service complete!", "purple");
  print(`Adventures used: ${turnsPlayed()}`, "purple");
  print(`Adventures remaining: ${myAdventures()}`, "purple");
  print(
    `Time: ${convertMilliseconds(
      gametimeToInt() - get(timeProperty, gametimeToInt())
    )} since first run today started`,
    "purple"
  );
  set(timeProperty, -1);
}

function runComplete(): boolean {
  return (
    get("kingLiberated") &&
    get("lastEmptiedStorage") === myAscensions() &&
    !have($effect`Feeling Lost`) &&
    !have($effect`Cowrruption`)
  );
}
