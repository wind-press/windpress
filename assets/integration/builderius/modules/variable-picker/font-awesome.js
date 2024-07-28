/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core';

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

/* import specific icons */
import {
    faXmark,
    faChevronRight,
} from '@fortawesome/pro-solid-svg-icons';

import {
} from '@fortawesome/pro-regular-svg-icons';

import {
} from '@fortawesome/free-brands-svg-icons';

/* add icons to the library */
library.add(
    /** fas */
    faXmark,
    faChevronRight,

    /** far */

    /** fab */
);

export { library, FontAwesomeIcon };