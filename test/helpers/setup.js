require("mocha-as-promised")();

var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");

global.should = chai.should();
chai.use(chaiAsPromised);