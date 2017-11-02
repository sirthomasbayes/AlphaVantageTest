import * as React from 'react';
import { IMetadata, ITimeSeriesData } from './IApiProvider'

let isNullOrUndefined = (elem:any) => elem === null || elem === undefined;

// dummy classes created to allow enumeration of interface properties once 
// (as opposed to enumerating on every function call)
class MetadataSchema implements IMetadata {
	information:string;
	symbol: string;
	lastRefreshed: Date;
	interval: string;
	outputSize: string;
	timezone: string;	
}

class TimeSeriesDataSchema implements ITimeSeriesData {
	datetime:Date;
	open:number;
	high:number;
	low:number;
	volume:number;
}

let dummyMetadata = new MetadataSchema(),
	dummyTimeSeriesData = new TimeSeriesDataSchema(),
	metadataKeys = new Array<string>(),
	timeSeriesDataKeys = new Array<string>();

for (let key in dummyMetadata) { metadataKeys.push(key); }
for (let key in dummyTimeSeriesData) { timeSeriesDataKeys.push(key); }

interface IMetadataTableProps {
	metadata: IMetadata;
}

let TimeSeriesMetadataTable = ({ metadata } : IMetadataTableProps) => {
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

let TimeSeriesDataPointRow = ({ dataPoint } : ITimeSeriesDataPointProps) => {
	return (
		<tr>
			{ timeSeriesDataKeys.map((elem, index) => <td key={`timeseries_value_${index}`}>{ !isNullOrUndefined(dataPoint[elem]) ? dataPoint[elem].toString() : '' }</td>) }
		</tr>
	);
};

interface ITimeSeriesDataTableProps {
	dataPoints: Array<ITimeSeriesData>;
}

let TimeSeriesDataTable = ({ dataPoints } : ITimeSeriesDataTableProps) => {
	return (
		<table>
			<thead>
				{ timeSeriesDataKeys.map((elem, index) => <tr key={`timeseries_header_${index}`}>{elem}</tr>) }
			</thead>

			<tbody>
				{ dataPoints.map((elem, index) => <TimeSeriesDataPointRow dataPoint={elem} key={`timeseries_data_${index}`} />) }
			</tbody>
		</table>
	);
};

export { TimeSeriesMetadataTable, TimeSeriesDataTable };