/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core';

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

/* import specific icons */
import {
    faSunBright,
    faMoonStars,
    faChevronRight,
    faCircleNotch,
    faBook,
    faUserHeadset,
    faRss,
    faGear,
    faGripDotsVertical,
    faEllipsisVertical,
    faTrash,
    faX,
    faPlus,
    faUpRightFromSquare,
    faFileLock,
    faXmark,
    faCheck,
    faDownload,
    faAnglesUpDown,
    faGears,
    faTrashUndo,
    faReply,
    faShare,
    faBolt,
    faBroom,
    faCircle,
    faRectanglePro,
    faArrowUpRightFromSquare,
    faFaceSmileHearts,
    faHourglassClock,
    faStarShooting,
} from '@fortawesome/pro-solid-svg-icons';

import {
    faHeart as faHeartRegular,
    faChevronRight as faChevronRightRegular,
    faLaptopMobile as faLaptopMobileRegular,
    faPalette as faPaletteRegular,
    faArrowsLeftRightToLine as faArrowsLeftRightToLineRegular,
    faTextSize as faTextSizeRegular,
    faBoxArchive as faBoxArchiveRegular,
    faMasksTheater as faMasksTheaterRegular,
    faArrowUpRightFromSquare as faArrowUpRightFromSquareRegular,
} from '@fortawesome/pro-regular-svg-icons';

import {
} from '@fortawesome/pro-light-svg-icons';

import {
    faNpm,
    faFacebook,
    faJsSquare,
    faCss3Alt,
} from '@fortawesome/free-brands-svg-icons';

/* add icons to the library */
library.add(
    /** fas */
    faSunBright,
    faMoonStars,
    faChevronRight,
    faCircleNotch,
    faBook,
    faUserHeadset,
    faRss,
    faGear,
    faGripDotsVertical,
    faEllipsisVertical,
    faTrash,
    faX,
    faPlus,
    faUpRightFromSquare,
    faFileLock,
    faXmark,
    faCheck,
    faDownload,
    faAnglesUpDown,
    faGears,
    faTrashUndo,
    faReply,
    faShare,
    faBolt,
    faBroom,
    faCircle,
    faRectanglePro,
    faArrowUpRightFromSquare,
    faFaceSmileHearts,
    faHourglassClock,
    faStarShooting,

    /** far */
    faHeartRegular,
    faChevronRightRegular,
    faLaptopMobileRegular,
    faPaletteRegular,
    faArrowUpRightFromSquareRegular,
    faArrowsLeftRightToLineRegular,
    faTextSizeRegular,
    faBoxArchiveRegular,
    faMasksTheaterRegular,

    /** fal */

    /** fab */
    faNpm,
    faFacebook,
    faJsSquare,
    faCss3Alt,
);

export { library, FontAwesomeIcon };