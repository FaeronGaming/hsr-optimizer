import React from "react";
// import { Flex } from "antd";
import { Stats } from "lib/constants";
import { ASHBLAZING_ATK_STACK, baseComputedStatsObject } from "lib/conditionals/constants";
import { calculateAshblazingSet, basic, skill, talent, ult } from "lib/conditionals/utils";
import { Eidolon } from "types/Character";
// import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
// import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
// import { FormSliderWithPopover } from "components/optimizerForm/conditionals/FormSlider";

// import { Eidolon } from "types/Character";
// import { Form, PrecomputedCharacterConditional } from "types/CharacterConditional";
export default (e: Eidolon) => {
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 1.50, 1.62)
  const fuaScaling = talent(e, 1.00, 1.10)

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  return {
    display: () => (
      <br />
    ),
    defaults: () => ({
    }),
    precomputeEffects: () => {
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      // Boost

      return x
    },
    calculateBaseMultis: (c, request) => {
      const x = c.x

      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      x.FUA_DMG += (e >= 4) ? 0.30 * x[Stats.DEF] : 0
    }
  }
}