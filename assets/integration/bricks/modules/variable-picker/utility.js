import { observe } from '@/integration/shared/utils/variable-picker-utils';
import { createBricksActiveElementGetter } from '@/integration/bricks/utils/variable-picker-utils.js';
import { brxGlobalProp } from '@/integration/bricks/constant.js';

export const getActiveElement = createBricksActiveElementGetter(brxGlobalProp);

export { observe };