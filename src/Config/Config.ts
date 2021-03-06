/**
 * BIG IMPORTANT TODO:
 *
 * Need to parse IOs, then parse their Integrations/Sensors and attach instance
 * of that IO to them. Keep IO injectable, but flow nicely in the config
 */

import * as fs from "fs";
import ControllinoMegaIO from "../IO/ControllinoMegaIO";
import IO from "../IO/IO.d";
import FurnaceAirConditioner from "../Integration/FurnaceAirConditioner";
import RuuvitagSensor from "../Sensor/RuuvitagSensor";
import Sensor from "../Sensor/Sensor";
// import SoilMoistureSensor from "../Sensor/SoilMoistureSensor";

import {
  ConfigFile,
  ConfigIntegration,
  ConfigIO,
  ConfigLogger,
  ConfigSensor,
} from "./Config.d";
import Integration from "../Integration/Integration";
import Logger from "../Logger/Logger";
import AWSTimestreamLogger from "../Logger/AWSTimestreamLogger";
import ConsoleLogger from "../Logger/ConsoleLogger";

class Config {
  private _loggers: Logger[];
  private _sensors: Sensor[];
  // private _integrations: Integration[];
  // private _io: any[];

  constructor(configFilePath: string) {
    const { loggers, sensors } = this.parseConfigFile(configFilePath);

    this._loggers = loggers;
    this._sensors = sensors;
    // this._io = io;
    // this._integrations = integrations;
  }

  private parseConfigFile(configFilePath: string) {
    const rawData: Buffer = fs.readFileSync(configFilePath);
    const config: ConfigFile = JSON.parse(rawData.toString());

    return {
      loggers: this.parseLoggers(config.loggers),
      sensors: this.parseSensors(config.sensors),
      // integrations: this.parseIntegrations(config.integrations),
      // io: this.parseIO(config.io),
    };
  }

  // private parseIO(ioList: ConfigIO[]): any[] {
  //   const ios = new Map<string, any>([
  //     ["ControllinoMegaIO", ControllinoMegaIO],
  //   ]);
  //   return ioList.map(({ type }) => {
  //     if (ios.has(type)) {
  //       return new (ios.get(type))();
  //     }
  //   });
  // }

  // private parseIntegrations(integrationList: ConfigIntegration[]) {
  //   // TODO: this should be a class that implements IIO, not any
  //   const integrations = new Map<string, any>([
  //     ["FurnaceAirConditioner", FurnaceAirConditioner],
  //   ]);

  //   return integrationList.map(({ type, id }) => {
  //     if (integrations.has(type)) {
  //       console.log(integrations.get(type));
  //       return new (integrations.get(type))(id, new ControllinoMegaIO()); // TODO: How do we determine which IO to use?? Controllino + Ruuvitag??
  //     }
  //   });
  // }

  private parseLoggers(loggerList: ConfigLogger[]) {
    const loggers = new Map<string, any>([
      ["timestream", AWSTimestreamLogger],
      ["console", ConsoleLogger],
    ]);

    return loggerList.map(({ type, options = {} }) => {
      if (loggers.has(type)) {
        return new (loggers.get(type))(options);
      }
    });
  }

  private parseSensors(sensorList: ConfigSensor[]) {
    // TODO: this should be a class that implements IIO, not any
    const sensors = new Map<string, any>([
      ["ruuvitag", RuuvitagSensor],
      // ["SoilMoisture", SoilMoistureSensor],
    ]);

    // TODO: this map function is repeated, very basic.
    return sensorList.map(({ type, options }) => {
      if (sensors.has(type)) {
        return new (sensors.get(type))(options);
      }
    });
  }

  // public get io() {
  //   return this._io;
  // }

  // public get integrations() {
  //   return this._integrations;
  // }

  public get loggers() {
    return this._loggers;
  }

  public get sensors() {
    return this._sensors;
  }
}

export default Config;
