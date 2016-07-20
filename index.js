var debug = require('debug')('jsaturday::factory');

// -----------------------------------------------------------
// This is a draft!
// -----------------------------------------------------------

module.exports = function(settings){
  return new JSaturday(settings);
};

function JSaturday(settings){
  var globalObject = {};

  this.get = function(moduleName){
    var module = globalObject[moduleName];
    if(module)
      return module;
    throw new Error('Module ' + moduleName + ' not loaded!');  
  };

  this.testAdd = function(test){
    globalObject[test] = 1;
  };

  this.settings = function(){
    return settings;
  };

  this.loadModule = function(info, options){

    debug('info', 'Loading module ' + info.name + ' ...');

    if(!info.name)
      throw new Error('Missing info.name');

    if(globalObject[info.name])
      throw new Error('Module already loaded');

    if(typeof info.dependsOn === 'string')
      info.dependsOn = [info.dependsOn];

    if(!info.dependsOn)
      info.dependsOn = [];

    // INFO CHECKS
    for(var i = 0; i < info.dependsOn.length; i++){
      if(!globalObject[ info.dependsOn[i] ]){
        debug('error',  info.node + ' Missing dependsOn ' + info.dependsOn[i]);
        throw new Error('Missing dependsOn ' + info.dependsOn[i]);
      }
    }

    var api;
    var modules;
    var settings;
    var client;

    if(info.api)
      try{
        api = require(info.api)(this);
        // API CHECKS
        // ...
      }catch(err){
        debug('warning', 'Api not loaded!');
      }

    if(info.lib)
      try{
        // LIBs CHECKS
        // ...
        lib = require(info.lib)(this);
      }catch(err){
        debug('warning', 'Lib not loaded!');
      }

    if(info.settings)
      try{
        settings = require(info.settings)(this);
      }catch(err){
        debug('warning', 'Settings not loaded!');
      }

    if(info.client)
      try{
        client = require(info.client)(this);
      }catch(err){
        debug('warning', 'Client not loaded!');
      }

    var commonInterface = {
      getModule: this.get,
      name: info.name,
      api: api,
      client: client,
      lib: lib,
      settings: settings
    };

    // Add module to globalObject
    globalObject[info.name] = commonInterface;

    debug('info', 'Loaded module ' + info.name + '!\n');

    return true;

  };

}

