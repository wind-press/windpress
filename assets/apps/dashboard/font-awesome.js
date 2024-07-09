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
    faNpm,
    faFacebook,
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

    /** fab */
    faNpm,
    faFacebook,
);

export { library, FontAwesomeIcon };