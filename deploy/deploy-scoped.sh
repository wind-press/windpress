#!/usr/bin/env bash

# see https://stackoverflow.com/questions/66644233/how-to-propagate-colors-from-bash-script-to-github-action?noredirect=1#comment117811853_66644233
export TERM=xterm-color

# show errors
set -e

# script fails if trying to access to an undefined variable
set -u


# functions
note()
{
    MESSAGE=$1;

    printf "\n";
    echo "[NOTE] $MESSAGE";
    printf "\n";
}


# configure here
DEPLOY_DIRECTORY=$1
RESULT_DIRECTORY=$2

# ---------------------------

note "Starts"

# clean the directory which may contain files from previous runs
note "Cleaning directories"
rm -rf "$RESULT_DIRECTORY"

# download whitelist of php-scoper
note "Downloading whitelist of php-scoper"
wget https://github.com/snicco/php-scoper-wordpress-excludes/archive/refs/heads/master.zip -O "php-scoper-wordpress-excludes-master.zip"

# extract whitelist of php-scoper
note "Extracting whitelist of php-scoper"
unzip "php-scoper-wordpress-excludes-master.zip" -d "$DEPLOY_DIRECTORY/deploy"
rm -f "php-scoper-wordpress-excludes-master.zip"

# move scoper.inc.php file from $DEPLOY_DIRECTORY to current directory
# note "Moving scoper.inc.php file from $DEPLOY_DIRECTORY to current directory"
# mv "$DEPLOY_DIRECTORY/deploy/scoper.inc.php" .

# 2. scope it
note "Download php-scoper"
wget https://github.com/humbug/php-scoper/releases/download/0.18.11/php-scoper.phar -N --no-verbose

# Work around possible PHP memory limits
note "Running scoper to $RESULT_DIRECTORY"
php -d memory_limit=-1 php-scoper.phar add-prefix --output-dir "../$RESULT_DIRECTORY" --config "deploy/scoper.inc.php" --force --ansi --working-dir "$DEPLOY_DIRECTORY";
rm -f "$RESULT_DIRECTORY/php-scoper.phar"

# note "Dumping Composer Autoload"
# composer dump-autoload --working-dir "$RESULT_DIRECTORY" --ansi --classmap-authoritative --no-dev

# clean deploy files and directories
rm -rf "$DEPLOY_DIRECTORY"
rm -rf "$RESULT_DIRECTORY/deploy"
rm -f "$RESULT_DIRECTORY/composer.json"
rm -f "$RESULT_DIRECTORY/composer.lock"
rm -f "$RESULT_DIRECTORY/.gitattributes"
rm -f "$RESULT_DIRECTORY/.gitignore"
rm -f "$RESULT_DIRECTORY/.phpcs.xml"

# WordPress new plugin submission review
rm -f "$RESULT_DIRECTORY/vendor/paragonie/random_compat/build-phar.sh"
rm -f "$RESULT_DIRECTORY/vendor/paragonie/random_compat/dist/random_compat.phar.pubkey"
rm -f "$RESULT_DIRECTORY/vendor/paragonie/random_compat/dist/random_compat.phar.pubkey.asc"

note "Finished"