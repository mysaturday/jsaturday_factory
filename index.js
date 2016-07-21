var debug = require('debug')('jsaturday::factory');

// -----------------------------------------------------------
// This is a draft!
// -----------------------------------------------------------

var maxStackLevel = 5;


module.exports = function(settings){
  return new JSaturday(settings);
};

function JSaturday(settings){
  var globalObject = {};
  var stackLevel = 1;

  this.get = function(moduleName){
    var module = globalObject[moduleName];
    if(module)
      return module;
    throw new Error('Module ' + moduleName + ' not loaded!');  
  };

  this.testAdd = function(test){
    globalObject[test] = 1;
  };

  this.getModules = function(){
    return Object.keys(globalObject);
  };  

  this.settings = function(){
    return settings;
  };

  this.loadModule = function(info, options){

    if(stackLevel > maxStackLevel)
      throw new Error('Max stack level in loading modules. Check for cyclic dependences...')

    debug('info', 'Loading module ' + info.name + ' (stackLevel = ' + stackLevel + ')...');

    if(!info.name)
      throw new Error('Missing info.name');

    if(globalObject[info.name]){
      debug('warning ' + info.name + ' already loaded');
      return false;
    }

    if(typeof info.dependsOn === 'string')
      info.dependsOn = [info.dependsOn];

    if(!info.dependsOn)
      info.dependsOn = [];

    // INFO CHECKS
    for(var i = 0; i < info.dependsOn.length; i++){
      if(!globalObject[ info.dependsOn[i] ]){

        stackLevel++;
        debug('info',  info.name + ' Try to import ' + info.dependsOn[i]);

        var dependentModule = require(info.dependsOn[i]);
        this.loadModule(dependentModule, options);
     
        stackLevel--;        
      }
      else{
        debug('info',  info.name + ' Skip import of' + info.dependsOn[i]);      
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
        debug('verbose', 'Api not loaded!');
      }

    if(info.lib)
      try{
        // LIBs CHECKS
        // ...
        lib = require(info.lib)(this);
      }catch(err){
        debug('verbose', 'Lib not loaded!');
      }

    if(info.settings)
      try{
        settings = require(info.settings)(this);
      }catch(err){
        debug('verbose', 'Settings not loaded!');
      }

    if(info.client)
      try{
        client = require(info.client)(this);
      }catch(err){
        debug('verbose', 'Client not loaded!');
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

