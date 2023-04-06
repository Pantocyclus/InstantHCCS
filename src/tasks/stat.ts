import { cliExecute, useSkill } from "kolmafia";
import {
  $effect,
  $familiar,
  $skill,
  CommunityService,
  ensureEffect,
  get,
  have,
  uneffect,
} from "libram";
import { Quest } from "../engine/task";
import { burnLibram, logTestSetup } from "../lib";
import { bloodSugarSauceMagic } from "./postcoil";

export const HPQuest: Quest = {
  name: "HP",
  tasks: [
    {
      name: "Test",
      prepare: (): void => {
        if (have(bloodSugarSauceMagic)) useSkill($skill`Blood Sugar Sauce Magic`);
        if (get("parkaMode") !== "kachungasaur") cliExecute("parka kachungasaur");
      },
      completed: () => CommunityService.HP.isDone(),
      do: () => CommunityService.HP.run(() => logTestSetup(CommunityService.HP), 1),
      outfit: { modifier: "HP", familiar: $familiar`Disembodied Hand` },
      effects: [
        $effect`A Few Extra Pounds`,
        $effect`Mariachi Mood`,
        $effect`Patience of the Tortoise`,
        $effect`Power Ballad of the Arrowsmith`,
        $effect`Quiet Determination`,
        $effect`Reptilian Fortitude`,
        $effect`Saucemastery`,
        $effect`Seal Clubbing Frenzy`,
        $effect`Song of Starch`,
      ],
      post: (): void => {
        if (!have(bloodSugarSauceMagic)) useSkill($skill`Blood Sugar Sauce Magic`);
        burnLibram(300);
      },
      limit: { tries: 1 },
    },
  ],
};

export const MuscleQuest: Quest = {
  name: "Muscle",
  tasks: [
    {
      name: "Test",
      prepare: (): void => {
        useSkill($skill`Bind Undead Elbow Macaroni`);
        if (!have($effect`Spit Upon`)) ensureEffect($effect`Triple-Sized`);
      },
      completed: () => CommunityService.Muscle.isDone(),
      do: () => CommunityService.Muscle.run(() => logTestSetup(CommunityService.Muscle), 1),
      outfit: { modifier: "Muscle", familiar: $familiar`Disembodied Hand` },
      effects: [
        $effect`Go Get 'Em, Tiger!`,
        $effect`Quiet Determination`,
        $effect`Power Ballad of the Arrowsmith`,
        $effect`Rage of the Reindeer`,
        $effect`Song of Bravado`,
      ],
      post: (): void => {
        uneffect($effect`Power Ballad of the Arrowsmith`);
        burnLibram(300);
      },
      limit: { tries: 1 },
    },
  ],
};

export const MysticalityQuest: Quest = {
  name: "Mysticality",
  tasks: [
    {
      name: "Test",
      completed: () => CommunityService.Mysticality.isDone(),
      do: () =>
        CommunityService.Mysticality.run(() => logTestSetup(CommunityService.Mysticality), 1),
      outfit: { modifier: "Mysticality", familiar: $familiar`Disembodied Hand` },
      effects: [
        $effect`Glittering Eyelashes`,
        $effect`The Magical Mojomuscular Melody`,
        $effect`Pasta Oneness`,
        $effect`Quiet Judgement`,
      ],
      post: (): void => {
        uneffect($effect`The Magical Mojomuscular Melody`);
        burnLibram(300);
      },
      limit: { tries: 1 },
    },
  ],
};

export const MoxieQuest: Quest = {
  name: "Moxie",
  tasks: [
    {
      name: "Test",
      completed: () => CommunityService.Moxie.isDone(),
      do: () => CommunityService.Moxie.run(() => logTestSetup(CommunityService.Moxie), 1),
      outfit: { modifier: "Moxie", familiar: $familiar`Disembodied Hand` },
      effects: [
        $effect`Amazing`,
        $effect`Blubbered Up`,
        $effect`Butt-Rock Hair`,
        $effect`Disco Fever`,
        $effect`Disco State of Mind`,
        $effect`The Moxious Madrigal`,
        $effect`Pomp & Circumsands`,
        $effect`Quiet Desperation`,
      ],
      post: () => burnLibram(300),
      limit: { tries: 1 },
    },
  ],
};
