import React from 'react';
import { Stats } from 'lib/constants';
import { ASHBLAZING_ATK_STACK, baseComputedStatsObject } from 'lib/conditionals/constants';
import { basicRev, skillRev, talentRev, ultRev } from 'lib/conditionals/utils';
import { calculateAshblazingSet, precisionRound } from 'lib/conditionals/utils';

import DisplayFormControl from 'components/optimizerForm/conditionals/DisplayFormControl';
import { FormSwitchWithPopover } from 'components/optimizerForm/conditionals/FormSwitch';
import { FormSliderWithPopover } from 'components/optimizerForm/conditionals/FormSlider';

import { Eidolon } from 'types/Character'
import { Form, PrecomputedCharacterConditional } from 'types/CharacterConditional';


export default (e: Eidolon) => {
  const basicScaling = basicRev(e, 1.00, 1.10)
  const skillScaling = skillRev(e, 1.00, 1.10)
  const ultScaling = ultRev(e, 2.00, 2.16)
  const fuaScaling = talentRev(e, 0.40, 0.43)

  const hitMultiByTargets = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1),
    5: ASHBLAZING_ATK_STACK * (3 * 1 / 1)
  };

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'techniqueBuff',
    name: 'techniqueBuff',
    text: 'Technique Buff',
    title: 'Technique Buff',
    content: `Increases ATK by ${precisionRound(0.40 * 100)}% for 3 turns.`,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'targetFrozen',
    name: 'targetFrozen',
    text: 'Target frozen',
    title: 'Target frozen',
    content: `When Ult is used, increases DMG by ${precisionRound(0.20 * 100)}% to Frozen enemies.`,
  }, {
    formItem: FormSliderWithPopover,
    id: 'e2TalentCritStacks',
    name: 'e2TalentCritStacks',
    text: 'E2 Talent CR Stacks',
    title: 'E2 Talent CR Stacks',
    content: `Increases CRIT Rate by 3% per stack. Stacks up to 5 times.`,
    min: 0,
    max: 5,
    disabled: e < 2,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e6UltAtkBuff',
    name: 'e6UltAtkBuff',
    text: 'E6 Ult ATK Buff',
    title: 'E6 Ult ATK Buff',
    content: `After Ult, increases ATK by ${precisionRound(0.25 * 100)}% for 1 turn.`,
    disabled: e < 6,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      techniqueBuff: true,
      targetFrozen: true,
      e2TalentCritStacks: 5,
      e6UltAtkBuff: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (r.techniqueBuff) ? 0.40 : 0
      x[Stats.CR] += (e >= 2) ? r.e2TalentCritStacks * 0.03 : 0
      x[Stats.ATK_P] += (e >= 6 && r.e6UltAtkBuff) ? 0.25 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.BASIC_SCALING += (e >= 1 && request.enemyHpPercent <= 0.50) ? 0.40 : 0
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      x.SKILL_BOOST += (request.enemyHpPercent >= 0.50) ? 0.45 : 0

      // Boost
      x.ULT_BOOST += (r.targetFrozen) ? 0.20 : 0
      x.FUA_BOOST += (e >= 4) ? 0.10 : 0

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const x = c['x'];

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      const hitMulti = hitMultiByTargets[request.enemyCount]
      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    }
  }
}
