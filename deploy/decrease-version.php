<?php

/**
 * @var string Working directory.
 */
define('WORK_DIR', getcwd());

/**
 * src/Plugin.php
 * 
 * the pattern is `public const VERSION = 'X.Y.Z';`, where Y is the minor version
 * then decrease it by 1.
 */
function step_1()
{
    $curr_file = file_get_contents(WORK_DIR . '/constant.php');
    preg_match('/public const VERSION = \'(\d+)\.(\d+)\.(\d+)\';/', $curr_file, $matches);
    $major_version = $matches[1];
    $minor_version = $matches[2];
    $patch_version = $matches[3];
    $curr_file = preg_replace('/public const VERSION = \'(\d+)\.(\d+)\.(\d+)\';/', 'public const VERSION = \'' . $major_version . '.' . ($minor_version - 1) . '.' . $patch_version . '\';', $curr_file);
    file_put_contents(WORK_DIR . '/constant.php', $curr_file);
}


/**
 * windpress.php
 * 
 * the pattern is `* Version:             X.Y.Z`, where X is the major version, Y is the minor version and Z is the patch version.
 */
function step_2()
{
    $curr_file = file_get_contents(WORK_DIR . '/windpress.php');
    preg_match('/\* Version:             (\d+)\.(\d+)\.(\d+)/', $curr_file, $matches);
    $major_version = $matches[1];
    $minor_version = $matches[2];
    $patch_version = $matches[3];
    $curr_file = preg_replace('/\* Version:             (\d+)\.(\d+)\.(\d+)/', '* Version:             ' . $major_version . '.' . ($minor_version - 1) . '.' . $patch_version, $curr_file);
    file_put_contents(WORK_DIR . '/windpress.php', $curr_file);
}

/**
 * readme.txt
 * 
 * the pattern is `Stable tag: X.Y.Z`, where X is the major version, Y is the minor version and Z is the patch version.
 */
function step_3()
{
    $curr_file = file_get_contents(WORK_DIR . '/readme.txt');
    preg_match('/Stable tag: (\d+)\.(\d+)\.(\d+)/', $curr_file, $matches);
    $major_version = $matches[1];
    $minor_version = $matches[2];
    $patch_version = $matches[3];
    $curr_file = preg_replace('/Stable tag: (\d+)\.(\d+)\.(\d+)/', 'Stable tag: ' . $major_version . '.' . ($minor_version - 1) . '.' . $patch_version, $curr_file);
    file_put_contents(WORK_DIR . '/readme.txt', $curr_file);
}

/**
 * readme.txt
 * 
 * the pattern is `= X.Y.Z =`, where X is the major version, Y is the minor version and Z is the patch version.
 * it occurs several times in the file but with different version.
 * decreace each Y by 1.
 */
function step_4()
{
    $curr_file = file_get_contents(WORK_DIR . '/readme.txt');
    preg_match_all('/= (\d+)\.(\d+)\.(\d+) =/', $curr_file, $matches);
    $curr_file = preg_replace_callback('/= (\d+)\.(\d+)\.(\d+) =/', function ($matches) {
        return '= ' . $matches[1] . '.' . ($matches[2] - 1) . '.' . $matches[3] . ' =';
    }, $curr_file);
    file_put_contents(WORK_DIR . '/readme.txt', $curr_file);
}


step_1();
step_2();
step_3();
step_4();