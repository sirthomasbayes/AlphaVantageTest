import * as React from 'react';
import { IMetadata, ITimeSeriesData } from './IApiProvider'

/*
	exported modules:

	<TimeSeriesMetadataTable metadata={ IMetadata } /> - displays metadata table.
	<TimeSeriesDataTable dataPoints={ Array<ITimeSeriesData> } /> - displays time series data table.
*/

let isNullOrUndefined = (elem:any) => elem === null || elem === undefined;

// dummy class created to allow enumeration of interface properties once 
// (as opposed to enumerating on every function call)
class MetadataSchema implements IMetadata {
	constructor() {
		this.information = '';
		this.symbol = '';
		this.lastRefreshed = new Date();
		this.interval = '';
		this.outputSize = '';
		this.timezone = '';
	}

	information:string;
	symbol: string;
	lastRefreshed: Date;
	interval: string;
	outputSize: string;
	timezone: string;	
}

// dummy class created to allow enumeration of interface properties once 
// (as opposed to enumerating on every function call)
class TimeSeriesDataSchema implements ITimeSeriesData {
	constructor() {
		this.datetime = new Date();
		this.open = 1;
		this.high = 1;
		this.low = 1;
		this.volume = 1;
	}

	datetime:Date;
	open:number;
	high:number;
	low:number;
	volume:number;
}

// generating property keys
let dummyMetadata = new MetadataSchema(),
	dummyTimeSeriesData = new TimeSeriesDataSchema(),
	metadataKeys = new Array<string>(),
	timeSeriesDataKeys = new Array<string>();

for (let key in dummyMetadata) { metadataKeys.push(key); }
for (let key in dummyTimeSeriesData) { timeSeriesDataKeys.push(key); }

interface IMetadataTableProps {
	metadata: IMetadata;
}

const TimeSeriesMetadataTable = ({ metadata } : IMetadataTableProps) => {
	if (!metadata) return null;

	return (
		<table>
			<thead>
				<tr>
					{ metadataKeys.map((elem,index) => <th key={`metadata_header_${index}`}>{elem}</th>) }
				</tr>
			</thead>
			<tbody>
				<tr>
					{ metadataKeys.map((elem,index) => <td key={`metadata_value_${index}`}>{!isNullOrUndefined(metadata[elem]) ? metadata[elem].toString() : ''}</td>) }
				</tr>
			</tbody>
		</table>
	);	
};

interface ITimeSeriesDataPointProps {
	dataPoint: ITimeSeriesData
}

const TimeSeriesDataPointRow = ({ dataPoint } : ITimeSeriesDataPointProps) => {
	return (
		<tr>
			{ timeSeriesDataKeys.map((elem, index) => <td key={`timeseries_value_${index}`}>{ !isNullOrUndefined(dataPoint[elem]) ? dataPoint[elem].toString() : '' }</td>) }
		</tr>
	);
};

interface ITimeSeriesDataTableProps {
	dataPoints?: Array<ITimeSeriesData>;
}

const TimeSeriesDataTable = ({ dataPoints } : ITimeSeriesDataTableProps) => {
	if (!dataPoints || dataPoints.length === 0) return null;

	return (
		<table>
			<thead>
				<tr>
					{ timeSeriesDataKeys.map((elem, index) => <th key={`timeseries_header_${index}`}>{elem}</th>) }
				</tr>
			</thead>

			<tbody>
				{ dataPoints.map((elem, index) => <TimeSeriesDataPointRow dataPoint={elem} key={`timeseries_data_${index}`} />) }
			</tbody>
		</table>
	);
};

export { TimeSeriesMetadataTable, TimeSeriesDataTable };