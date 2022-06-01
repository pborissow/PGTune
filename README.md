# PGTune
Javascript function used to generate configuration information for PostgreSQL (e.g. `postgresql.conf` file) using hardware specs. 

## Sample Usage
PGTune takes a set of server specs and returns a set of recommended configurations that you can use in a `postgresql.conf` file. Example:

```javascript
var config = le0pard.pgtune.getConfig({
    dbVersion: 14,
    osType: 'linux',
    dbType: 'web',
    totalMemory: 64,
    totalMemoryUnit: 'GB',
    cpuNum: 8,
    connectionNum: 250,
    hdType: 'ssd'
});

console.log(config);
```

Sample output:
```javascript
checkpoint_completion_target = 0.9
default_statistics_target = 100
effective_cache_size = 48GB
effective_io_concurrency = 200
maintenance_work_mem = 2GB
max_connections = 250
max_parallel_maintenance_workers = 4
max_parallel_workers = 8
max_parallel_workers_per_gather = 4
max_wal_size = 4GB
max_worker_processes = 8
min_wal_size = 1GB
random_page_cost = 1.1
shared_buffers = 16GB
wal_buffers = 16MB
work_mem = 17MB
```

## Options
 * **dbVersion**: PostgreSQL database version (e.g. 14, 13, 12, 11, 10, 9.6, 9.5)
 * **osType**: Operating system (e.g. 'linux', 'windows', 'mac')
 * **dbType**: Type of database application (e.g. 'web', 'oltp', 'dw', 'desktop', 'mixed')
 * **totalMemory**: Total RAM available on the server (positive integer)
 * **totalMemoryUnit**: Unit of measure for the totalMemory (e.g. 'MB', 'GB')
 * **cpuNum**: Total CPUs/Threads (positive integer)
 * **hdType**: Type of hard drive (e.g. 'ssd', 'nas', 'hdd')
 * **connectionNum**: Total number of concurrent connections to the database (positive integer)

## Credit
Inspired by this awesome site:
 * https://pgtune.leopard.in.ua/

Source code adopted from [here](https://github.com/le0pard/pgtune/):
   * [constants.js](https://github.com/le0pard/pgtune/blob/master/assets/selectors/configuration.js)
   * [configuration.js](https://github.com/le0pard/pgtune/blob/master/assets/reducers/configuration/constants.js)
