# Migration Directory

This directory contains files pertaining to the forthcoming database migration,
from MongoDB to MySQL.

Dependencies for the scripts are added in the top-level package.json/packcage-lock.json.

Some scripts are in pure JS. These will need to be migrated to TypeScript before any merging
is completed.

## Installing MySQL

If you want to test these files with a local MySQL installation,
you will need to install MySQL on your system and configure credentials
as desired. You could also test the scripts with a remote MySQL instance by specifying
the host properly in the `.env` file for this directory (see below).

## Running

To build the database, you will need to create a `.env` file (may want
to rename so at not to conflict with the app's `.env` file) with variables
following the schema of the `env.example` file.
Once this is done, source it with `source .env` in BASH.

After doing this, simply run `node buildDatabase.js`. No output means
the script exited successfully. Logs should be added.

