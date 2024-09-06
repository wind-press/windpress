<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\Php73\Rector\String_\SensitiveHereNowDocRector;
use Rector\Set\ValueObject\LevelSetList;
use Rector\Set\ValueObject\SetList;
use Rector\Set\ValueObject\DowngradeLevelSetList;

return static function (RectorConfig $rectorConfig): void {
    $rectorConfig->paths([
        './constant.php',
        __DIR__ . '/src',
    ]);

    $rectorConfig->parallel(300);

    $rectorConfig->skip([
        SensitiveHereNowDocRector::class,
    ]);


    // define sets of rules
    $rectorConfig->sets([
        SetList::NAMING,
        SetList::CODE_QUALITY,
        SetList::CODING_STYLE,
        LevelSetList::UP_TO_PHP_74,
        DowngradeLevelSetList::DOWN_TO_PHP_74,
    ]);
};
