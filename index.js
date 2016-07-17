var debug = require('debug')('jsaturday::factory');

// -----------------------------------------------------------
// This is a draft!
// -----------------------------------------------------------

module.exports = function JSaturdayModule(settings, info){

  // INFO CHECKS
  // ...

  // SETTINGS CHECKS
  // ...

  debug('info', 'Loading module ' + info.name + ' ...');

  this.api = undefined;
  this.modules = undefined;
  this.settings = undefined;
  this.info = info;

  // REQUIREMENTS CHECKS
  // ...

  if(info.api)
    try{
      this.api = require(info.api);
      // API CHECKS
      // ...
    }catch(err){
      debug('warning', 'Api not loaded!')
    }

  if(info.lib)
    try{
      // LIBs CHECKS
      // ...
      this.lib = require(info.lib);
    }catch(err){
      debug('warning', 'Lib not loaded!')
    }

  if(info.settings)
    try{
      this.settings = require(info.settings);
    }catch(err){
      debug('warning', 'Settings not loaded!')
    }

  return {
    name: this.info.name,
    api: this.api,
    lib: this.lib,
    settings: this.settings
  }

}
