# PGTune
Function used to generate configuration information for PostgreSQL (e.g. `postgresql.conf` file) using hardware specs. 

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
checkpoint_completion_target: 0.9
default_statistics_target: 100
effective_cache_size: 50331648
effective_io_concurrency: 200
maintenance_work_mem: 2097152
max_connections: 250
max_parallel_maintenance_workers: 4
max_parallel_workers: 8
max_parallel_workers_per_gather: 4
max_wal_size: 4194304
max_worker_processes: 8
min_wal_size: 1048576
random_page_cost: 1.1
shared_buffers: 16777216
wal_buffers: 16384
work_mem: 16777
```

## Credit
Inspired by this awesome site:
 * https://pgtune.leopard.in.ua/

Source code adopted from here:
 * https://github.com/le0pard/pgtune/blob/master/

Specifically these 2 files:
 1. /assets/selectors/configuration.js
 1. /assets/reducers/configuration/constants.js