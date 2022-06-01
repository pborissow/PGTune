//******************************************************************************
//**  PGTune
//******************************************************************************
/**
 *   Function used to generate configuration information for PostgreSQL using
 *   hardware specs. Example:
 *   https://pgtune.leopard.in.ua/
 *
 *   Source code adopted from here:
 *   https://github.com/le0pard/pgtune/blob/master/
 *
 *   Specifically these 2 files:
 *   (1) /assets/selectors/configuration.js
 *   (2) /assets/reducers/configuration/constants.js
 *
 *   All this script does is encapsulate the core configuration recommendations
 *   into a getConfig() function in the le0pard.pgtune namespace.
 *
 ******************************************************************************/

if(!le0pard) var le0pard={};
if(!le0pard.pgtune) le0pard.pgtune={};
le0pard.pgtune.getConfig = function(config) {


  //Merge function
    const merge = (values, defaults) => {
        return Object.assign(defaults, values);
    };


  //Default config
    const defaultConfig = {
        dbVersion: 14,
        osType: 'linux',
        dbType: 'web',
        totalMemory: 8,
        totalMemoryUnit: 'MB',
        cpuNum: 2,
        connectionNum: 250,
        hdType: 'ssd'
    };

  //Fill missing config with defaults
    config = merge(config, defaultConfig);


  //Returns
    const createSelector = function(arr, fn){
        return fn.apply(this, arr);
    };


//*****************************************************************************/
//** The following is copied from /assets/reducers/configuration/constants.js
//*****************************************************************************/

// os types
const OS_LINUX = 'linux'
const OS_WINDOWS = 'windows'
const OS_MAC = 'mac'
// db types
const DB_TYPE_WEB = 'web'
const DB_TYPE_OLTP = 'oltp'
const DB_TYPE_DW = 'dw'
const DB_TYPE_DESKTOP = 'desktop'
const DB_TYPE_MIXED = 'mixed'
// size units
const SIZE_UNIT_MB = 'MB'
const SIZE_UNIT_GB = 'GB'
// harddrive types
const HARD_DRIVE_SSD = 'ssd'
const HARD_DRIVE_SAN = 'san'
const HARD_DRIVE_HDD = 'hdd'




//*****************************************************************************/
//** The following is copied from /assets/selectors/configuration.js
//*****************************************************************************/


const SIZE_UNIT_MAP = {
  KB: 1024,
  MB: 1048576,
  GB: 1073741824,
  TB: 1099511627776
}



const getDBVersion = config.dbVersion
const getOSType = config.osType
const getDBType = config.dbType
const getTotalMemory = config.totalMemory
const getTotalMemoryUnit = config.totalMemoryUnit
const getCPUNum = config.cpuNum
const getConnectionNum = config.connectionNum
const getHDType = config.hdType





const totalMemoryInBytes = createSelector(
  [getTotalMemory, getTotalMemoryUnit],
  (totalMemory, totalMemoryUnit) => (
    totalMemory * SIZE_UNIT_MAP[totalMemoryUnit]
  )
)

const getDbDefaultValues = createSelector(
  [getDBVersion],
  (dbVersion) => (
    {
      9.5: {
        ['max_worker_processes']: 8
      },
      9.6: {
        ['max_worker_processes']: 8,
        ['max_parallel_workers_per_gather']: 0
      },
      10: {
        ['max_worker_processes']: 8,
        ['max_parallel_workers_per_gather']: 2,
        ['max_parallel_workers']: 8
      },
      11: {
        ['max_worker_processes']: 8,
        ['max_parallel_workers_per_gather']: 2,
        ['max_parallel_workers']: 8
      },
      12: {
        ['max_worker_processes']: 8,
        ['max_parallel_workers_per_gather']: 2,
        ['max_parallel_workers']: 8
      },
      13: {
        ['max_worker_processes']: 8,
        ['max_parallel_workers_per_gather']: 2,
        ['max_parallel_workers']: 8
      },
      14: {
        ['max_worker_processes']: 8,
        ['max_parallel_workers_per_gather']: 2,
        ['max_parallel_workers']: 8
      }
    }[dbVersion]
  )
)

const isReadyForConfiguration = createSelector(
  [getTotalMemory],
  (totalMemory) => !!totalMemory
)

const maxConnections = createSelector(
  [getConnectionNum, getDBType],
  (connectionNum, dbType) => (
    connectionNum ? connectionNum : {
      [DB_TYPE_WEB]: 200,
      [DB_TYPE_OLTP]: 300,
      [DB_TYPE_DW]: 40,
      [DB_TYPE_DESKTOP]: 20,
      [DB_TYPE_MIXED]: 100
    }[dbType]
  )
)

const totalMemoryInKb = createSelector(
  [totalMemoryInBytes],
  (totalMemoryBytes) => (
    totalMemoryBytes / SIZE_UNIT_MAP['KB']
  )
)

const sharedBuffers = createSelector(
  [totalMemoryInKb, getDBType, getOSType, getDBVersion],
  (totalMemoryKb, dbType, osType, dbVersion) => {
    let sharedBuffersValue = {
      [DB_TYPE_WEB]: Math.floor(totalMemoryKb / 4),
      [DB_TYPE_OLTP]: Math.floor(totalMemoryKb / 4),
      [DB_TYPE_DW]: Math.floor(totalMemoryKb / 4),
      [DB_TYPE_DESKTOP]: Math.floor(totalMemoryKb / 16),
      [DB_TYPE_MIXED]: Math.floor(totalMemoryKb / 4)
    }[dbType]
    if (dbVersion < 10 && OS_WINDOWS === osType) {
      // Limit shared_buffers to 512MB on Windows
      const winMemoryLimit = 512 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']
      if (sharedBuffersValue > winMemoryLimit) {
        sharedBuffersValue = winMemoryLimit
      }
    }
    return sharedBuffersValue
  }
)

const effectiveCacheSize = createSelector(
  [totalMemoryInKb, getDBType],
  (totalMemoryKb, dbType) => ({
    [DB_TYPE_WEB]: Math.floor(totalMemoryKb * 3 / 4),
    [DB_TYPE_OLTP]: Math.floor(totalMemoryKb * 3 / 4),
    [DB_TYPE_DW]: Math.floor(totalMemoryKb * 3 / 4),
    [DB_TYPE_DESKTOP]: Math.floor(totalMemoryKb / 4),
    [DB_TYPE_MIXED]: Math.floor(totalMemoryKb * 3 / 4)
  }[dbType])
)

const maintenanceWorkMem = createSelector(
  [totalMemoryInKb, getDBType, getOSType],
  (totalMemoryKb, dbType, osType) => {
    let maintenanceWorkMemValue = {
      [DB_TYPE_WEB]: Math.floor(totalMemoryKb / 16),
      [DB_TYPE_OLTP]: Math.floor(totalMemoryKb / 16),
      [DB_TYPE_DW]: Math.floor(totalMemoryKb / 8),
      [DB_TYPE_DESKTOP]: Math.floor(totalMemoryKb / 16),
      [DB_TYPE_MIXED]: Math.floor(totalMemoryKb / 16)
    }[dbType]
    // Cap maintenance RAM at 2GB on servers with lots of memory
    const memoryLimit = 2 * SIZE_UNIT_MAP['GB'] / SIZE_UNIT_MAP['KB']
    if (maintenanceWorkMemValue > memoryLimit) {
      if (OS_WINDOWS === osType) {
        // 2048MB (2 GB) will raise error at Windows, so we need remove 1 MB from it
        maintenanceWorkMemValue = memoryLimit - (1 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB'])
      } else {
        maintenanceWorkMemValue = memoryLimit
      }
    }
    return maintenanceWorkMemValue
  }
)

const checkpointSegments = createSelector(
  [getDBVersion, getDBType],
  (dbVersion, dbType) => {
    if (dbVersion < 9.5) {
      return [
        {
          key: 'checkpoint_segments',
          value: ({
            [DB_TYPE_WEB]: 32,
            [DB_TYPE_OLTP]: 64,
            [DB_TYPE_DW]: 128,
            [DB_TYPE_DESKTOP]: 3,
            [DB_TYPE_MIXED]: 32
          }[dbType])
        }
      ]
    } else {
      return [
        {
          key: 'min_wal_size',
          value: ({
            [DB_TYPE_WEB]: (1024 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_OLTP]: (2048 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_DW]: (4096 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_DESKTOP]: (100 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_MIXED]: (1024 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB'])
          }[dbType])
        },
        {
          key: 'max_wal_size',
          value: ({
            [DB_TYPE_WEB]: (4096 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_OLTP]: (8192 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_DW]: (16384 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_DESKTOP]: (2048 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']),
            [DB_TYPE_MIXED]: (4096 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB'])
          }[dbType])
        }
      ]
    }
  }
)

const checkpointCompletionTarget = createSelector(
  [],
  () => 0.9 // based on https://github.com/postgres/postgres/commit/bbcc4eb2
)

const walBuffers = createSelector(
  [sharedBuffers],
  (sharedBuffersValue) => {
    // Follow auto-tuning guideline for wal_buffers added in 9.1, where it's
    // set to 3% of shared_buffers up to a maximum of 16MB.
    let walBuffersValue = Math.floor(3 * sharedBuffersValue / 100)
    const maxWalBuffer = 16 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']
    if (walBuffersValue > maxWalBuffer) {
      walBuffersValue = maxWalBuffer
    }
    // It's nice of wal_buffers is an even 16MB if it's near that number. Since
    // that is a common case on Windows, where shared_buffers is clipped to 512MB,
    // round upwards in that situation
    const walBufferNearValue = 14 * SIZE_UNIT_MAP['MB'] / SIZE_UNIT_MAP['KB']
    if (walBuffersValue > walBufferNearValue && walBuffersValue < maxWalBuffer) {
      walBuffersValue = maxWalBuffer
    }
    // if less, than 32 kb, than set it to minimum
    if (walBuffersValue < 32) {
      walBuffersValue = 32
    }
    return walBuffersValue
  }
)

const defaultStatisticsTarget = createSelector(
  [getDBType],
  (dbType) => ({
    [DB_TYPE_WEB]: 100,
    [DB_TYPE_OLTP]: 100,
    [DB_TYPE_DW]: 500,
    [DB_TYPE_DESKTOP]: 100,
    [DB_TYPE_MIXED]: 100
  }[dbType])
)

const randomPageCost = createSelector(
  [getHDType],
  (hdType) => ({
    [HARD_DRIVE_HDD]: 4,
    [HARD_DRIVE_SSD]: 1.1,
    [HARD_DRIVE_SAN]: 1.1
  }[hdType])
)

const effectiveIoConcurrency = createSelector(
  [getOSType, getHDType],
  (osType, hdType) => {
    if ([OS_WINDOWS, OS_MAC].indexOf(osType) >= 0) {
      return null
    }
    return {
      [HARD_DRIVE_HDD]: 2,
      [HARD_DRIVE_SSD]: 200,
      [HARD_DRIVE_SAN]: 300
    }[hdType]
  }
)

const parallelSettings = createSelector(
  [getDBVersion, getDBType, getCPUNum],
  (dbVersion, dbType, cpuNum) => {
    if (dbVersion < 9.5 || cpuNum < 2) {
      return []
    }

    let config = [
      {
        key: 'max_worker_processes',
        value: cpuNum
      }
    ]

    if (dbVersion >= 9.6) {
      let workersPerGather = Math.ceil(cpuNum / 2)

      if (dbType !== DB_TYPE_DW && workersPerGather > 4) {
        workersPerGather = 4 // no clear evidence, that each new worker will provide big benefit for each noew core
      }

      config.push({
        key: 'max_parallel_workers_per_gather',
        value: workersPerGather
      })
    }

    if (dbVersion >= 10) {
      config.push({
        key: 'max_parallel_workers',
        value: cpuNum
      })
    }

    if (dbVersion >= 11) {
      let parallelMaintenanceWorkers = Math.ceil(cpuNum / 2)

      if (parallelMaintenanceWorkers > 4) {
        parallelMaintenanceWorkers = 4 // no clear evidence, that each new worker will provide big benefit for each noew core
      }

      config.push({
        key: 'max_parallel_maintenance_workers',
        value: parallelMaintenanceWorkers
      })
    }

    return config
  }
)



const workMem = createSelector(
  [totalMemoryInKb, sharedBuffers, maxConnections, parallelSettings, getDbDefaultValues, getDBType],
  (
    totalMemoryKb, sharedBuffersValue,
    maxConnectionsValue, parallelSettingsValue,
    dbDefaultValues, dbType
  ) => {
    const parallelForWorkMem = (() => {
      if (parallelSettingsValue.length) {
        const maxParallelWorkersPerGather = parallelSettingsValue.find((param) => (
          param['key'] === 'max_parallel_workers_per_gather'
        ))
        if (maxParallelWorkersPerGather && maxParallelWorkersPerGather['value'] && maxParallelWorkersPerGather['value'] > 0) {
          return maxParallelWorkersPerGather['value']
        }
      }
      if (
        dbDefaultValues['max_parallel_workers_per_gather'] &&
        dbDefaultValues['max_parallel_workers_per_gather'] > 0
      ) {
        return dbDefaultValues['max_parallel_workers_per_gather']
      }
      return 1
    })()
    // work_mem is assigned any time a query calls for a sort, or a hash, or any other structure that needs a space allocation, which can happen multiple times per query. So you're better off assuming max_connections * 2 or max_connections * 3 is the amount of RAM that will actually use in reality. At the very least, you need to subtract shared_buffers from the amount you're distributing to connections in work_mem.
    // The other thing to consider is that there's no reason to run on the edge of available memory. If you do that, there's a very high risk the out-of-memory killer will come along and start killing PostgreSQL backends. Always leave a buffer of some kind in case of spikes in memory usage. So your maximum amount of memory available in work_mem should be ((RAM - shared_buffers) / (max_connections * 3) / max_parallel_workers_per_gather).
    const workMemValue = (
      (totalMemoryKb - sharedBuffersValue) / (maxConnectionsValue * 3) / parallelForWorkMem
    )
    let workMemResult = {
      [DB_TYPE_WEB]: Math.floor(workMemValue),
      [DB_TYPE_OLTP]: Math.floor(workMemValue),
      [DB_TYPE_DW]: Math.floor(workMemValue / 2),
      [DB_TYPE_DESKTOP]: Math.floor(workMemValue / 6),
      [DB_TYPE_MIXED]: Math.floor(workMemValue / 2)
    }[dbType]
    // if less, than 64 kb, than set it to minimum
    if (workMemResult < 64) {
      workMemResult = 64
    }
    return workMemResult
  }
)

const warningInfoMessages = createSelector(
  [totalMemoryInBytes],
  (totalMemory) => {
    if (totalMemory < 256 * SIZE_UNIT_MAP['MB']) {
      return [
        '# WARNING',
        '# this tool not being optimal',
        '# for low memory systems'
      ]
    }
    if (totalMemory > 100 * SIZE_UNIT_MAP['GB']) {
      return [
        '# WARNING',
        '# this tool not being optimal',
        '# for very high memory systems'
      ]
    }
    return []
  }
)


//*****************************************************************************/
//** End copied code!
//*****************************************************************************/


  //Return response
    const results = {};
    checkpointSegments.forEach((setting)=>{
        results[setting.key] = setting.value;
    });
    parallelSettings.forEach((setting)=>{
        results[setting.key] = setting.value;
    });
    return merge(results, {
        max_connections: maxConnections,
        shared_buffers: sharedBuffers,
        effective_cache_size: effectiveCacheSize,
        maintenance_work_mem: maintenanceWorkMem,
        checkpoint_completion_target: checkpointCompletionTarget,
        wal_buffers: walBuffers,
        default_statistics_target: defaultStatisticsTarget,
        random_page_cost: randomPageCost,
        effective_io_concurrency: effectiveIoConcurrency,
        work_mem: workMem
    });

};
