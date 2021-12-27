import Logger from "./Logger";
import { LogRecord } from "./Logger.d";
import { AWSTimestreamLoggerConfig } from "./AWSTimestreamLogger.d";
import {
  MeasureValue,
  TimestreamWriteClient,
  WriteRecordsCommand,
  _Record,
} from "@aws-sdk/client-timestream-write";

class AWSTimestreamLogger extends Logger {
  private _client;
  private _databaseName;
  private _tableName;

  constructor(config: AWSTimestreamLoggerConfig) {
    super();
    this._databaseName = config.databaseName;
    this._tableName = config.tableName;

    this._client = new TimestreamWriteClient({
      credentials: {
        accessKeyId: process.env.AWSAccessKeyId,
        secretAccessKey: process.env.AWSSecretKey,
      },
    });
  }

  log(records: LogRecord[]): void {
    try {
      const logRecords: _Record[] = records.map((record) => ({
        MeasureName: record.key,
        MeasureValue: record.value,
        Dimensions: record.metadata.map((metadata) => ({
          Name: metadata.key,
          Value: metadata.value,
        })),
      }));

      const command = new WriteRecordsCommand({
        DatabaseName: this._databaseName,
        TableName: this._tableName,
        Records: logRecords,
      });
      const res = this._client.send(command);
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }
}

export default AWSTimestreamLogger;
